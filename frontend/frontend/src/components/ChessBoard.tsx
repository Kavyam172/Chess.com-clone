import { Color, PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import { MOVE } from "../screens/Game";

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

    useEffect(() => {
        if(from && to){
            socket.send(JSON.stringify({type:MOVE,payload:{move:{from,to}}}))
            chess.move({from,to})
            setBoard(chess.board())

            console.log("Move: ", {from,to})
            setFrom(null)
            setTo(null)
        }
    }, [to])


    const handleSquareClick = (square:{
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null, squareRepresentation: Square) => {
        if(!from && (square?.color !== color)){
            return;
        }
        console.log("Square Clicked>>>>>>>>>",squareRepresentation)
        if(square?.type && square.color===color && from!==squareRepresentation){
            setFrom(squareRepresentation)
            return;
        }
        
        
        if(!from){
            setFrom(squareRepresentation)
            return;
        }
        
        if(from===squareRepresentation){
            setFrom(null)
            return;
        }
        else{
            setTo(squareRepresentation)
        }
        
    }
    return (
        <div className={color==="w" || color===null?"text-white ring-4 ring-green-400":"text-white ring-4 ring-green-400 rotate-180"}>
            {board.map((row, rowIndex) => {
                return (
                    <div key={rowIndex} className="flex">
                        {row.map((square, squareIndex) => {
                            const squareRepresentation = String.fromCharCode(97 + squareIndex) + (8-rowIndex) as Square;
                            const isDark = (rowIndex + squareIndex) % 2 === 1;
                            const isSelected = from === squareRepresentation;
                            const bgClass = isSelected ? 'bg-yellow-400 ring-2 ring-yellow-300' : (isDark ? 'bg-slate-950' : 'bg-white');

                            return (
                                <div onClick={() => handleSquareClick(square, squareRepresentation)} key={squareIndex} className={`w-12 h-12 ${bgClass} text-blue-600 font-bold`}>
                                    <div className="w-full flex justify-center items-center h-full">
                                        <div className={color==="w" || color===null?"h-full flex justify-center flex-col":"h-full flex justify-center flex-col rotate-180"}>
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