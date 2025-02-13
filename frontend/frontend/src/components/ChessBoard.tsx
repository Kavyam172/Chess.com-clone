import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

export const Chessboard = ({board,socket,chess,setBoard}:{
    chess:any
    setBoard:any
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]
    socket: WebSocket
}) => {
    const [from, setFrom] = useState<Square | null>(null)
    const [to, setTo] = useState<Square | null>(null)
    return (
        <div className="text-white ring-4 ring-green-400">
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
                                        <div className="h-full flex justify-center flex-col">
                                            {square? square.type : ""}
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