import { io, Socket } from "socket.io-client";
import { AuthService } from "./auth.service";

class SocketService {
    private socket: Socket | null = null;
    private listeners: Record<string, ((data: any) => void)[]> = {};

    connect() {
        if (this.socket) return;
        
        const socketUrl = import.meta.env.VITE_API_BASE_URL 
            ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
            : window.location.origin;

        this.socket = io(socketUrl, {
            path: '/api/socket.io',
            transports: ['polling', 'websocket'],
        });

        this.socket.on('connect', () => {
            console.log('[SocketService] Connected');
        });
        
        // Proxy events to internal listeners
        this.socket.on('notification', (data: any) => {
            const user = AuthService.getUser();
            if (data?.userId === user?.id) {
                this.emitLocal('notification', data);
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event: string, callback: (data: any) => void) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
    
    private emitLocal(event: string, data: any) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

export const socketService = new SocketService();
