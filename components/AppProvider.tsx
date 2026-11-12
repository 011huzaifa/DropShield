"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LISTINGS } from "@/data/listings";

export type StatusFilter = "all" | "open" | "points" | "unconfirmed" | "ended" | "tracked";

type Ctx = {
  now: number;
  tracked: string[];
  done: Record<string, number[]>;
  filter: StatusFilter;
  setFilter: (f: StatusFilter) => void;
  showList: (f: StatusFilter) => void;
  toggleTrack: (id: string) => void;
  setTaskDone: (id: string, i: number, on: boolean) => void;
  toast: (msg: string) => void;
  bump: boolean;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ serverNow, children }: { serverNow: number; children: ReactNode }) {
  const [now, setNow] = useState(serverNow);
  const [tracked, setTracked] = useState<string[]>([]);
  const [done, setDone] = useState<Record<string, number[]>>({});
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [msg, setMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [bump, setBump] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loaded = useRef(false);

  useEffect(() => {
    setNow(Date.now());
    const iv = setInterval(() => setNow(Date.now()), 5 * 60 * 1000);
    const ids = new Set(LISTINGS.map((l) => l.id));
    const t = readJSON<string[]>("ds_tracked", []);
    setTracked(Array.isArray(t) ? t.filter((id) => ids.has(id)) : []);
    const d = readJSON<Record<string, number[]>>("ds_done", {});
    setDone(d && typeof d === "object" ? d : {});
    loaded.current = true;
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem("ds_tracked", JSON.stringify(tracked));
      localStorage.setItem("ds_done", JSON.stringify(done));
    } catch {
      /* storage can be blocked; the page still works */
    }
  }, [tracked, done]);

  const toast = useCallback((m: string) => {
    setMsg(m);
    setShowToast(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShowToast(false), 2600);
  }, []);

  const toggleTrack = useCallback(
    (id: string) => {
      setTracked((cur) => {
        const has = cur.includes(id);
        toast(has ? "Removed from your list" : "Added to your list. Saved on this device.");
        return has ? cur.filter((x) => x !== id) : [...cur, id];
      });
      setBump(true);
      setTimeout(() => setBump(false), 260);
    },
    [toast],
  );

  const setTaskDone = useCallback((id: string, i: number, on: boolean) => {
    setDone((cur) => {
      const arr = (cur[id] ?? []).filter((x) => x !== i);
      if (on) arr.push(i);
      return { ...cur, [id]: arr };
    });
  }, []);

  const showList = useCallback((f: StatusFilter) => {
    setFilter(f);
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const value = useMemo(
    () => ({ now, tracked, done, filter, setFilter, showList, toggleTrack, setTaskDone, toast, bump }),
    [now, tracked, done, filter, showList, toggleTrack, setTaskDone, toast, bump],
  );

  return (
    <AppCtx.Provider value={value}>
      {children}
      <div className={"toast" + (showToast ? " show" : "")} role="status">
        {msg}
      </div>
    </AppCtx.Provider>
  );
}
