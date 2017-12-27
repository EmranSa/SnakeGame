var Keyboard = {
    //mapping key code
    Keymap: {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    },
    //Handle key
    KeyBoardEventHandler: function () {
        // Init
        var self = this;
        this.keyPress = null;
        this.keymap = Keyboard.Keymap;

        // Keydown Event
        document.onkeydown = function (event) {
            self.keyPress = event.which;
        };

        // Get Key
        this.getKey = function () {
            return this.keymap[this.keyPress];
        };
    }
};

var Component = {
    // Game Component Stage
    Stage: function (canvas, configuration) {
        // Init
        this.keyEvent = new Keyboard.KeyBoardEventHandler();
        this.width = canvas.width;
        this.height = canvas.height;
        this.length = [];
        this.food = {};
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
    },
    Snake: function (canvas, configuration) {
        // Game Stage
        this.gameContext = new Component.Stage(canvas, configuration);

        // Init Snake
        this.initSnake = function () {

            // Itaration in Snake Configuration Size
            for (var i = 0; i < this.gameContext.configuration.size; i++) {
                // Add Snake Cells
                this.gameContext.length.push({ x: i, y: 0 });
            }
        };

        // Call init Snake
        this.initSnake();

        // Init Food  
        this.initFood = function () {
            // Add food on gameContext
            this.gameContext.food = {
                x: Math.round(Math.random() * (this.gameContext.width - this.gameContext.configuration.cw) / this.gameContext.configuration.cw),
                y: Math.round(Math.random() * (this.gameContext.height - this.gameContext.configuration.cw) / this.gameContext.configuration.cw),
            };
        };

        // Init Food
        this.initFood();

        // Restart Stage
        this.restart = function () {
            this.gameContext.length = [];
            this.gameContext.food = {};
            this.gameContext.score = 0;
            this.gameContext.direction = 'right';
            this.gameContext.keyEvent.keyPress = null;
            this.initSnake();
            this.initFood();
        };
    }
};

var Game = {
    Draw: function (context, snake) {

        // Draw Stage
        this.drawStage = function () {

            // Check Keypress And Set Stage direction
            var keyPress = snake.gameContext.keyEvent.getKey();
            if (typeof (keyPress) != 'undefined') {
                snake.gameContext.direction = keyPress;
            }

            // Draw White Stage
            context.fillStyle = "white";
            context.fillRect(0, 0, snake.gameContext.width, snake.gameContext.height);

            // Snake Position
            var nx = snake.gameContext.length[0].x;
            var ny = snake.gameContext.length[0].y;

            // Add position by gameContext direction
            switch (snake.gameContext.direction) {
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
            if (this.collision(nx, ny)) {
                snake.restart();
                return;
            }

            // Logic of Snake food
            if (nx == snake.gameContext.food.x && ny == snake.gameContext.food.y) {
                var tail = { x: nx, y: ny };
                snake.gameContext.score++;
                snake.initFood();
            }
            else {
                var tail = snake.gameContext.length.pop();
                tail.x = nx;
                tail.y = ny;
            }
            snake.gameContext.length.unshift(tail);

            // Draw Snake
            for (var i = 0; i < snake.gameContext.length.length; i++) {
                var cell = snake.gameContext.length[i];
                this.drawCell(cell.x, cell.y, i == 0);
            }

            // Draw Food
            this.drawCell(snake.gameContext.food.x, snake.gameContext.food.y);

            // Draw Score
            context.fillText('Your Score: ' + snake.gameContext.score, snake.gameContext.width - 70, (snake.gameContext.height - 5));
        };

        // Draw Cell
        this.drawCell = function (x, y, isFirst) {
            if (isFirst) {
                context.fillStyle = 'rgb(255, 148, 0)';
            }
            else {
                context.fillStyle = 'rgb(0, 148, 255)';
            }
            context.beginPath();
            context.arc((x * snake.gameContext.configuration.cw + 6), (y * snake.gameContext.configuration.cw + 6), 4, 0, 2 * Math.PI, false);            
            context.fill();
        };

        // Check Collision
        this.collision = function (nx, ny) {
            return nx == -1 || nx == (snake.gameContext.width / snake.gameContext.configuration.cw) || ny == -1 || ny == (snake.gameContext.height / snake.gameContext.configuration.cw);
        }
    },
    Snake: function (elementId, configuration) {
        // Init
        var canvas = document.getElementById(elementId);
        var context = canvas.getContext("2d");
        var snake = new Component.Snake(canvas, configuration);
        var gameDraw = new Game.Draw(context, snake);

        // Game Interval
        setInterval(function () { gameDraw.drawStage(); }, snake.gameContext.configuration.fps);
    }

};

/*Onloading window*/
window.onload = function () {
    var snake = new Game.Snake('gameContext', { fps: 100, size: 4 });
};