import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { TIMEOUT, CLOCK_HEARTBEAT } from "../screens/Game"

export const Clock = forwardRef(({ initialTime, turn, started, color, socket }: {
    initialTime: { whiteTime: number, blackTime: number },
    turn: string | null,
    started: boolean,
    color: string | null,
    socket: WebSocket
}, ref) => {

    const [whiteTime, setWhiteTime] = useState(initialTime.whiteTime)
    const [blackTime, setBlackTime] = useState(initialTime.blackTime)

    useEffect(() => {
        setWhiteTime(initialTime.whiteTime)
        setBlackTime(initialTime.blackTime)
    }, [initialTime])

    // add a handler for reset

    useImperativeHandle(ref, () => ({
        reset: () => {
            setWhiteTime(initialTime.whiteTime)
            setBlackTime(initialTime.blackTime)
        }
    }))

    useEffect(() => {
        console.log('initial time', initialTime)
        let interval: any
        if (started) {
            interval = setInterval(() => {
                if (turn === 'w') {
                    setWhiteTime(prevTime => prevTime - 1000)
                } else {
                    setBlackTime(prevTime => prevTime - 1000)
                }
            }, 1000)
        } else {
            clearInterval(interval)
        }



        return () => clearInterval(interval)
    }, [turn, started, initialTime])

    useEffect(() => {
        if (whiteTime === 0 || blackTime === 0) {
            socket.send(JSON.stringify({
                type: TIMEOUT,
                payload: {
                    player: whiteTime === 0 ? 'w' : 'b'
                }
            }))
        }
    }, [whiteTime, blackTime])

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60000)
        const seconds = Math.floor((time % 60000) / 1000)
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }
    return (
        <div className={`flex flex-col items-center ${color === 'b' ? 'rotate-180' : ''}`}>
            <div className="bg-black text-white w-full p-4">
                <div className={`${color === 'b' ? 'rotate-180' : ''}`}>
                    <span>{formatTime(blackTime)}</span>
                </div>
            </div>
            <div className="bg-white text-black w-full p-4">
                <div className={`${color === 'b' ? 'rotate-180' : ''}`}>
                    <span>{formatTime(whiteTime)}</span>
                </div>
            </div>
        </div>
    )
})