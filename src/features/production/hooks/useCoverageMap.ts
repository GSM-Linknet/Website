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
import { LocalCoverageService, type LocalCoverageData } from "@/services/coverage.service";

export type SearchMode = "idle" | "address" | "coordinate";
export type SearchSource = "linknet" | "local";

const mapLocalToLinknet = (local: LocalCoverageData): LinknetAddress => ({
  site_id: local.externalId || local.id,
  address: local.name || local.metadata?.STREET_NAME || "Local Marker",
  status: local.status || "AVAILABLE",
  latitude: local.lat,
  longitude: local.lng,
  network_type: local.metadata?.NETWORK_TYPE || "LOCAL",
  site_latitude: local.lat,
  site_longitude: local.lng,
  dwell_type: local.metadata?.DWELL_TYPE || "-",
  network_id: local.metadata?.NETWORK_ID || "-",
  fat_code: local.metadata?.FAT_CODE || "-",
  providers: "LOCAL",
});

export interface CoverageMapState {
  results: LinknetAddress[];
  loading: boolean;
  searchMode: SearchMode;
  searchQuery: string;
  searchSource: SearchSource;
  clickedCoord: { lat: number; lng: number } | null;
  focusedItem: LinknetAddress | null;
}

const DEBOUNCE_MS = 400;

export function useCoverageMap() {
  const [results, setResults] = useState<LinknetAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSource, setSearchSource] = useState<SearchSource>("linknet");
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

        const trimQuery = query.trim();
        const coordMatch = trimQuery.match(/^([-+]?\d+(\.\d+)?)\s*,\s*([-+]?\d+(\.\d+)?)$/);

        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lng = parseFloat(coordMatch[3]);
          setSearchMode("coordinate");
          setClickedCoord({ lat, lng });

          if (searchSource === "linknet") {
            const res = await LinkNetService.nearestAddress(lat, lng);
            const data = res.data as any;
            setResults(data?.addresses ?? []);
          } else {
            const res = await LocalCoverageService.findAll({ lat, lng, radius: 5, take: 50 });
            const items = res.data?.items ?? [];
            setResults(items.map(mapLocalToLinknet));
          }
        } else {
          if (searchSource === "linknet") {
            const res = await LinkNetService.suggestAddress(trimQuery);
            const data = res.data as any;
            setResults(data?.addresses ?? []);
          } else {
            const res = await LocalCoverageService.findAll({ name: trimQuery, take: 50 });
            const items = res.data?.items ?? [];
            setResults(items.map(mapLocalToLinknet));
          }
        }
      } catch (err) {
        console.error("[useCoverageMap] suggestByAddress failed", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  /** Coordinate search — triggers Linknet nearest API or Local radius API */
  const suggestByCoordinate = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setSearchMode("coordinate");
      setSearchQuery("");
      setClickedCoord({ lat, lng });
      setFocusedItem(null);

      if (searchSource === "linknet") {
        const res = await LinkNetService.nearestAddress(lat, lng);
        const data = res.data as any;
        setResults(data?.addresses ?? []);
      } else {
        const res = await LocalCoverageService.findAll({ lat, lng, radius: 5, take: 50 });
        const items = res.data?.items ?? [];
        setResults(items.map(mapLocalToLinknet));
      }
    } catch (err) {
      console.error("[useCoverageMap] suggestByCoordinate failed", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchSource]);

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
    searchSource,
    clickedCoord,
    focusedItem,
    suggestByAddress,
    suggestByCoordinate,
    focusItem,
    reset,
    setSearchSource,
  };
}
