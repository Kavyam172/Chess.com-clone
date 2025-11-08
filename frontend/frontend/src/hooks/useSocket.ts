import { useEffect, useState } from "react";

const WS_URL = import.meta.env.ENV==='development'? "ws://localhost:8080" : import.meta.env.VITE_BACKEND_URL

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