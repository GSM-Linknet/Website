/**
 * useCoverageMap
 *
 * Tujuan     : Custom hook untuk mengelola state dan data fetching fitur Coverage Map.
 * Dipakai oleh: CoverageMapPage
 * Dependensi : LinkNetService.suggestAddress, LinkNetService.nearestAddress
 * Fungsi utama:
 *   - suggestByAddress(query)      — debounced keyword search ke Linknet address suggest API
 *   - suggestByCoordinate(lat,lng) — coordinate-based nearest address search
 *   - focusItem(item)              — fly-to lokasi spesifik dari list row click
 *   - reset()                      — clear results & mode
 * Side effect: HTTP GET ke /linknet/addresses/suggest dan /addresses/nearest via backend
 */

import { useState, useRef, useCallback } from "react";
import {
  LinkNetService,
  type LinknetAddress,
} from "@/services/linknet.service";

export type SearchMode = "idle" | "address" | "coordinate";

export interface CoverageMapState {
  results: LinknetAddress[];
  loading: boolean;
  searchMode: SearchMode;
  searchQuery: string;
  clickedCoord: { lat: number; lng: number } | null;
  focusedItem: LinknetAddress | null;
}

const DEBOUNCE_MS = 400;

export function useCoverageMap() {
  const [results, setResults] = useState<LinknetAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [clickedCoord, setClickedCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [focusedItem, setFocusedItem] = useState<LinknetAddress | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Debounced keyword search — triggers Linknet suggest API */
  const suggestByAddress = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setSearchMode("idle");
      setClickedCoord(null);
      setFocusedItem(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setSearchMode("address");
        setClickedCoord(null);
        setFocusedItem(null);
        const res = await LinkNetService.suggestAddress(query.trim());
        const data = res.data as any;
        setResults(data?.addresses ?? []);
      } catch (err) {
        console.error("[useCoverageMap] suggestByAddress failed", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  /** Coordinate search — triggers Linknet nearest API */
  const suggestByCoordinate = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setSearchMode("coordinate");
      setSearchQuery("");
      setClickedCoord({ lat, lng });
      setFocusedItem(null);
      const res = await LinkNetService.nearestAddress(lat, lng);
      const data = res.data as any;
      setResults(data?.addresses ?? []);
    } catch (err) {
      console.error("[useCoverageMap] suggestByCoordinate failed", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fly-to lokasi spesifik dari klik baris list view.
   * Set focusedItem → CoverageMarkerLayer akan fly-to koordinatnya.
   */
  const focusItem = useCallback((item: LinknetAddress) => {
    setFocusedItem({ ...item });
  }, []);

  /** Reset all state */
  const reset = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setResults([]);
    setLoading(false);
    setSearchMode("idle");
    setSearchQuery("");
    setClickedCoord(null);
    setFocusedItem(null);
  }, []);

  return {
    results,
    loading,
    searchMode,
    searchQuery,
    clickedCoord,
    focusedItem,
    suggestByAddress,
    suggestByCoordinate,
    focusItem,
    reset,
  };
}
