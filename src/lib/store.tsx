"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { generateIdeas } from "./engine/generate";
import { nextQuestion } from "./engine/questions";
import { emptyProfile, type Idea, type Profile, type Question } from "./engine/types";
import { isSupabaseConfigured, supabase } from "./supabase";

const KEY = "kindling.v1";

type Persisted = {
  profile: Profile;
  /** Every fingerprint ever shown. This is what makes ideas never repeat. */
  seen: string[];
  saved: Idea[];
  batch: Idea[];
};

const blank = (): Persisted => ({ profile: emptyProfile(), seen: [], saved: [], batch: [] });

function load(): Persisted {
  if (typeof window === "undefined") return blank();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      profile: { ...emptyProfile(), ...(parsed.profile ?? {}) },
      seen: parsed.seen ?? [],
      saved: parsed.saved ?? [],
      batch: parsed.batch ?? [],
    };
  } catch {
    return blank();
  }
}

type Ctx = {
  ready: boolean;
  profile: Profile;
  question: Question | null;
  batch: Idea[];
  saved: Idea[];
  seenCount: number;
  exhausted: boolean;
  generating: boolean;
  canGoBack: boolean;
  session: Session | null;
  cloudEnabled: boolean;
  answer: (q: Question, value: string | string[]) => void;
  skip: (q: Question) => void;
  back: () => void;
  restart: () => void;
  generate: () => void;
  isSaved: (id: string) => boolean;
  toggleSave: (idea: Idea) => void;
  removeSaved: (id: string) => void;
  signOut: () => Promise<void>;
};

const KindlingContext = createContext<Ctx | null>(null);

export function KindlingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(blank);
  const [ready, setReady] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const history = useRef<Profile[]>([]);
  const mergedFor = useRef<string | null>(null);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Private mode or a full disk. Everything still works for this session.
    }
  }, [state, ready]);

  /* ── auth + cloud sync ─────────────────────────────────────────────────── */

  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // On sign-in, fold everything made as a guest into the account, then pull
  // down whatever that account already had. Nothing is ever lost in the swap.
  useEffect(() => {
    const sb = supabase();
    if (!sb || !session?.user || !ready) return;
    if (mergedFor.current === session.user.id) return;
    mergedFor.current = session.user.id;

    (async () => {
      const guestSaved = state.saved;
      const guestSeen = state.seen;

      if (guestSaved.length) {
        await sb.from("saved_ideas").upsert(
          guestSaved.map((i) => ({ user_id: session.user.id, idea_id: i.id, payload: i })),
          { onConflict: "user_id,idea_id" },
        );
      }
      if (guestSeen.length) {
        await sb.from("seen_ideas").upsert(
          guestSeen.map((id) => ({ user_id: session.user.id, idea_id: id })),
          { onConflict: "user_id,idea_id" },
        );
      }

      const [{ data: remoteSaved }, { data: remoteSeen }] = await Promise.all([
        sb.from("saved_ideas").select("payload").eq("user_id", session.user.id),
        sb.from("seen_ideas").select("idea_id").eq("user_id", session.user.id),
      ]);

      setState((s) => {
        const savedById = new Map(s.saved.map((i) => [i.id, i]));
        for (const row of remoteSaved ?? []) {
          const idea = row.payload as Idea;
          if (idea?.id) savedById.set(idea.id, idea);
        }
        const seen = new Set(s.seen);
        for (const row of remoteSeen ?? []) seen.add(row.idea_id as string);
        return { ...s, saved: [...savedById.values()], seen: [...seen] };
      });
    })();
  }, [session, ready, state.saved, state.seen]);

  const pushRemote = useCallback(
    async (table: "saved_ideas" | "seen_ideas", rows: Record<string, unknown>[]) => {
      const sb = supabase();
      if (!sb || !session?.user || !rows.length) return;
      await sb.from(table).upsert(rows, { onConflict: "user_id,idea_id" });
    },
    [session],
  );

  /* ── flow ──────────────────────────────────────────────────────────────── */

  const question = useMemo(() => (ready ? nextQuestion(state.profile) : null), [state.profile, ready]);

  const applyToProfile = useCallback((q: Question, value: string | string[]) => {
    setState((s) => {
      history.current = [...history.current, s.profile];
      const profile: Profile = { ...s.profile, [q.field]: value } as Profile;
      // Answering a question un-skips it, so Back → change answer works.
      profile.skipped = s.profile.skipped.filter((id) => id !== q.id);
      return { ...s, profile };
    });
  }, []);

  const answer = useCallback(
    (q: Question, value: string | string[]) => applyToProfile(q, value),
    [applyToProfile],
  );

  const skip = useCallback((q: Question) => {
    setState((s) => {
      history.current = [...history.current, s.profile];
      return { ...s, profile: { ...s.profile, skipped: [...s.profile.skipped, q.id] } };
    });
  }, []);

  const back = useCallback(() => {
    const prev = history.current.at(-1);
    if (!prev) return;
    history.current = history.current.slice(0, -1);
    setState((s) => ({ ...s, profile: prev }));
  }, []);

  const restart = useCallback(() => {
    history.current = [];
    setExhausted(false);
    // Seen ideas and the saved library deliberately survive a restart: that is
    // the whole point of never showing the same idea twice.
    setState((s) => ({ ...s, profile: emptyProfile(), batch: [] }));
  }, []);

  const generate = useCallback(() => {
    setGenerating(true);
    // Yield a frame so the loading state is visible on fast machines.
    setTimeout(() => {
      setState((s) => {
        const seen = new Set(s.seen);
        const { ideas, exhausted: ex } = generateIdeas(s.profile, seen, 6, String(Date.now()));
        setExhausted(ex);
        const nextSeen = [...seen, ...ideas.map((i) => i.id)];
        void pushRemote(
          "seen_ideas",
          session?.user ? ideas.map((i) => ({ user_id: session.user.id, idea_id: i.id })) : [],
        );
        return { ...s, batch: ideas, seen: [...new Set(nextSeen)] };
      });
      setGenerating(false);
    }, 260);
  }, [pushRemote, session]);

  const isSaved = useCallback((id: string) => state.saved.some((i) => i.id === id), [state.saved]);

  const toggleSave = useCallback(
    (idea: Idea) => {
      setState((s) => {
        const exists = s.saved.some((i) => i.id === idea.id);
        if (exists) {
          const sb = supabase();
          if (sb && session?.user) {
            void sb
              .from("saved_ideas")
              .delete()
              .eq("user_id", session.user.id)
              .eq("idea_id", idea.id);
          }
          return { ...s, saved: s.saved.filter((i) => i.id !== idea.id) };
        }
        void pushRemote(
          "saved_ideas",
          session?.user ? [{ user_id: session.user.id, idea_id: idea.id, payload: idea }] : [],
        );
        return { ...s, saved: [idea, ...s.saved] };
      });
    },
    [pushRemote, session],
  );

  const removeSaved = useCallback(
    (id: string) => {
      const sb = supabase();
      if (sb && session?.user) {
        void sb.from("saved_ideas").delete().eq("user_id", session.user.id).eq("idea_id", id);
      }
      setState((s) => ({ ...s, saved: s.saved.filter((i) => i.id !== id) }));
    },
    [session],
  );

  const signOut = useCallback(async () => {
    const sb = supabase();
    if (!sb) return;
    await sb.auth.signOut();
    mergedFor.current = null;
  }, []);

  const value: Ctx = {
    ready,
    profile: state.profile,
    question,
    batch: state.batch,
    saved: state.saved,
    seenCount: state.seen.length,
    exhausted,
    generating,
    canGoBack: history.current.length > 0,
    session,
    cloudEnabled: isSupabaseConfigured,
    answer,
    skip,
    back,
    restart,
    generate,
    isSaved,
    toggleSave,
    removeSaved,
    signOut,
  };

  return <KindlingContext.Provider value={value}>{children}</KindlingContext.Provider>;
}

export function useKindling(): Ctx {
  const ctx = useContext(KindlingContext);
  if (!ctx) throw new Error("useKindling must be used inside <KindlingProvider>");
  return ctx;
}
