import { useEffect, useState } from "react"

export const Clock = ({initialTime,turn,started,color}:{
    initialTime: number,
    turn:string | null,
    started:boolean,
    color:string | null
}) => {

    const [whiteTime, setWhiteTime] = useState(initialTime)
    const [blackTime, setBlackTime] = useState(initialTime)

    useEffect(() => {
        let interval:any
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
    }, [turn, started])

    const formatTime = (time:number) => {
        const minutes = Math.floor(time / 60000)
        const seconds = ((time % 60000) / 1000)
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }
    return(
        <div className={`flex flex-col items-center ${color === 'b' ? 'rotate-180' : ''}`}>
            <div className="bg-black text-white w-full p-4">
                <div className={`${color==='b'? 'rotate-180' : ''}`}>
                    <span>{formatTime(blackTime)}</span>
                </div>
            </div>
            <div className="bg-white text-black w-full p-4">
                <div className={`${color==='b'? 'rotate-180' : ''}`}>
                    <span>{formatTime(whiteTime)}</span>
                </div>
            </div>
        </div>
    )
}