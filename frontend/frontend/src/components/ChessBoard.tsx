import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";
import board2 from "../assets/Piece_b_Side_b.svg"

export const Chessboard = ({board,socket,chess,setBoard,color}:{
    chess:any
    setBoard:any
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]
    socket: WebSocket
    color: any
}) => {
    const [from, setFrom] = useState<Square | null>(null)
    const [to, setTo] = useState<Square | null>(null)
    return (
        <div className={color=="white"?"text-white ring-4 ring-green-400":"text-white ring-4 ring-green-400 rotate-180"}>
            {board.map((row, rowIndex) => {
                return (
                    <div key={rowIndex} className="flex">
                        {row.map((square, squareIndex) => {
                            const squareRepresentation = String.fromCharCode(97 + squareIndex) + (8-rowIndex) as Square;
                            return (
                                <div onClick={()=>{
                                    if(!from){
                                        setFrom(squareRepresentation)
                                    } else if (!to){
                                        socket.send(JSON.stringify({type: MOVE, payload: {
                                            move: {
                                                from,
                                                to: squareRepresentation
                                            }
                                        }}))
                                        setFrom(null)
                                        chess.move({from,to:squareRepresentation})
                                        setBoard(chess.board())

                                        console.log({from,to})
                                    }
                                }} key={squareIndex} className={`w-12 h-12 ${(rowIndex+squareIndex)%2==1? "bg-slate-950" : "bg-white"} text-blue-600 font-bold`}>
                                    <div className="w-full flex justify-center items-center h-full">
                                        <div className={color=="white"?"h-full flex justify-center flex-col":"h-full flex justify-center flex-col rotate-180"}>
                                        {/* D:/projects/chesscom/Chess.com-clone/frontend/frontend/src\assets\Piece_b_Side_b.svg */}
                                            <img src={`Piece_${square?.type}_Side_${square?.color}.svg`} alt="" />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}