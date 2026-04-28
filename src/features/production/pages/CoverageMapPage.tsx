/**
 * CoverageMapPage
 *
 * Tujuan     : Halaman visualisasi coverage / ketersediaan jaringan Linknet.
 *              Data diambil langsung dari Linknet Address API via backend proxy.
 * Dipakai oleh: Router production feature
 * Dependensi : useCoverageMap (hook), CoverageMarkerLayer, MapClickHandler,
 *              LinkNetService (suggestAddress / nearestAddress), react-leaflet
 * Fungsi utama:
 *   - Mode "address"    : cari lokasi berdasarkan text alamat (debounced suggest API)
 *   - Mode "coordinate" : klik peta → cari lokasi terdekat (nearest API)
 *   - List view         : tabel hasil pencarian dengan kolom Linknet schema
 *   - Map view          : marker berwarna (hijau=AVAILABLE, merah=lainnya) + popup detail
 * Side effect:
 *   - HTTP GET ke /linknet/addresses/suggest dan /addresses/nearest (via backend)
 */

import { useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapFullscreenControl } from "@/components/shared/MapFullscreenControl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Info,
    Map as MapIcon,
    List,
    Loader2,
    MapPin,
    Search,
    Navigation,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { BaseTable } from "@/components/shared/BaseTable";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/shared/SearchInput";
import { useCoverageMap } from "../hooks/useCoverageMap";
import { CoverageMarkerLayer } from "../components/CoverageMarkerLayer";
import { MapClickHandler } from "../components/MapClickHandler";
import type { LinknetAddress } from "@/services/linknet.service";
import { useState } from "react";

export default function CoverageMapPage() {
    const [viewMode, setViewMode] = useState<"map" | "list">("map");
    const { toast } = useToast();

    const {
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
    } = useCoverageMap();

    const handleMapClick = async (lat: number, lng: number) => {
        try {
            await suggestByCoordinate(lat, lng);
        } catch {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Gagal mengambil data lokasi terdekat.",
            });
        }
    };

    /** Klik baris list: switch ke map lalu fly-to koordinat item */
    const handleRowClick = (item: LinknetAddress) => {
        focusItem(item);
        setViewMode("map");
    };

    /** Unique key untuk trigger fly-to hanya saat search berubah */
    const searchKey = useMemo(() => {
        if (searchMode === "address") return `addr:${searchQuery}`;
        if (searchMode === "coordinate" && clickedCoord)
            return `coord:${clickedCoord.lat.toFixed(6)},${clickedCoord.lng.toFixed(6)}`;
        return "idle";
    }, [searchMode, searchQuery, clickedCoord]);

    const columns = useMemo(
        () => [
            {
                header: "Site ID",
                accessorKey: "site_id",
                className: "font-bold text-[#101D42]",
            },
            {
                header: "Alamat",
                accessorKey: "address",
                className: "font-semibold text-slate-700",
            },
            {
                header: "Network Type",
                accessorKey: "network_type",
            },
            {
                header: "FAT Code",
                accessorKey: "fat_code",
            },
            {
                header: "Tipe Bangunan",
                accessorKey: "dwell_type",
            },
            {
                header: "Status",
                accessorKey: "status",
                cell: (row: LinknetAddress) => {
                    const ok = row.status?.toUpperCase() === "AVAILABLE";
                    return (
                        <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                ok
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {row.status}
                        </span>
                    );
                },
            },
            {
                header: "",
                accessorKey: "site_id",
                id: "action",
                cell: () => (
                    <span className="flex items-center gap-1 text-[10px] text-blue-500 font-semibold whitespace-nowrap">
                        <Navigation size={11} /> Lihat di Peta
                    </span>
                ),
            },
        ],
        [],
    );

    return (
        <div className="space-y-6 pb-10">
            {/* ─── Header ─── */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Coverage Map</h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Cek ketersediaan jaringan Linknet berdasarkan alamat atau lokasi
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Search by address */}
                    <SearchInput
                        placeholder="Cari alamat... (min. 3 karakter)"
                        onSearch={suggestByAddress}
                        className="w-full lg:w-72"
                    />

                    {/* Reset */}
                    {searchMode !== "idle" && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-slate-200 h-10 gap-1.5 text-slate-500"
                            onClick={reset}
                        >
                            Reset
                        </Button>
                    )}

                    {/* View toggle */}
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                        <Button
                            variant={viewMode === "map" ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                                "rounded-lg h-9 gap-2",
                                viewMode === "map" && "bg-blue-600",
                            )}
                            onClick={() => setViewMode("map")}
                        >
                            <MapIcon size={16} /> Map
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                                "rounded-lg h-9 gap-2",
                                viewMode === "list" && "bg-blue-600",
                            )}
                            onClick={() => setViewMode("list")}
                        >
                            <List size={16} /> List
                        </Button>
                    </div>
                </div>
            </div>

            {/* ─── Hint banner ─── */}
            {searchMode === "idle" && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                    <Search className="text-blue-400 mt-0.5 shrink-0" size={18} />
                    <div>
                        <p className="text-sm text-blue-800 font-semibold">
                            Dua cara mencari lokasi coverage
                        </p>
                        <p className="text-xs text-blue-600 mt-0.5">
                            1. Ketik nama jalan / kelurahan di kotak pencarian di atas.
                            <br />
                            2. Klik langsung di titik mana pun pada peta di bawah.
                        </p>
                    </div>
                </div>
            )}

            {/* ─── Coordinate indicator ─── */}
            {searchMode === "coordinate" && clickedCoord && (
                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-3 flex items-center gap-3">
                    <MapPin className="text-violet-500 shrink-0" size={16} />
                    <p className="text-xs text-violet-700 font-semibold">
                        Mencari lokasi terdekat dari{" "}
                        <span className="font-mono">
                            {clickedCoord.lat.toFixed(6)}, {clickedCoord.lng.toFixed(6)}
                        </span>
                    </p>
                </div>
            )}

            {/* ─── Map / List View ─── */}
            {viewMode === "map" ? (
                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden">
                    <CardContent className="p-0">
                        <div className="h-[72vh] w-full relative isolate z-0">
                            <MapContainer
                                center={[-7.166, 109.05]}
                                zoom={12}
                                maxZoom={22}
                                preferCanvas={true}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <LayersControl position="topright">
                                    <LayersControl.BaseLayer checked name="Satellite">
                                        <TileLayer
                                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                            maxZoom={22}
                                            maxNativeZoom={18}
                                        />
                                    </LayersControl.BaseLayer>
                                    <LayersControl.BaseLayer name="OpenStreetMap">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            maxZoom={22}
                                            maxNativeZoom={19}
                                        />
                                    </LayersControl.BaseLayer>
                                </LayersControl>

                                <MapFullscreenControl />
                                <MapClickHandler onMapClick={handleMapClick} />
                                <CoverageMarkerLayer
                                    results={results}
                                    searchMode={searchMode}
                                    searchKey={searchKey}
                                    focusTarget={focusedItem}
                                />
                            </MapContainer>

                            {/* Loading overlay */}
                            {loading && (
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-[1000] flex items-center justify-center">
                                    <div className="bg-white/90 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 animate-in zoom-in-95 duration-200">
                                        <Loader2
                                            className="animate-spin text-blue-600"
                                            size={22}
                                        />
                                        <span className="text-sm font-bold text-slate-700">
                                            Memuat data...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <BaseTable
                        columns={columns}
                        data={results}
                        loading={loading}
                        rowKey={(item: LinknetAddress) => item.site_id}
                        onRowClick={handleRowClick}
                    />
                </div>
            )}

            {/* ─── Result summary ─── */}
            {results.length > 0 && !loading && (
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-start gap-3">
                    <Info className="text-green-500 mt-0.5 shrink-0" size={18} />
                    <div>
                        <p className="text-sm text-green-800 font-semibold">
                            {results.length} lokasi ditemukan
                            {searchMode === "address" && searchQuery && (
                                <> untuk "{searchQuery}"</>
                            )}
                        </p>
                        <p className="text-xs text-green-700 mt-0.5">
                            Klik marker di peta atau baris di tabel untuk melihat detail lokasi.
                        </p>
                    </div>
                </div>
            )}

            {searchMode !== "idle" && results.length === 0 && !loading && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                    <Info className="text-slate-400 mt-0.5 shrink-0" size={18} />
                    <p className="text-sm text-slate-500 font-medium">
                        Tidak ada lokasi coverage ditemukan.
                    </p>
                </div>
            )}
        </div>
    );
}
