/**
 * MapClickHandler
 *
 * Tujuan     : Leaflet event listener yang mendeteksi klik pada peta dan meneruskan
 *              koordinat ke callback parent untuk trigger pencarian nearest address.
 * Dipakai oleh: CoverageMapPage (di dalam MapContainer)
 * Dependensi : react-leaflet (useMapEvents)
 * Fungsi utama:
 *   - Render null — hanya mengattach event handler ke Leaflet map instance
 * Side effect: Memanggil onMapClick(lat, lng) pada setiap klik di peta
 */

import { useMapEvents } from "react-leaflet";

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

export function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}
