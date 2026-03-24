"use client";

import { useState, useEffect, useCallback } from "react";
import { getVenueCheckIns, type CheckIn, type VibeSummary } from "@/lib/api";

type State = {
  checkIns: CheckIn[];
  summary: VibeSummary;
  loading: boolean;
  error: string | null;
};

export function useCheckins(venueId: string, pollIntervalMs = 60_000) {
  const [state, setState] = useState<State>({
    checkIns: [],
    summary: null,
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    const res = await getVenueCheckIns(venueId);
    if (res.success) {
      setState({
        checkIns: res.data.checkIns,
        summary: res.data.summary,
        loading: false,
        error: null,
      });
    } else {
      setState((s) => ({ ...s, loading: false, error: res.error }));
    }
  }, [venueId]);

  useEffect(() => {
    void fetch();
    const interval = setInterval(() => void fetch(), pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetch, pollIntervalMs]);

  return { ...state, refresh: fetch };
}
