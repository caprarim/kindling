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
import { generateIdeas } from "./engine/generate";
import { applyReading, nextQuestion } from "./engine/questions";
import { blankValue } from "./engine/summary";
import { emptyProfile, type Idea, type Profile, type Question } from "./engine/types";
import {
  createAccount,
  deleteSaved,
  fetchState,
  isCloudConfigured,
  loadToken,
  storeToken,
  syncState,
} from "./api";

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
  seen: string[];
  seenCount: number;
  exhausted: boolean;
  generating: boolean;
  canGoBack: boolean;
  /** Present when signed in. This is the bearer token, not any of the data. */
  token: string | null;
  syncing: boolean;
  syncError: string | null;
  cloudEnabled: boolean;
  createNewAccount: () => Promise<string>;
  signInWithCode: (code: string) => Promise<void>;
  answer: (q: Question, value: string | string[]) => void;
  skip: (q: Question) => void;
  reopen: (field: keyof Profile, questionIds: string[]) => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const history = useRef<Profile[]>([]);
  const mergedFor = useRef<string | null>(null);

  useEffect(() => {
    setState(load());
    setToken(loadToken());
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

  /* ── account + server sync ─────────────────────────────────────────────── */

  /** Writes whatever the server returned over the top of local state. */
  const absorb = useCallback((remote: { saved: Idea[]; seen: string[] }) => {
    setState((s) => {
      const savedById = new Map(s.saved.map((i) => [i.id, i]));
      for (const idea of remote.saved) if (idea?.id) savedById.set(idea.id, idea);
      return {
        ...s,
        saved: [...savedById.values()],
        seen: [...new Set([...s.seen, ...remote.seen])],
      };
    });
  }, []);

  // First sync after a token appears: everything built up as a guest goes up,
  // and whatever the account already had comes down. Nothing is lost either way.
  useEffect(() => {
    if (!ready || !token || mergedFor.current === token) return;
    mergedFor.current = token;

    (async () => {
      setSyncing(true);
      setSyncError(null);
      try {
        const remote = await syncState(token, state.saved, state.seen);
        absorb(remote);
      } catch (err) {
        setSyncError(err instanceof Error ? err.message : "Sync failed.");
        mergedFor.current = null;
      } finally {
        setSyncing(false);
      }
    })();
    // Only the token should retrigger this; state is read as it stands at the time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ready, absorb]);

  /** Fire-and-forget push. The server merges, so a dropped call is not fatal. */
  const pushRemote = useCallback(
    (saved: Idea[], seen: string[]) => {
      if (!token) return;
      syncState(token, saved, seen).catch(() => {
        // Next save or generate will carry it up. Never block the UI on this.
      });
    },
    [token],
  );

  const createNewAccount = useCallback(async () => {
    const code = await createAccount();
    storeToken(code);
    setToken(code);
    return code;
  }, []);

  const signInWithCode = useCallback(
    async (code: string) => {
      // Reject the code before storing it, so a typo can't half-sign-you-in.
      const remote = await fetchState(code);
      storeToken(code);
      setToken(code);
      absorb(remote);
    },
    [absorb],
  );

  /* ── flow ──────────────────────────────────────────────────────────────── */

  const question = useMemo(() => (ready ? nextQuestion(state.profile) : null), [state.profile, ready]);

  const applyToProfile = useCallback((q: Question, value: string | string[]) => {
    setState((s) => {
      history.current = [...history.current, s.profile];
      // The description answers several questions at once, so it writes all of
      // them and the engine never asks again.
      const profile: Profile =
        q.field === "ideaText" && typeof value === "string"
          ? applyReading(s.profile, value)
          : ({ ...s.profile, [q.field]: value } as Profile);
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
      // Generation happens outside the state updater: updaters must stay pure,
      // and React double-invokes them in development.
      setState((current) => {
        const seen = new Set(current.seen);
        const { ideas, exhausted: ex } = generateIdeas(
          current.profile,
          seen,
          3,
          String(Date.now()),
        );
        const nextSeen = [...new Set([...seen, ...ideas.map((i) => i.id)])];
        queueMicrotask(() => {
          setExhausted(ex);
          // Record the newly-shown fingerprints server-side straight away, so
          // another device never re-offers them.
          pushRemote(current.saved, nextSeen);
        });
        return { ...current, batch: ideas, seen: nextSeen };
      });
      setGenerating(false);
    }, 260);
  }, [pushRemote]);

  /** Clear one answer so the engine asks that question again. */
  const reopen = useCallback((field: keyof Profile, questionIds: string[]) => {
    setState((s) => {
      history.current = [...history.current, s.profile];
      return {
        ...s,
        profile: {
          ...s.profile,
          [field]: blankValue(field),
          skipped: s.profile.skipped.filter((id) => !questionIds.includes(id)),
        } as Profile,
      };
    });
  }, []);

  const isSaved = useCallback((id: string) => state.saved.some((i) => i.id === id), [state.saved]);

  const removeSaved = useCallback(
    (id: string) => {
      // Sync only ever adds, so a removal needs its own call.
      if (token) void deleteSaved(token, id).catch(() => {});
      setState((s) => ({ ...s, saved: s.saved.filter((i) => i.id !== id) }));
    },
    [token],
  );

  const toggleSave = useCallback(
    (idea: Idea) => {
      setState((s) => {
        if (s.saved.some((i) => i.id === idea.id)) {
          if (token) void deleteSaved(token, idea.id).catch(() => {});
          return { ...s, saved: s.saved.filter((i) => i.id !== idea.id) };
        }
        const saved = [idea, ...s.saved];
        queueMicrotask(() => pushRemote(saved, s.seen));
        return { ...s, saved };
      });
    },
    [pushRemote, token],
  );

  /** Forgets the code on this device. The account and its data are untouched. */
  const signOut = useCallback(async () => {
    storeToken(null);
    setToken(null);
    mergedFor.current = null;
    setSyncError(null);
  }, []);

  const value: Ctx = {
    ready,
    profile: state.profile,
    question,
    batch: state.batch,
    saved: state.saved,
    seen: state.seen,
    seenCount: state.seen.length,
    exhausted,
    generating,
    canGoBack: history.current.length > 0,
    token,
    syncing,
    syncError,
    cloudEnabled: isCloudConfigured,
    createNewAccount,
    signInWithCode,
    answer,
    skip,
    reopen,
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
