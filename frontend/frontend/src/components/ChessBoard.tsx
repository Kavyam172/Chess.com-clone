import { Color, PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import { MOVE } from "../screens/Game";
import { PromotionMenu } from "./PromotionMenu";

export const Chessboard = ({ board, socket, color, check }: {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]
    socket: WebSocket
    setBoard?: any
    color: any
    check: string | null
}) => {
    const [from, setFrom] = useState<Square | null>(null)
    const [to, setTo] = useState<Square | null>(null)
    const [canPromote, setCanPromote] = useState<boolean>(false)
    const [promotion, setPromotion] = useState<string | null>(null)
    const [promotionMenu, setPromotionMenu] = useState<boolean>(false)

    useEffect(() => {
        if (from && to) {
            if (canPromote) {
                handlePromotion()
                return;
            }
            else {
                socket.send(JSON.stringify({ type: MOVE, payload: { move: { from, to } } }))
            }
            setFrom(null)
            setTo(null)
            setPromotion(null)
        }
    }, [to])

    useEffect(() => {
        if (promotion) {
            socket.send(JSON.stringify({ type: MOVE, payload: { move: { from, to, promotion } } }))
            console.log("promotion move sent")
        }
        setPromotionMenu(false)
        setFrom(null)
        setTo(null)
        setPromotion(null)
        setCanPromote(false)
    }, [promotion])

    const handlePromotion = () => {
        setPromotionMenu(true)
    }


    const handleSquareClick = (square: {
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null, squareRepresentation: Square) => {
        // don't allow selecting opponent pieces as first click
        if (!from && (square?.color !== color)) {
            return;
        }
        // select own piece
        if (from && square?.type && square.color === color && from !== squareRepresentation) {
            setFrom(squareRepresentation)
            return;
        }

        if (!from) {
            if (square?.type === "p") {
                if ((color === "w" && squareRepresentation.split('')[1] === "7") || (color === "b" && squareRepresentation.split('')[1] === "2")) {
                    console.log("promotion eligible")
                    setCanPromote(true)
                }
            }
            setFrom(squareRepresentation)
            return;
        }



        if (from === squareRepresentation) {
            setFrom(null)
            return;
        }
        else {
            if (canPromote && (squareRepresentation.split('')[1] === "1" || squareRepresentation.split('')[1] === "8")) {
                handlePromotion()
            }
            setTo(squareRepresentation)
        }
    }

    // Render as an 8x8 grid so the board fills its parent container (and matches clock height)
    const cells: JSX.Element[] = [];
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        for (let squareIndex = 0; squareIndex < 8; squareIndex++) {
            const square = board?.[rowIndex]?.[squareIndex] ?? null;
            const squareRepresentation = String.fromCharCode(97 + squareIndex) + (8 - rowIndex) as Square;
            const isDark = (rowIndex + squareIndex) % 2 === 1;
            const isSelected = from === squareRepresentation;
            const bgClass = isSelected ? 'bg-yellow-400 ring-2 ring-yellow-300' : (check == squareRepresentation ? 'bg-red-400 ring-2 ring-red-300' : (isDark ? 'bg-black' : 'bg-white'));

            cells.push(
                <button
                    key={`${rowIndex}-${squareIndex}`}
                    onClick={() => handleSquareClick(square, squareRepresentation)}
                    className={`w-full h-full ${bgClass} flex items-center justify-center p-0 border-0`}
                    aria-label={`square-${squareRepresentation}`}
                >
                    <div className={color === "w" || color === null ? "w-full h-full flex justify-center items-center" : "w-full h-full flex justify-center items-center rotate-180"}>
                        {square?.type ? (
                            <img className="w-3/4 h-3/4 object-contain" src={`Piece_${square.type}_Side_${square.color}.svg`} alt={`${square.type}-${square.color}`} />
                        ) : null}
                    </div>
                </button>
            )
        }
    }

    return (
        <div className={color === "w" || color === null ? "text-white ring-4 ring-green-400 w-full h-full" : "text-white ring-4 ring-green-400 rotate-180 w-full h-full"}>
            <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-0">
                <PromotionMenu isOpen={promotionMenu} color={color} setPromotion={(piece) => setPromotion(piece)} />
                {cells}
            </div>
        </div>
    )
}