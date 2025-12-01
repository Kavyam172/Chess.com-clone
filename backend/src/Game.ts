
import { Chess } from "chess.js";
import { EventEmitter, WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, INVALID_MOVE, MOVE, MOVE_INFO, TURN } from "./messages";

export class Game extends EventEmitter {
    public player1: WebSocket
    public player2: WebSocket
    public board: Chess
    private startTime: Date
    private moveCount = 0

    constructor(player1: WebSocket, player2: WebSocket) {
        super();
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.startGame()
    }

    startGame() {
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "w",
                opponent: this.player2,
                board: this.board.board(),
                time: 10 * 60 * 1000
            }
        }))
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "b",
                opponent: this.player1,
                board: this.board.board(),
                time: 10 * 60 * 1000
            }
        }))
        this.sendTurn()
        this.emit('gameStarted')
    }

    makeMove(socket: WebSocket, move: {
        from: string,
        to: string,
        promotion?: string
    }) {
        //validate type of move using zod

        if (this.moveCount % 2 === 0 && socket !== this.player1) {
            return
        }

        if (this.moveCount % 2 === 1 && socket !== this.player2) {
            return
        }

        try {
            console.log("?????????????making move", move)
            this.board.move(move)
        }
        catch (e) {
            console.log("Invalid move", e)
            if (this.moveCount % 2 === 0) {
                this.player1.send(JSON.stringify({
                    type: INVALID_MOVE,
                    payload: {
                        message: "Invalid move",
                        error: e
                    }
                }))
                console.log('invalid move msg sent')
            }
            else {
                this.player2.send(JSON.stringify({
                    type: INVALID_MOVE,
                    payload: {
                        message: "Invalid move",
                        error: e
                    }
                }))
                console.log('invalid move msg sent')
            }
            return
        }

        if (this.board.isGameOver()) {
            if (this.board.isDraw()) {
                let message: string = "";
                if (this.board.isDrawByFiftyMoves()) {
                    message = "by Fifty moves rule"
                }
                if (this.board.isInsufficientMaterial()) {
                    message = "by Insufficient Material"
                }
                if (this.board.isThreefoldRepetition()) {
                    message = "by Threefold Repetition"
                }
                if (this.board.isStalemate()) {
                    message = "by Stalemate"
                }

                this.sendGameOver(true, message)
            }
            else if (this.board.isCheckmate()) {
                this.sendGameOver(false, "by Checkmate")
            }
        }

        // if(this.moveCount % 2 === 0){
        //     this.player2.send(JSON.stringify({
        //         type: MOVE,
        //         payload:move
        //     }))
        // }
        // else{
        //     this.player1.send(JSON.stringify({
        //         type: MOVE,
        //         payload:move
        //     }))
        // }

        let check = null;
        if (this.board.isCheck()) {
            if (this.board.turn() === "w") {
                check = this.board.findPiece({ type: "k", color: "w" })
            }
            else {
                check = this.board.findPiece({ type: "k", color: "b" })
            }
        }

        this.player1.send(JSON.stringify({
            type: MOVE,
            payload: {
                move,
                board: this.board.board(),
                check
            }
        }))

        this.player2.send(JSON.stringify({
            type: MOVE,
            payload: {
                move,
                board: this.board.board(),
                check
            }
        }))
        this.moveCount++;

        this.sendTurn()
    }

    sendTurn() {
        // tell both players whose move it is
        this.player1.send(JSON.stringify({
            type: TURN,
            payload: {
                turn: this.board.turn()
            }
        }))

        this.player2.send(JSON.stringify({
            type: TURN,
            payload: {
                turn: this.board.turn()
            }
        }))
    }

    sendGameOver(isDraw: boolean = false, message: string = "") {
        if (isDraw) {
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    isDraw,
                    message,
                }
            }))
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    isDraw,
                    message
                }
            }))
        }

        else {
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? 'b' : 'w',
                    message
                }
            }))
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'b' ? 'w' : 'b',
                    message
                }
            }))
        }

        this.emit('gameOver', this.player1, this.player2)
    }

    handleTimeout(data: { player: string }) {
        this.player1.send(JSON.stringify({
            type: GAME_OVER,
            payload: {
                winner: data.player === 'w' ? 'b' : 'w',
                message: "by Timeout"
            }
        }))

        this.player2.send(JSON.stringify({
            type: GAME_OVER,
            payload: {
                winner: data.player === 'b' ? 'w' : 'b',
                message: "by Timeout"
            }
        }))

        this.emit('gameOver', this.player1, this.player2)
    }
}