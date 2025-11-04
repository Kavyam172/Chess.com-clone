import { useEffect, useState } from "react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Button } from "../components/Button"
import { Chessboard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js"
import Cboard from "../assets/board.png"

export const INIT_GAME = "init_game"
export const MOVE = "move"
export const GAME_OVER = "game_over"
export const INVALID_MOVE = "invalid_move"


export const Game = () => {
    const socket = useSocket()
    const [chess,setChess] = useState(new Chess())
    const [board,setBoard] = useState([])
    const [started, setStarted] = useState(false)
    const [color,setColor] = useState(null)
    const [findingGame,setFindingGame] = useState(false)

    useEffect(() => {
        if (!socket) {
            return
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            switch (data.type) {
                case INIT_GAME:
                    setBoard(data.payload.board)
                    console.log("Game started with board", data.payload.board)
                    setColor(data.payload.color)
                    setStarted(true)
                    setFindingGame(false)
                    console.log("Game started with color", data.payload.color)
                    break
                case MOVE:
                    const move = data.payload.move
                    setBoard(data.payload.board)
                    console.log("Move: ", move)
                    break
                case GAME_OVER:
                    console.log("Game Over")
                    break
                case INVALID_MOVE:
                    console.log("Invalid Move")
                    // display toast message
                    toast.error("Invalid move")

                    break
            }
        }

        return () => {
            socket.onmessage = null
        }
    }, [socket])

    if (!socket) {
        return <div style={{ color: "white" }}>Connecting...</div>
    }
    return (
        <div className="flex justify-center">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="pt-8 max-w-screen-lg w-full">
                <div className="grid grid-cols-6 gap-4 w-full">
                    <div className="col-span-4 w-full flex justify-center">
                        {!started && <img src={Cboard} alt="chess board" className="max-w-96"/>}
                        {started &&<Chessboard color={color} setBoard={setBoard} socket={socket} board={board}/>}
                    </div>
                    <div className="col-span-2 w-full flex justify-center bg-slate-900">
                        <div className= "pt-8">
                            {!started && !findingGame && <Button onClick = {() => {
                                setFindingGame(true)
                                socket.send(JSON.stringify({type: INIT_GAME}))
                            }}>Play</Button>}

                            {
                                findingGame && <Button onClick={() => {return;}} isDisabled={true}>Finding Game...</Button>
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}