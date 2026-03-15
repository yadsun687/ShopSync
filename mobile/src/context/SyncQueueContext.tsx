import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { getSyncQueue, processSyncQueue } from "../services/syncQueue";

type SyncQueueContextValue = {
  queueSize: number;
  syncing: boolean;
  syncNow: () => Promise<void>;
  refreshQueueSize: () => Promise<void>;
};

const SyncQueueContext = createContext<SyncQueueContextValue | null>(null);

export const SyncQueueProvider = ({ children }: { children: React.ReactNode }) => {
  const [queueSize, setQueueSize] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const refreshQueueSize = async () => {
    const queue = await getSyncQueue();
    setQueueSize(queue.length);
  };

  const syncNow = async () => {
    setSyncing(true);
    try {
      await processSyncQueue();
      await refreshQueueSize();
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void refreshQueueSize();
    void syncNow();

    const interval = setInterval(() => {
      void syncNow();
    }, 10000);

    const sub = AppState.addEventListener("change", (nextState) => {
      const wasBackground = appStateRef.current.match(/inactive|background/);
      if (wasBackground && nextState === "active") {
        void syncNow();
      }
      appStateRef.current = nextState;
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  const value = useMemo(
    () => ({ queueSize, syncing, syncNow, refreshQueueSize }),
    [queueSize, syncing]
  );

  return <SyncQueueContext.Provider value={value}>{children}</SyncQueueContext.Provider>;
};

export const useSyncQueue = () => {
  const ctx = useContext(SyncQueueContext);
  if (!ctx) throw new Error("useSyncQueue must be used inside SyncQueueProvider");
  return ctx;
};
