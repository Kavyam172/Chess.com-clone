"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const ws_1 = require("ws");
const messages_1 = require("./messages");
class Game extends ws_1.EventEmitter {
    constructor(player1, player2, initialTime = 10 * 60 * 1000) {
        super();
        this.moveCount = 0;
        this.whiteTime = 10 * 60 * 1000;
        this.blackTime = 10 * 60 * 1000;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.serverTimeStamp = Date.now();
        this.startGame(initialTime);
    }
    startGame(initialTime) {
        this.whiteTime = initialTime;
        this.blackTime = initialTime;
        this.serverTimeStamp = Date.now();
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "w",
                opponent: this.player2,
                board: this.board.board(),
                whiteTime: this.whiteTime,
                blackTime: this.blackTime,
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "b",
                opponent: this.player1,
                board: this.board.board(),
                whiteTime: this.whiteTime,
                blackTime: this.blackTime,
            }
        }));
        this.sendTurn();
        this.emit('gameStarted');
    }
    makeMove(socket, move) {
        console.log("recieved move msg:::::::", move);
        if (this.moveCount % 2 === 0 && socket !== this.player1) {
            return;
        }
        if (this.moveCount % 2 === 1 && socket !== this.player2) {
            return;
        }
        try {
            console.log("?????????????making move", move);
            this.board.move(move);
        }
        catch (e) {
            console.log("Invalid move", e);
            if (this.moveCount % 2 === 0) {
                this.player1.send(JSON.stringify({
                    type: messages_1.INVALID_MOVE,
                    payload: {
                        message: "Invalid move",
                        error: e
                    }
                }));
                console.log('invalid move msg sent');
            }
            else {
                this.player2.send(JSON.stringify({
                    type: messages_1.INVALID_MOVE,
                    payload: {
                        message: "Invalid move",
                        error: e
                    }
                }));
                console.log('invalid move msg sent');
            }
            return;
        }
        if (this.board.isGameOver()) {
            if (this.board.isDraw()) {
                let message = "";
                if (this.board.isDrawByFiftyMoves()) {
                    message = "by Fifty moves rule";
                }
                if (this.board.isInsufficientMaterial()) {
                    message = "by Insufficient Material";
                }
                if (this.board.isThreefoldRepetition()) {
                    message = "by Threefold Repetition";
                }
                if (this.board.isStalemate()) {
                    message = "by Stalemate";
                }
                this.sendGameOver(true, message);
            }
            else if (this.board.isCheckmate()) {
                this.sendGameOver(false, "by Checkmate");
            }
        }
        let check = null;
        if (this.board.isCheck()) {
            if (this.board.turn() === "w") {
                check = this.board.findPiece({ type: "k", color: "w" });
            }
            else {
                check = this.board.findPiece({ type: "k", color: "b" });
            }
        }
        let now = Date.now();
        let lag = now - move.clientTimeStamp;
        let effectiveLag = Math.min(lag, 200);
        let timeTaken = now - this.serverTimeStamp - effectiveLag;
        if (socket === this.player1) {
            this.whiteTime -= timeTaken;
        }
        else {
            this.blackTime -= timeTaken;
        }
        this.serverTimeStamp = now;
        const { clientTimeStamp } = move, moveData = __rest(move, ["clientTimeStamp"]);
        this.player1.send(JSON.stringify({
            type: messages_1.MOVE,
            payload: {
                move: moveData,
                board: this.board.board(),
                check,
                whiteTime: this.whiteTime,
                blackTime: this.blackTime,
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.MOVE,
            payload: {
                move: moveData,
                board: this.board.board(),
                check,
                whiteTime: this.whiteTime,
                blackTime: this.blackTime,
            }
        }));
        this.moveCount++;
        this.sendTurn();
    }
    sendTurn() {
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
    sendGameOver(isDraw = false, message = "") {
        if (isDraw) {
            this.player1.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    isDraw,
                    message,
                }
            }));
            this.player2.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    isDraw,
                    message
                }
            }));
        }
        else {
            this.player1.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? 'b' : 'w',
                    message
                }
            }));
            this.player2.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'b' ? 'w' : 'b',
                    message
                }
            }));
        }
        this.emit('gameOver', this.player1, this.player2);
    }
    handleTimeout(data) {
        this.player1.send(JSON.stringify({
            type: messages_1.GAME_OVER,
            payload: {
                winner: data.player === 'w' ? 'b' : 'w',
                message: "by Timeout"
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.GAME_OVER,
            payload: {
                winner: data.player === 'b' ? 'w' : 'b',
                message: "by Timeout"
            }
        }));
        this.emit('gameOver', this.player1, this.player2);
    }
    handleClockHeartbeat(player, data) {
        let now = Date.now();
        let lag = now - data.clientTimeStamp;
        let effectiveLag = Math.min(lag, 200);
        let timeTaken = now - data.clientTimeStamp - effectiveLag;
        if (data.turn === 'w') {
            this.whiteTime -= timeTaken;
        }
        else {
            this.blackTime -= timeTaken;
        }
        this.serverTimeStamp = now;
        player.send(JSON.stringify({
            type: messages_1.CLOCK_HEARTBEAT,
            payload: {
                whiteTime: this.whiteTime,
                blackTime: this.blackTime
            }
        }));
    }
}
exports.Game = Game;
