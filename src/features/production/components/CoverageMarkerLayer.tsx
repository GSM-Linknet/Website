/**
 * CoverageMarkerLayer
 *
 * Tujuan     : Render marker coverage dari data LinknetAddress di peta.
 *              Mengelompokkan marker yang berbagi koordinat FAT node yang sama
 *              menjadi satu "cluster marker" dengan badge jumlah, agar tidak
 *              membentuk lingkaran visual yang membingungkan.
 * Dipakai oleh: CoverageMapPage (di dalam MapContainer)
 * Dependensi : react-leaflet (Marker, Popup, useMap), leaflet (DivIcon), LinknetAddress type
 * Fungsi utama:
 *   - groupByCoord()       — kelompokkan marker berdasarkan koordinat FAT node
 *   - buildHouseIcon()     — DivIcon SVG rumah (tunggal, berwarna status)
 *   - buildClusterIcon()   — DivIcon SVG cluster (multi homepass satu node)
 *   - CoverageMarkerLayer  — render marker + auto fly-to saat searchKey/focusTarget berubah
 * Side effect: Modifikasi Leaflet map viewport (flyTo) saat searchKey atau focusTarget berubah
 */

import { useEffect, useRef, useMemo } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LinknetAddress } from "@/services/linknet.service";
import type { SearchMode } from "../hooks/useCoverageMap";

interface CoverageMarkerLayerProps {
  results: LinknetAddress[];
  searchMode: SearchMode;
  searchKey: string;
  /** Item spesifik yang harus di-focus (dari klik baris list view) */
  focusTarget?: LinknetAddress | null;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface MarkerGroup {
  lat: number;
  lng: number;
  items: LinknetAddress[];
  /** Dominan AVAILABLE jika semua AVAILABLE, else UNAVAILABLE */
  dominantStatus: string;
}

// ─── Group by coordinate ──────────────────────────────────────────────────────
/**
 * Kelompokkan semua hasil berdasarkan koordinat FAT node (lat/lng yang sama).
 * Setiap grup menghasilkan satu marker di peta.
 */
function groupByCoord(items: LinknetAddress[]): MarkerGroup[] {
  const map = new Map<string, LinknetAddress[]>();

  for (const item of items) {
    const key = `${item.latitude.toFixed(6)},${item.longitude.toFixed(6)}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }

  return Array.from(map.entries()).map(([, group]) => {
    const allAvailable = group.every(
      (i) => i.status?.toUpperCase() === "AVAILABLE"
    );
    return {
      lat: group[0].latitude,
      lng: group[0].longitude,
      items: group,
      dominantStatus: allAvailable ? "AVAILABLE" : "UNAVAILABLE",
    };
  });
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { fill: string; ring: string; label: string }> =
  {
    AVAILABLE: { fill: "#16a34a", ring: "#bbf7d0", label: "Tersedia" },
    UNAVAILABLE: { fill: "#dc2626", ring: "#fecaca", label: "Tidak Tersedia" },
  };

function cfg(status: string) {
  return STATUS_CONFIG[status?.toUpperCase()] ?? STATUS_CONFIG["UNAVAILABLE"];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function buildHouseIcon(status: string): L.DivIcon {
  const { fill, ring } = cfg(status);
  const uid = status.toLowerCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="38" viewBox="0 0 32 38">
      <defs>
        <filter id="sh-${uid}">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.28)"/>
        </filter>
      </defs>
      <circle cx="16" cy="19" r="14" fill="${ring}" opacity="0.4"/>
      <ellipse cx="16" cy="35" rx="4" ry="2.5" fill="rgba(0,0,0,0.15)"/>
      <path d="M16 2C16 2 4 13 4 22c0 7 5.5 12 12 12s12-5 12-12C28 13 16 2 16 2Z"
            fill="${fill}" filter="url(#sh-${uid})"/>
      <polygon points="16,10 9,17 23,17" fill="white" opacity="0.95"/>
      <rect x="11" y="17" width="10" height="8" rx="1" fill="white" opacity="0.95"/>
      <rect x="14" y="20" width="4" height="5" rx="0.5" fill="${fill}" opacity="0.85"/>
      <path d="M13 32 L16 37 L19 32" fill="${fill}"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 38],
    iconAnchor: [16, 37],
    popupAnchor: [0, -40],
  });
}

function buildClusterIcon(count: number, status: string): L.DivIcon {
  const { fill, ring } = cfg(status);
  const uid = `cl-${status.toLowerCase()}-${count}`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="50" viewBox="0 0 42 50">
      <defs>
        <filter id="sh-${uid}">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <circle cx="21" cy="23" r="18" fill="${ring}" opacity="0.45"/>
      <ellipse cx="21" cy="46" rx="5" ry="3" fill="rgba(0,0,0,0.15)"/>
      <path d="M21 2C21 2 3 16 3 28c0 9 8 16 18 16s18-7 18-16C39 16 21 2 21 2Z"
            fill="${fill}" filter="url(#sh-${uid})"/>
      <polygon points="21,12 12,20 30,20" fill="white" opacity="0.95"/>
      <rect x="14" y="20" width="14" height="10" rx="1.5" fill="white" opacity="0.95"/>
      <rect x="18" y="24" width="6" height="6" rx="0.5" fill="${fill}" opacity="0.85"/>
      <path d="M17 42 L21 48 L25 42" fill="${fill}"/>
      <!-- Count badge -->
      <circle cx="33" cy="9" r="10" fill="white" stroke="${fill}" stroke-width="2"/>
      <text x="33" y="13" text-anchor="middle" font-size="10" font-weight="800"
            font-family="system-ui,sans-serif" fill="${fill}">${count}</text>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [42, 50],
    iconAnchor: [21, 48],
    popupAnchor: [0, -52],
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const c = cfg(status);
  const isAvailable = status?.toUpperCase() === "AVAILABLE";
  return (
    <span
      style={{
        backgroundColor: isAvailable ? "#dcfce7" : "#fee2e2",
        color: c.fill,
      }}
      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide whitespace-nowrap"
    >
      {c.label}
    </span>
  );
}

/** Baris single item di daftar cluster popup */
function ClusterItem({ item, index }: { item: LinknetAddress; index: number }) {
  const c = cfg(item.status);
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-0">
      <span
        style={{ backgroundColor: c.fill }}
        className="flex items-center justify-center w-5 h-5 rounded shrink-0 mt-0.5 text-white text-[9px] font-bold"
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-[10px] font-bold text-slate-800 leading-tight">
          {item.site_id}
        </p>
        <p className="text-[9px] text-slate-500 leading-tight truncate max-w-[180px]">
          {item.address}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={item.status} />
          {item.fat_code && (
            <span className="text-[9px] text-slate-400 font-mono">
              FAT: {item.fat_code}
            </span>
          )}
          {item.dwell_type && (
            <span className="text-[9px] text-slate-400">
              {item.dwell_type}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Single marker popup */
function SinglePopup({ item }: { item: LinknetAddress }) {
  const c = cfg(item.status);
  return (
    <div style={{ fontFamily: "inherit" }} className="space-y-2 min-w-[220px]">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span
          style={{ backgroundColor: c.fill }}
          className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill="white" />
            <path d="M9 21V12h6v9" fill="white" opacity="0.7" />
          </svg>
        </span>
        <div>
          <p className="text-[11px] font-black text-slate-800 leading-tight">
            {item.site_id}
          </p>
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 text-[10px]">
        {[
          ["Alamat", item.address],
          ["Network Type", item.network_type],
          ["Network ID", item.network_id],
          ["FAT Code", item.fat_code],
          ["Tipe Bangunan", item.dwell_type],
          ["Provider", item.providers],
        ].map(([label, val]) => (
          <div
            key={label}
            className="flex justify-between gap-3 border-b border-slate-50 pb-1 last:border-0"
          >
            <span className="font-bold text-slate-400 uppercase tracking-wide shrink-0">
              {label}
            </span>
            <span className="text-slate-700 font-semibold text-right leading-tight">
              {val || "-"}
            </span>
          </div>
        ))}
      </div>

      {/* Coordinate */}
      <div className="pt-1 border-t border-slate-100 text-[9px] text-slate-400 font-mono">
        {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CoverageMarkerLayer({
  results,
  searchMode,
  searchKey,
  focusTarget,
}: CoverageMarkerLayerProps) {
  const map = useMap();
  const lastSearchKey = useRef<string>("");
  const lastFocusId = useRef<string>("");

  // Fly-to saat hasil pencarian baru
  useEffect(() => {
    if (results.length === 0 || lastSearchKey.current === searchKey) return;
    lastSearchKey.current = searchKey;
    const zoom = searchMode === "coordinate" ? 18 : 15;
    map.flyTo([results[0].latitude, results[0].longitude], zoom);
  }, [results, searchKey, searchMode, map]);

  // Fly-to saat user klik baris di list view
  useEffect(() => {
    if (!focusTarget) return;
    const focusId = `${focusTarget.site_id}:${focusTarget.latitude}:${focusTarget.longitude}`;
    if (lastFocusId.current === focusId) return;
    lastFocusId.current = focusId;
    map.flyTo([focusTarget.latitude, focusTarget.longitude], 18);
  }, [focusTarget, map]);

  // Pre-built icons (singleton per status)
  const singleIcons = useMemo(
    () => ({
      AVAILABLE: buildHouseIcon("AVAILABLE"),
      UNAVAILABLE: buildHouseIcon("UNAVAILABLE"),
    }),
    []
  );

  // Kelompokkan hasil berdasarkan koordinat FAT node
  const groups = useMemo(() => groupByCoord(results), [results]);

  return (
    <>
      {groups.map((group, gIdx) => {
        const isCluster = group.items.length > 1;
        const icon = isCluster
          ? buildClusterIcon(group.items.length, group.dominantStatus)
          : singleIcons[
              group.dominantStatus as keyof typeof singleIcons
            ] ?? singleIcons["UNAVAILABLE"];

        return (
          <Marker
            key={`group-${gIdx}`}
            position={[group.lat, group.lng]}
            icon={icon}
          >
            {isCluster ? (
              <Popup minWidth={260} maxWidth={320} maxHeight={400}>
                <div style={{ fontFamily: "inherit" }} className="space-y-2">
                  {/* Cluster header */}
                  <div className="pb-2 border-b border-slate-100">
                    <p className="text-[12px] font-black text-slate-800">
                      {group.items.length} Homepass di Titik Ini
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {group.lat.toFixed(6)}, {group.lng.toFixed(6)}
                    </p>
                  </div>
                  {/* List items */}
                  <div className="max-h-[280px] overflow-y-auto pr-1 space-y-0">
                    {group.items.map((item, iIdx) => (
                      <ClusterItem
                        key={item.site_id}
                        item={item}
                        index={iIdx}
                      />
                    ))}
                  </div>
                </div>
              </Popup>
            ) : (
              <Popup minWidth={240} maxWidth={300}>
                <SinglePopup item={group.items[0]} />
              </Popup>
            )}
          </Marker>
        );
      })}
    </>
  );
}
