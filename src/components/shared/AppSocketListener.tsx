import { useEffect } from "react";
import { toast } from "sonner";
import { AuthService } from "@/services/auth.service";
import { socketService } from "@/services/socket.service";

export const AppSocketListener = () => {
    useEffect(() => {
        const user = AuthService.getUser();
        if (!user) return;

        // Initialize connection
        socketService.connect();

        // Listen for global notifications
        const handleNotification = (data: any) => {
            if (data.type === 'warning') {
                toast.warning(data.title, { description: data.message });
            } else if (data.type === 'success') {
                toast.success(data.title, { description: data.message });
            } else if (data.type === 'error') {
                toast.error(data.title, { description: data.message });
            } else {
                toast.info(data.title, { description: data.message });
            }
        };

        socketService.on('notification', handleNotification);

        return () => {
            socketService.off('notification', handleNotification);
            // Optionally we don't disconnect here because Navbar might still need it,
            // or we could let the global service stay connected until logout.
        };
    }, []);

    return null; // This component doesn't render anything visually
};
