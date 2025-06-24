import { useEffect, useState } from "react";

console.log(import.meta.env.VITE_BACKEND_URL)

const WS_URL = import.meta.env.VITE_BACKEND_URL || "ws://localhost:8080"

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL)
        ws.onopen = () => {
            setSocket(ws)
        }


        ws.onclose = () => {
            setSocket(null)
            ws.close()
        }

    }, []);

    return socket
}