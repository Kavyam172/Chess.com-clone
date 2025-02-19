import { useEffect, useState } from "react"
import { Button } from "../components/Button"
import { Chessboard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js"

export const INIT_GAME = "init_game"
export const MOVE = "move"
export const GAME_OVER = "game_over"


export const Game = () => {
    const socket = useSocket()
    const [chess,setChess] = useState(new Chess())
    const [board,setBoard] = useState(chess.board())
    const [started, setStarted] = useState(false)
    const [color,setColor] = useState("white")

    useEffect(() => {
        if (!socket) {
            return
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            switch (data.type) {
                case INIT_GAME:
                    // setChess(new Chess())
                    setBoard(chess.board())
                    setStarted(true)
                    setColor(data.payload.color)
                    console.log("Game started with color", data.payload.color)
                    break
                case MOVE:
                    const move = data.payload
                    chess.move(move)
                    setBoard(chess.board())
                    console.log("Move")
                    break
                case GAME_OVER:
                    console.log("Game Over")
                    break
            }
        }

        return () => {
            socket.onmessage = null
        }
    }, [socket])

    if (!socket) {
        return <div>Connecting...</div>
    }
    return (
        <div className="flex justify-center">
            <div className="pt-8 max-w-screen-lg w-full">
                <div className="grid grid-cols-6 gap-4 w-full">
                    <div className="col-span-4 w-full flex justify-center">
                        <Chessboard color={color} chess={chess} setBoard={setBoard} socket={socket} board={board}/>
                    </div>
                    <div className="col-span-2 w-full flex justify-center bg-slate-900">
                        <div className="pt-8">
                            {!started && <Button onClick = {() => {
                                socket.send(JSON.stringify({type: INIT_GAME}))
                            }}>Play</Button>}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}