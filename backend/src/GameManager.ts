import { WebSocket } from "ws";
import { INIT_GAME, MOVE, TIMEOUT } from "./messages";
import { Game } from "./Game";


export class GameManager{
    private games:Game[];
    private pendingUser:WebSocket | null;
    private users:WebSocket[];

    constructor(){
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    handleGameEvents(game:Game){
        game.on('gameOver', (player1, player2) => {
            console.log(">>>>>>>>>>>Game Over");
            this.games = this.games.filter(game => game.player1 !== player1 && game.player2 !== player2);
        })
    }

    addUser(socket: WebSocket){
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket){
        const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
        if(game){
            game.sendGameOver(false, "User left the game");
        }
        this.games = this.games.filter(game => game.player1 !== socket && game.player2 !== socket);
        this.users = this.users.filter(user => user !== socket);

        if(this.pendingUser===socket){
            this.pendingUser = null;
        }

    }

    private addHandler(socket: WebSocket){
        socket.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if(message.type === INIT_GAME){
                if(this.pendingUser){
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.handleGameEvents(game);
                    this.pendingUser = null;
                }
                else{
                    this.pendingUser = socket;
                }
            }

            if(message.type === MOVE){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if(game){
                    game.makeMove(socket, message.payload.move);
                }
            }

            if(message.type === TIMEOUT){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);

                if(game){
                    game.handleTimeout(message.payload);
                }
            }

        })
    }

}