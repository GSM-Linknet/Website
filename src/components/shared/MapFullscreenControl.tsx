import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";
import { Maximize, Minimize } from "lucide-react";

export function MapFullscreenControl() {
    const map = useMap();
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFSChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFSChange);

        // More robust way: Use ResizeObserver to detect any container size changes
        const container = map.getContainer();
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
            // Fire again after a short delay to catch the end of transitions
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        });

        resizeObserver.observe(container);

        return () => {
            document.removeEventListener('fullscreenchange', handleFSChange);
            resizeObserver.unobserve(container);
            resizeObserver.disconnect();
        };
    }, [map]);

    const toggleFullscreen = () => {
        const container = map.getContainer();
        if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
                container.requestFullscreen().catch((err: any) => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className="leaflet-top leaflet-left !mt-[70px]">
            <div className="leaflet-control leaflet-bar border-none shadow-none bg-transparent">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFullscreen();
                    }}
                    className="w-8 h-8 bg-white hover:bg-slate-50 flex items-center justify-center rounded-lg border border-slate-200 shadow-sm transition-all text-slate-600 hover:text-blue-600 active:scale-95"
                    title={isFullscreen ? "Keluar Layar Penuh" : "Tampilan Layar Penuh"}
                    type="button"
                >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
            </div>
        </div>
    );
}
