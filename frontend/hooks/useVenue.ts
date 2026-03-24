"use client";

import { useState, useEffect } from "react";
import { getVenue, type Venue, type VibeSummary } from "@/lib/api";

type State = {
  venue: Venue | null;
  summary: VibeSummary;
  loading: boolean;
  error: string | null;
};

export function useVenue(id: string) {
  const [state, setState] = useState<State>({
    venue: null,
    summary: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    getVenue(id).then((res) => {
      if (res.success) {
        setState({
          venue: res.data.venue,
          summary: res.data.summary,
          loading: false,
          error: null,
        });
      } else {
        setState((s) => ({ ...s, loading: false, error: res.error }));
      }
    });
  }, [id]);

  return state;
}
