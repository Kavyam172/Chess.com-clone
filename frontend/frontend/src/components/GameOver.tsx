import { useMemo } from "react"

export const GameOver = ({
    isOpen,
    isDraw,
    winner,
    message,
    onNewGame,
    onClose,
}: {
    isOpen: boolean
    isDraw?: boolean
    winner?: string | null
    message?: string | null
    onNewGame?: () => void
    onClose?: () => void
}) => {
    const winnerLabel = useMemo(() => {
        if (!winner) return null
        if (winner === "w") return "White"
        if (winner === "b") return "Black"
        return winner
    }, [winner])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            {/* modal */}
            <div className="relative bg-slate-900 text-white rounded-lg shadow-xl w-11/12 max-w-md mx-auto p-6">
                <div className="flex flex-col gap-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold">
                            {isDraw ? "Game Drawn" : `${winnerLabel} wins`}
                        </h2>
                        {message && <p className="text-sm text-slate-300 mt-1">{message}</p>}
                    </div>

                    <div className="flex justify-center gap-3 mt-2">
                        <button
                            onClick={() => onNewGame && onNewGame()}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md font-medium"
                        >
                            Start New Game
                        </button>
                        <button
                            onClick={() => onClose && onClose()}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}