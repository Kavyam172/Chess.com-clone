"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.moveCount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.startGame();
    }
    startGame() {
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "w",
                opponent: this.player2,
                board: this.board.board(),
                time: 10 * 60 * 1000
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "b",
                opponent: this.player1,
                board: this.board.board(),
                time: 10 * 60 * 1000
            }
        }));
        this.sendTurn();
    }
    makeMove(socket, move) {
        //validate type of move using zod
        if (this.moveCount % 2 === 0 && socket !== this.player1) {
            return;
        }
        if (this.moveCount % 2 === 1 && socket !== this.player2) {
            return;
        }
        try {
            this.board.move(move);
        }
        catch (e) {
            if (this.moveCount % 2 === 0) {
                this.player1.send(JSON.stringify({
                    type: messages_1.INVALID_MOVE,
                    payload: {
                        message: "Invalid move",
                        error: e
                    }
                }));
            }
            else {
                this.player2.send(JSON.stringify({
                    type: messages_1.INVALID_MOVE,
                    payload: {
                        message: "Invalid move",
                        error: e
                    }
                }));
            }
            return;
        }
        if (this.board.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "b" : "w"
                }
            }));
            this.player2.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "b" : "w"
                }
            }));
            return;
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
        this.player1.send(JSON.stringify({
            type: messages_1.MOVE,
            payload: {
                move,
                board: this.board.board()
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.MOVE,
            payload: {
                move,
                board: this.board.board()
            }
        }));
        this.moveCount++;
        this.sendTurn();
    }
    sendTurn() {
        // tell both players whose move it is
        this.player1.send(JSON.stringify({
            type: messages_1.TURN,
            payload: {
                turn: this.board.turn()
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.TURN,
            payload: {
                turn: this.board.turn()
            }
        }));
    }
}
exports.Game = Game;
