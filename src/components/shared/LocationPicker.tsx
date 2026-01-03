import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";

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

interface LocationPickerProps {
    label: string;
    value: { lat: number; lng: number } | null;
    onChange: (coords: { lat: number; lng: number }) => void;
}

function LocationMarker({ value, onChange }: { value: { lat: number; lng: number } | null; onChange: (coords: { lat: number; lng: number }) => void }) {
    const map = useMapEvents({
        click(e) {
            onChange(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return value === null ? null : (
        <Marker position={value} />
    );
}

// Component to update map view when value changes (e.g., from manual input)
function MapUpdater({ value }: { value: { lat: number; lng: number } | null }) {
    const map = useMap();
    const prevValueRef = useRef<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (value && value.lat !== 0 && value.lng !== 0) {
            const prevValue = prevValueRef.current;
            // Only fly to if coordinates actually changed (not on initial render from click)
            if (!prevValue || prevValue.lat !== value.lat || prevValue.lng !== value.lng) {
                map.flyTo([value.lat, value.lng], map.getZoom(), {
                    animate: true,
                    duration: 0.5
                });
            }
            prevValueRef.current = value;
        }
    }, [value, map]);

    return null;
}

export function LocationPicker({ label, value, onChange }: LocationPickerProps) {
    // Default center (Jakarta/Indonesia approximate) if no value
    const defaultCenter = { lat: -6.200000, lng: 106.816666 };
    const center = value || defaultCenter;

    return (
        <div className="space-y-2">
            <Label className="text-slate-600 font-medium text-xs uppercase tracking-wider">{label}</Label>
            <div className="h-[200px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative isolate z-0">
                {/* Z-index 0 and isolation to ensure it stays below modal overlays */}
                <MapContainer
                    center={center}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker value={value} onChange={onChange} />
                    <MapUpdater value={value} />
                </MapContainer>
            </div>
            {value && (
                <div className="text-xs text-slate-500 font-mono">
                    Lat: {value.lat.toFixed(6)}, Lng: {value.lng.toFixed(6)}
                </div>
            )}
        </div>
    );
}

