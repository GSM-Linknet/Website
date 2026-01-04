import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapFullscreenControl } from "@/components/shared/MapFullscreenControl";
import L from "leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Info, Map as MapIcon, List, Filter } from "lucide-react";
import { CoverageService, type Coverage } from "@/services/coverage.service";
import { useToast } from "@/hooks/useToast";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import { BaseTable } from "@/components/shared/BaseTable";
import { cn } from "@/lib/utils";
import { MasterService, type Area } from "@/services/master.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Fix Leaflet's default icon path issues in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored icon for coverage points
const CoverageIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function CoverageMapPage() {
    const [points, setPoints] = useState<Coverage[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedAreaId, setSelectedAreaId] = useState<string>("");
    const [filterAreaId, setFilterAreaId] = useState<string>("all");
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState<"map" | "list">("map");
    const { toast } = useToast();
    const navigate = useNavigate();
    const user = AuthService.getUser();
    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    const fetchAreas = async () => {
        try {
            const res = await MasterService.getAreas({ limit: 100 });
            setAreas(res.data.items || []);
        } catch (error) {
            console.error("Failed to fetch areas", error);
        }
    };

    const fetchPoints = async () => {
        try {
            const params: any = { paginate: false };
            if (filterAreaId !== "all") {
                params.where = `areaId:${filterAreaId}`;
            }
            const response = await CoverageService.findAll(params);
            setPoints(response.data.items || []);
        } catch (error) {
            console.error("Failed to fetch coverage points", error);
        }
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    useEffect(() => {
        fetchPoints();
    }, [filterAreaId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Validate file size (max 10MB per file for KMZ)
        const MAX_KMZ_SIZE = 10 * 1024 * 1024;
        const oversizedFile = files.find(f => f.size > MAX_KMZ_SIZE);

        if (oversizedFile) {
            toast({
                variant: "destructive",
                title: "File Terlalu Besar",
                description: `File "${oversizedFile.name}" melebihi batas 10MB. Ukuran file: ${(oversizedFile.size / (1024 * 1024)).toFixed(2)}MB`
            });
            e.target.value = "";
            return;
        }

        if (!selectedAreaId) {
            toast({ variant: "destructive", title: "Peringatan", description: "Silakan pilih Area terlebih dahulu." });
            return;
        }

        setUploading(true);
        try {
            const res = await CoverageService.importKMZ(files, selectedAreaId);
            toast({
                title: "Berhasil",
                description: `${res.data.total} titik coverage berhasil diimport!`,
            });
            fetchPoints();
            // Clear input
            e.target.value = "";
        } catch (error) {
            console.error("Upload failed", error);
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Gagal mengimport file KMZ. Pastikan file tidak rusak atau terlalu besar.",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleClear = async () => {
        if (!confirm("Hapus semua data coverage?")) return;
        try {
            await CoverageService.deleteAll();
            setPoints([]);
            toast({ title: "Dihapus", description: "Semua data coverage telah dihapus." });
        } catch (error) {
            toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
        }
    };

    const columns = useMemo(() => [
        {
            header: "ID Homepass",
            accessorKey: "externalId",
            className: "font-bold text-[#101D42]",
        },
        {
            header: "Alamat / Jalan",
            accessorKey: "name",
            className: "font-semibold text-slate-700",
        },
        {
            header: "Cluster",
            accessorKey: "id",
            cell: (row: Coverage) => row.metadata?.CLUSTER_NAME || "-",
        },
        {
            header: "RT/RW",
            id: "rtrw",
            accessorKey: "id",
            cell: (row: Coverage) => `${row.metadata?.RT || "00"}/${row.metadata?.RW || "00"}`,
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: Coverage) => (
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                    {row.status}
                </span>
            ),
        }
    ], [navigate]);

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Data Coverage</h1>
                    <p className="text-sm text-slate-500 font-medium">Manajemen titik homepass dan visualisasi area</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Area Filter */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                        <Filter size={14} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Area:</span>
                        <Select value={filterAreaId} onValueChange={setFilterAreaId}>
                            <SelectTrigger className="h-8 w-[140px] border-none shadow-none focus:ring-0 text-xs font-semibold p-0">
                                <SelectValue placeholder="Pilih Area" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">Semua Area</SelectItem>
                                {areas.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                        <Button
                            variant={viewMode === "map" ? "default" : "ghost"}
                            size="sm"
                            className={cn("rounded-lg h-9 gap-2", viewMode === "map" && "bg-blue-600")}
                            onClick={() => setViewMode("map")}
                        >
                            <MapIcon size={16} /> Map
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            className={cn("rounded-lg h-9 gap-2", viewMode === "list" && "bg-blue-600")}
                            onClick={() => setViewMode("list")}
                        >
                            <List size={16} /> List
                        </Button>
                    </div>

                    {isSuperAdmin && (
                        <div className="flex items-center gap-2">
                            <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                                <SelectTrigger className="h-11 w-[160px] rounded-xl border-slate-200 text-xs font-semibold">
                                    <SelectValue placeholder="Pilih Area Import" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100">
                                    {areas.map(a => (
                                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button variant="outline" className="rounded-xl h-11 gap-2 border-slate-200" onClick={handleClear}>
                                <Trash2 size={16} />
                            </Button>

                            <div className="relative">
                                <input
                                    type="file"
                                    id="kmz-upload"
                                    className="hidden"
                                    accept=".kmz,.kml"
                                    multiple
                                    onChange={handleFileUpload}
                                    disabled={uploading || !selectedAreaId}
                                />
                                <Button
                                    onClick={() => document.getElementById("kmz-upload")?.click()}
                                    className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 px-6"
                                    disabled={uploading || !selectedAreaId}
                                >
                                    <Upload size={16} /> {uploading ? "Mengimport..." : "Import KMZ"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {viewMode === "map" ? (
                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden">
                    <CardContent className="p-0">
                        <div className="h-[75vh] w-full relative isolate z-0">
                            <MapContainer
                                center={[-7.166, 109.05]}
                                zoom={13}
                                maxZoom={22}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <LayersControl position="topright">
                                    <LayersControl.BaseLayer checked name="Satellite">
                                        <TileLayer
                                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
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
                                {points.map((p) => (
                                    <Marker key={p.id} position={[p.lat, p.lng]} icon={CoverageIcon}>
                                        <Popup>
                                            <div className="p-1 space-y-2 min-w-[200px]">
                                                <h3 className="font-bold text-blue-800 border-b pb-1">{p.externalId || "No ID"}</h3>
                                                <div className="text-xs space-y-1">
                                                    <p><strong>Alamat:</strong> {p.name || "-"}</p>
                                                    <p><strong>Cluster:</strong> {p.metadata?.CLUSTER_NAME || "-"}</p>
                                                    <p><strong>RT/RW:</strong> {p.metadata?.RT || "00"}/{p.metadata?.RW || "00"}</p>
                                                    <p><strong>Status:</strong> <span className="text-green-600 font-bold uppercase">{p.status}</span></p>
                                                </div>
                                                {/* <Button
                                                    size="sm"
                                                    className="w-full mt-2 h-8 rounded-lg text-[10px] gap-1"
                                                    onClick={() => navigate(`/produksi/prospek?name=${p.externalId}&address=${p.name}`)}
                                                >
                                                    <Plus size={12} /> Jadi Prospek
                                                </Button> */}
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                                <MapUpdater points={points} />
                            </MapContainer>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <BaseTable
                        columns={columns}
                        data={points}
                        loading={uploading}
                        rowKey={(item) => item.id}
                    />
                </div>
            )}

            {points.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                    <Info className="text-blue-500 mt-0.5" size={18} />
                    <div>
                        <p className="text-sm text-blue-800 font-semibold">Total {points.length} titik ditemukan</p>
                        <p className="text-xs text-blue-600">Gunakan marker di peta atau tabel list untuk melihat detail setiap titik homepass.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function MapUpdater({ points }: { points: Coverage[] }) {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0) {
            const first = points[0];
            map.flyTo([first.lat, first.lng], 15);
        }
    }, [points, map]);
    return null;
}
