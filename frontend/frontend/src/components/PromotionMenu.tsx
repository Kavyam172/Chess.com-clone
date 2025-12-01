import { Color } from "chess.js"
import { useEffect } from "react"
import { createPortal } from "react-dom"



export const PromotionMenu = ({ isOpen, color, setPromotion }: {
    isOpen: boolean,
    color: Color,
    setPromotion: (piece: string) => void
}) => {
    if (!isOpen) return null

    const handlePromotionSelect = (piece: string) => {
        setPromotion(piece)
    }

    useEffect(() => {
        console.log(">>>>>>>>>>>>>>prootion menu", color)
    }, [color])

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative bg-slate-900 text-white rounded-lg shadow-xl w-11/12 max-w-md mx-auto p-6">
                <h3 className="text-center">Choose a piece to promote to</h3>
                <div className="grid grid-cols-2">
                    <button id="q" onClick={(e) => handlePromotionSelect(e.currentTarget.id)} className="w-full h-full flex items-center justify-center"><img className="w-1/2 h-1/2 object-contain" src={`Piece_q_Side_${color}.svg`} alt={`Piece_q_Side_${color}`} /></button>
                    <button id="r" onClick={(e) => handlePromotionSelect(e.currentTarget.id)} className="w-full h-full flex items-center justify-center"><img className="w-1/2 h-1/2 object-contain" src={`Piece_r_Side_${color}.svg`} alt={`Piece_r_Side_${color}`} /></button>
                    <button id="b" onClick={(e) => handlePromotionSelect(e.currentTarget.id)} className="w-full h-full flex items-center justify-center"><img className="w-1/2 h-1/2 object-contain" src={`Piece_b_Side_${color}.svg`} alt={`Piece_b_Side_${color}`} /></button>
                    <button id="n" onClick={(e) => handlePromotionSelect(e.currentTarget.id)} className="w-full h-full flex items-center justify-center"><img className="w-1/2 h-1/2 object-contain" src={`Piece_n_Side_${color}.svg`} alt={`Piece_n_Side_${color}`} /></button>
                </div>
            </div>
        </div>,
        document.body
    )
}