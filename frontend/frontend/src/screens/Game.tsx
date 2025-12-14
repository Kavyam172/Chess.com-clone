import { useEffect, useRef, useState } from "react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Button } from "../components/Button"
import { Chessboard } from "../components/ChessBoard"
import { GameOver } from "../components/GameOver"
import { useSocket } from "../hooks/useSocket"
import Cboard from "../assets/board.png"
import { Clock } from "../components/clock"

export const INIT_GAME = "init_game"
export const MOVE = "move"
export const GAME_OVER = "game_over"
export const INVALID_MOVE = "invalid_move"
export const TURN = "turn"
export const TIMEOUT = "timeout"
export const CLOCK_HEARTBEAT = "clock_heartbeat"


export const Game = () => {
    const socket = useSocket()
    const clockRef = useRef<any>(null)
    const [board, setBoard] = useState([])
    const [check, setCheck] = useState(null)
    const [started, setStarted] = useState(false)
    const [color, setColor] = useState(null)
    const [findingGame, setFindingGame] = useState(false)
    const [turn, setTurn] = useState(null)
    const [time, setTime] = useState({
        whiteTime: 10 * 60 * 1000,
        blackTime: 10 * 60 * 1000,
    })
    const [gameOver, setGameOver] = useState(false)
    const [isDraw, setDraw] = useState(false)
    const [winner, setWinner] = useState(null)
    const [gameOverMessage, setGameOverMessage] = useState(null)

    const handleClockReset = () => {
        clockRef.current?.reset()
    }

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
                    console.log('game started with time', data.payload)
                    setColor(data.payload.color)
                    setTime({
                        whiteTime: data.payload.whiteTime,
                        blackTime: data.payload.blackTime,
                    })
                    setStarted(true)
                    setFindingGame(false)
                    setCheck(null)
                    console.log("Game started with color", data.payload.color)
                    break
                case MOVE:
                    const move = data.payload.move
                    setBoard(data.payload.board)
                    setCheck(data.payload.check)
                    console.log("move message:::", data.payload)
                    console.log("Move: ", move)
                    setTime({
                        whiteTime: data.payload.whiteTime,
                        blackTime: data.payload.blackTime,
                    })
                    break
                case GAME_OVER:
                    console.log("Game Over", data.payload)
                    setGameOver(true)
                    setDraw(data.payload?.isDraw)
                    setWinner(data.payload?.winner ?? null)
                    setGameOverMessage(data.payload?.message)
                    setStarted(false)
                    break
                case INVALID_MOVE:
                    console.log(">>>> invalid move me hhh", data.payload.error)
                    toast.error("Invalid move")
                    break
                case TURN:
                    console.log("Turn: ", data.payload.turn)
                    setTurn(data.payload.turn)
                    break
                case CLOCK_HEARTBEAT:
                    console.log("Clock Heartbeat: ", data.payload)
                    setTime({
                        whiteTime: data.payload.whiteTime,
                        blackTime: data.payload.blackTime,
                    })
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
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <GameOver
                isOpen={gameOver}
                isDraw={isDraw}
                winner={winner}
                message={gameOverMessage}
                onNewGame={() => {
                    setFindingGame(true)
                    socket.send(JSON.stringify({ type: INIT_GAME }))
                    setGameOver(false)
                    setStarted(false)
                    handleClockReset()
                }}
                onClose={() => setGameOver(false)}
            />
            <div className="pt-8 max-w-screen-lg w-full px-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 w-full">
                    <div className="col-span-1 md:col-span-4 w-full flex justify-center">
                        <div className="w-full flex items-stretch gap-4 justify-between">
                            <div className="clock-wrapper sm:w-24 md:w-36 rounded flex items-center justify-center">
                                <div className="w-full">
                                    <Clock ref={clockRef} started={started} initialTime={time} turn={turn} color={color} socket={socket} />
                                </div>
                            </div>
                            <div className="board-wrapper w-64 sm:w-80 md:w-full aspect-square flex justify-center">
                                {(board.length === 0) && <img src={Cboard} alt="chess board" className="w-full h-full object-contain" />}
                                {(board.length > 0) && <div className="w-full h-full"><Chessboard color={color} socket={socket} board={board} check={check} /></div>}
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 w-full h-full flex flex-col justify-between items-center bg-slate-900 p-6 md:p-10">
                        <div className="pt-8">
                            {!started && !findingGame && <Button onClick={() => {
                                setFindingGame(true)
                                socket.send(JSON.stringify({ type: INIT_GAME }))
                            }}>Play</Button>}

                            {
                                findingGame && <Button onClick={() => { return; }} isDisabled={true}>Finding Game...</Button>
                            }

                        </div>
                        {started && <div className={`p-2 bg-slate-700 w-full flex justify-center items-center rounded-lg`}>
                            <div className={`${turn === 'w' ? 'bg-white text-black' : 'bg-black text-white'} p-2 rounded-md`}>
                                <span>{turn === color ? "Your Turn" : "Opponent's Turn"}</span>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}