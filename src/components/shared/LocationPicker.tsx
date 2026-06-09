import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Label } from "@/components/ui/label";
import { MapPin, Crosshair, Loader2 } from "lucide-react";

interface LocationPickerProps {
    label: string;
    value: { lat: number; lng: number } | null;
    onChange: (coords: { lat: number; lng: number }) => void;
}

// Watch for map movements and update the parent value
function MapCenterWatcher({ onChange }: { onChange: (coords: { lat: number; lng: number }) => void }) {
    const map = useMapEvents({
        moveend: () => {
            const center = map.getCenter();
            onChange({ lat: center.lat, lng: center.lng });
        }
    });
    return null;
}

// Update map view only if value changes significantly from outside
function MapUpdater({ value }: { value: { lat: number; lng: number } | null }) {
    const map = useMap();
    
    useEffect(() => {
        if (value && value.lat !== 0 && value.lng !== 0) {
            const currentCenter = map.getCenter();
            const distance = map.distance(currentCenter, [value.lat, value.lng]);
            // If the map is far from the value (e.g. changed via "Locate Me" or parent prop), fly to it
            if (distance > 5) {
                map.setView([value.lat, value.lng], map.getZoom(), { animate: true });
            }
        }
    }, [value, map]);

    return null;
}

export function LocationPicker({ label, value, onChange }: LocationPickerProps) {
    const [isLocating, setIsLocating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // Mobile: full screen map
    // Default center (Jakarta/Indonesia approximate) if no value
    const defaultCenter = { lat: -6.200000, lng: 106.816666 };
    const center = value || defaultCenter;

    const handleLocateMe = () => {
        if (!("geolocation" in navigator)) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocating(false);
                onChange({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                setIsLocating(false);
                console.error("Error getting location:", error);
                alert("Gagal mendapatkan lokasi. Pastikan izin lokasi perangkat Anda aktif.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="space-y-2">
            <Label className="text-slate-600 font-medium text-xs uppercase tracking-wider">{label}</Label>
            
            {/* Map Container - toggles between inline and fullscreen */}
            <div 
                className={isExpanded 
                    ? "fixed inset-0 z-[99999] bg-white flex flex-col" 
                    : "h-[260px] sm:h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative isolate z-0 group"
                }
            >
                {/* Header for Fullscreen Mode */}
                {isExpanded && (
                    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-[400]">
                        <span className="font-bold text-slate-800">Tentukan Lokasi</span>
                        <button 
                            onClick={() => setIsExpanded(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                        >
                            Selesai
                        </button>
                    </div>
                )}

                <div className="relative flex-1 w-full h-full">
                    <MapContainer
                        center={center}
                        zoom={17}
                        maxZoom={22}
                        scrollWheelZoom={true}
                        dragging={true}
                        touchZoom={true}
                        doubleClickZoom={true}
                        style={{ height: "100%", width: "100%" }}
                    >
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Satelit & Jalan">
                            <TileLayer
                                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                maxZoom={22}
                                maxNativeZoom={20}
                                attribution="Google Maps"
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="OpenStreetMap">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                maxZoom={22}
                                maxNativeZoom={19}
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>
                    <MapCenterWatcher onChange={onChange} />
                    <MapUpdater value={value} />
                </MapContainer>

                {/* Center fixed marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[400] pointer-events-none drop-shadow-lg flex flex-col items-center">
                    <MapPin className="text-red-500 w-10 h-10 fill-red-50/80 mb-[-4px]" strokeWidth={1.5} />
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-sm" />
                </div>

                {/* Locate Me Button */}
                <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="absolute bottom-6 right-4 z-[400] bg-white p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-slate-100 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Gunakan lokasi saya saat ini"
                >
                    {isLocating ? (
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    ) : (
                        <Crosshair className="w-6 h-6" />
                    )}
                </button>

                {/* Expand Map Button (Mobile only) */}
                {!isExpanded && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded(true)}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] sm:hidden bg-white/95 backdrop-blur px-4 py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                        Perbesar Peta
                    </button>
                )}
                </div>
            </div>
            
            {/* Coordinates Display & Helper Text */}
            <div className="flex justify-between items-center px-1">
                {value ? (
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                        {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
                    </span>
                ) : (
                    <span className="text-xs text-slate-400 italic">Lokasi belum diatur</span>
                )}
                <span className="text-[11px] text-slate-400 italic">
                    * Geser peta untuk mengubah titik
                </span>
            </div>
        </div>
    );
}

