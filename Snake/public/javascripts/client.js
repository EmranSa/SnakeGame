"use strict";






class SignalR {
    /*let signalRHub;
    server: undefined,
    client: undefined,
    connectionid: undefined,*/
    
    init() {
        this.signalRHub = $.connection.signalRHub;

        this.client = this.signalRHub.client;


        let isInit = false;
        this.client.startBrodcastClient = (prevConnections, connectionid, userName, color) => {
            if (game == null) {
                return true;
            }
            const startNewGame = () => {
                if (!isInit) {
                    isInit = true;
                    $('#startGame').hide();
                    $('#snakes').show();
                    game.start();
                    this.getLastLocation();
                }
            };

            /*if (this.connectionid == connectionid || (this.game === null && this.connectionid != connectionid)) {
                startNewGame();
            }*/

            startNewGame();

            prevConnections.forEach((otherClient) => {
                if (otherClient.connectionid != connectionid) {
                    game.joinSnake(otherClient.connectionid, 'gray');
                }
            });

            //if (this.connectionid != connectionid) {
            //    game.joinSnake(connectionid, color);
            //}
        };

        //this.client.joinPrevSnake = (connectionid, clientJoinedConnectionid, userName, color) => {
        //    if (connectionid == this.connectionid) {
        //        game.joinSnake(connectionid, color);
        //    }
        //};

        this.client.setRemoteDirectionCallBack = (snakeId, direction) => {
            if (game !== null && snakeId != this.connectionid) {
                game.updateDirection(snakeId, direction);
            }
        };

        this.client.getLastLocationCallBack = (_lastFoodXY) => {
            food = _lastFoodXY;
        };

        this.client.generateFoodCallBack = (_lastFoodXY) => {
            food = _lastFoodXY;
        };

        this.client.globalResetCallBack = (Reset) => {
            location.reload();
        }

        $.connection.hub.start().done(() => {
            this.server = this.signalRHub.server;
            this.startNewClient = this.server.startNewClient;
            this.setRemoteDirection = this.server.setRemoteDirection;
            this.getLastLocation = this.server.getLastLocation;
            this.generateFood = this.server.generateFood;
            this.globalReset = this.server.globalReset;
            this.connectionid = $.connection.hub.id;
            //$.connection.$user(this.connectionid);
        }).fail((a) => {

        });
    }

}

const signalR = new SignalR();





//init keyboard, and get last pressed key
class Keyboard {
    constructor(keyDownCallBack) {
        //mapping key code
        this.Keymap = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        this.init();
        // Keydown Event
        document.onkeydown = (event) => {
            this.keyPress = event.which;
            keyDownCallBack(event);
        };
    }

    //initilize first default key
    init() {
        this.keyPress = 39;
    }

    get CurrentKey() {
        return this.Keymap[this.keyPress];
    }
}

let food = {};
class Snake {
    constructor(snakeId, canvas, context, configuration, readonly, color, scoreLocation) {
        // Init
        this.snakeId = snakeId;
        this.color = color;
        this.readonly = readonly;
        this.context = context;
        this.scoreLocation = scoreLocation;
        if (!readonly) {
            this.Keyboard = new Keyboard(()=> {
                signalR.setRemoteDirection(this.snakeId, this.Keyboard.CurrentKey);
            });
        }
        this.width = canvas.width;
        this.height = canvas.height;
        this.snakeLength = [];
        //this.food = {};
        this.score = 0;
        this.direction = 'right';
        this.configuration = {
            cw: 10,
            size: 5,
            fps: 1000
        };

        // Merge configuration
        if (typeof configuration == 'object') {
            for (var key in configuration) {
                if (configuration.hasOwnProperty(key)) {
                    this.configuration[key] = configuration[key];
                }
            }
        }

        // Call init Snake
        this.initSnake();

        // Init Food
        //this.initFood();
    }

    initFood(generateNewLoc = false) {
        if (generateNewLoc) {
            signalR.generateFood();
        }
        /*this.food = {
            x: Math.round(Math.random() * (this.width - this.configuration.cw) / this.configuration.cw),
            y: Math.round(Math.random() * (this.height - this.configuration.cw) / this.configuration.cw),
        };*/
    }

    initSnake() {
        this.snakeLength = [];
        // Itaration in Snake Configuration Size
        for (let i = 0; i < this.configuration.size; i++) {
            // Add Snake Cells
            this.snakeLength.push({ x: i, y: 0 });
        }
    }

    reset() {
        this.score = 0;
        this.direction = 'right';
        if (!this.readonly) {
            this.Keyboard.init();
        }

        this.initSnake();
        this.initFood();
    }

    checkCollision(nx, ny) {
        return nx == -1 || nx == (this.width / this.configuration.cw) || ny == -1 || ny == (this.height / this.configuration.cw);
    }

    updateDirection(newDirection) {
        this.direction = newDirection;
    }

    drawSnake() {
        // Snake Position
        var nx = this.snakeLength[0].x;
        var ny = this.snakeLength[0].y;

        if (!this.readonly) {
            // Check Keypress And Set Stage direction
            var keyPress = this.Keyboard.CurrentKey;
            if (typeof (keyPress) != 'undefined') {
                this.direction = keyPress;
            }
        }

        // Add position by gameContext direction
        switch (this.direction) {
            case 'right':
                nx++;
                break;
            case 'left':
                nx--;
                break;
            case 'up':
                ny--;
                break;
            case 'down':
                ny++;
                break;
        }


        // Check Collision
        if (this.checkCollision(nx, ny)) {
            this.reset();
            return;
        }

        // Logic of Snake food
        if (nx == food.x && ny == food.y) {
            var tail = { x: nx, y: ny };
            this.score++;
            this.initFood(true);
        }
        else {
            var tail = this.snakeLength.pop();
            tail.x = nx;
            tail.y = ny;
        }
        this.snakeLength.unshift(tail);

        // Draw Snake
        for (var i = 0; i < this.snakeLength.length; i++) {
            var cell = this.snakeLength[i];
            this.drawCell(cell.x, cell.y, i == 0);
        }

        // Draw Food
        this.drawCell(food.x, food.y);

        // Draw Score
        if (this.readonly) {
            this.context.fillText('Other Player: ' + this.score, (this.width - 70 - this.scoreLocation), (this.height - 5));
        }
        else {
            this.context.fillText('Your Score: ' + this.score, (this.width - 70 - this.scoreLocation), (this.height - 5));
        }
    }

    drawCell(x, y, isFirst) {
        /*if (isFirst) {
            this.context.fillStyle = 'rgb(255, 148, 0)';
        }
        else {
            this.context.fillStyle = this.color; //'rgb(0, 148, 255)';
        }*/

        this.context.fillStyle = this.color; //'rgb(0, 148, 255)';

        this.context.beginPath();
        this.context.arc((x * this.configuration.cw + 6), (y * this.configuration.cw + 6), 4, 0, 2 * Math.PI, false);
        this.context.fill();
    }
}

class Game {
    constructor(snakeId, elementId, configuration) {
        // Init
        this.scoreLocation = 0;
        this.canvas = document.getElementById(elementId);
        this.context = this.canvas.getContext("2d");
        this.snake = new Snake(snakeId, this.canvas, this.context, configuration, false, 'red', this.scoreLocation);
        this.otherUsersSnakes = [];
        this.timer = null;
        
    }

    start() {
        if (this.timer == null) {
            // Game Interval
            this.timer = setInterval(
                () => {
                    this.beginDrawing();
                    this.otherUsersSnakes.forEach((item) => {
                        item.snake.drawSnake();
                    });

                    this.snake.drawSnake();
                },
                this.snake.configuration.fps
            );
        }
    }

    pause() {
        this.timer = null;
        clearInterval(this.timer);
    }

    beginDrawing() {
        // Draw White Stage
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    joinSnake(snakeId, color) {
        this.scoreLocation += 100;
        this.otherUsersSnakes.push({
            snakeId: snakeId, snake: new Snake(snakeId, this.canvas, this.context, this.configuration, true, color, this.scoreLocation)
        });
    }

    updateDirection(snakeId, direction) {
        //key, value, caseinsensitive
        let obj = this.otherUsersSnakes.findInObject('snakeId', snakeId, true);
        if (obj != null) {
            obj.snake.updateDirection(direction);
        }
    }
};


let game = null;


$(document).ready(() => {
    signalR.init();
    $('#btnStart').click(() => {
        game = new Game(signalR.connectionid, 'gameContext', { fps: 100, size: 4 });
        signalR.startNewClient(signalR.connectionid, $('#userName').val(), 'gray', game.canvas.width, game.canvas.height);
    });
    $('#btnGlobalReset').click(() => {
        signalR.globalReset();
        location.reload();
    })
});