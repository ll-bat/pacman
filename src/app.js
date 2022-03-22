const GAME_LEVEL = `
    ######################################################
    #oooooooooxooooooooooooooooooooooooooooxoooooooooooox#
    #o########################################ooo#######o#
    #oooooooooooxoooooooooooooooooooooooooooooxooooooooox#
    #o#####################ooo##########################o#
    #oooooooooooooooooxooooooooooooooooooooooooooooooooox#
    #o##################################################o#
    #o#ooooooooooooooooooooooooooooooooooooooooooooooooxo#
    #o#o#o#o#####o####o######o######o####o################   
    #o#o#o#o#ooooo#oo#o#ooooooooooo#o#oo#o#oooooooooooooo# 
    #ooopo#o#k###oooooo#o#########o#oooooo#oooooooooooooo#  
    #o#o#o#o#ooo#o#oo#o#ooooooooooo#o#oo#oooooooooooooooo#
    #o#o#o#o#####o####o######o######o####o################              
    #o#oooooooooooooooooooooooooooooooooooooooooooooooooo#
    #o#o###############################################oo#
    #o#oooooxoooooooooooooxooooooooooooooooxooooooooooooo#
    #o#o......................o#######o.................o#
    #o#o......................o#ooooo#o.................o#
    #o#o......................o#oo#oo#o.................o#
    #o#o......................o#oo#oo#o.................o#
    #o#ooooooooooooooooooooooooooo#oooooooooooooooooooooo#
    #o##########o#o###########o#oo#oo#o##########o#o####o#
    #ooooooxooooo#oooooooxooooo#ooooo#ooooooxooooo#oooooo#
    ###################################################### 
`

const STATE_STOPPED = 'stopped';
const STATE_PLAYING = 'playing';

const MOVING_LEFT = 'left';
const MOVING_RIGHT = 'right';
const MOVING_UP = 'up';
const MOVING_DOWN = 'down';
let MOVING_DIR = null;

function setStyle(el, style) {
    for (const key in style) {
        el.style[key] = style[key];
    }
}

function elt(el, cls, id, style) {
    const element = document.createElement(el);
    if (cls) element.className = cls;
    if (id) element.setAttribute('id', id);
    if (style) setStyle(element, style);
    return element
}

const $container = elt('div', 'game')
document.body.append($container);

class Renderer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    update() {
    }
}

const PLAYER_WIDTH = 25
const PLAYER_HEIGHT = 25
const ENEMY_WIDTH = 25
const ENEMY_HEIGHT = 25
const WALL_WIDTH = 35
const WALL_HEIGHT = 35
const COIN_WIDTH = 20
const COIN_HEIGHT = 20

const TYPE_WALL = 'wall';
const TYPE_PLAYER = 'player';
const TYPE_COIN = 'coin';
const TYPE_KILL_COIN = 'kill_coin'
const TYPE_EMPTY_CELL = 'empty_cell'
const TYPE_ENEMY = 'enemy'

let isGameStarted = false;
let player = null;

const PLAYER_SPEED = 4.5;

class MoveHelper {
    static canGoUp(x, y, speed) {
        const playerLeftX = x;
        const playerRightX = x + PLAYER_WIDTH;
        const playerTopY = y;
        const playerBottomY = y + PLAYER_HEIGHT;
        for (const row of game.characters) {
            for (const cellObject of row) {
                if (cellObject.getType() === TYPE_WALL) {
                    const wallLeft = cellObject.x;
                    const wallRight = wallLeft + WALL_WIDTH;
                    if (wallRight > playerLeftX && wallLeft < playerRightX) {
                        const wallTopY = cellObject.y;
                        const wallBottomY = cellObject.y + WALL_HEIGHT;
                        if (playerTopY - speed < wallBottomY && playerBottomY > wallBottomY) {
                            console.log(wallLeft, wallRight, wallBottomY)
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    static canGoDown(x, y, speed) {
        const playerLeftX = x;
        const playerRightX = x + PLAYER_WIDTH;
        const playerTopY = y;
        const playerBottomY = y + PLAYER_HEIGHT;
        for (const row of game.characters) {
            for (const cellObject of row) {
                if (cellObject.getType() === TYPE_WALL) {
                    const wallLeft = cellObject.x;
                    const wallRight = wallLeft + WALL_WIDTH;
                    if (wallRight > playerLeftX && wallLeft < playerRightX) {
                        const wallTopY = cellObject.y;
                        const wallBottomY = cellObject.y + WALL_HEIGHT;
                        if (playerBottomY + speed > wallTopY && playerTopY < wallTopY) {
                            console.log(wallLeft, wallRight, wallBottomY)
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    static canGoLeft(x, y, speed) {
        const playerLeftX = x;
        const playerRightX = x + PLAYER_WIDTH;
        const playerTopY = y;
        const playerBottomY = y + PLAYER_HEIGHT;
        for (const row of game.characters) {
            for (const cellObject of row) {
                if (cellObject.getType() === TYPE_WALL) {
                    const wallTopY = cellObject.y;
                    const wallBottomY = cellObject.y + WALL_HEIGHT;
                    if (wallTopY < playerBottomY && wallBottomY > playerTopY) {
                        const wallLeft = cellObject.x;
                        const wallRight = wallLeft + WALL_WIDTH;
                        if (playerLeftX - speed < wallRight && playerRightX > wallLeft) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    static canGoRight(x, y, speed) {
        const playerLeftX = x;
        const playerRightX = x + PLAYER_WIDTH;
        const playerTopY = y;
        const playerBottomY = y + PLAYER_HEIGHT;
        for (const row of game.characters) {
            for (const cellObject of row) {
                if (cellObject.getType() === TYPE_WALL) {
                    const wallTopY = cellObject.y;
                    const wallBottomY = cellObject.y + WALL_HEIGHT;
                    if (wallTopY < playerBottomY && wallBottomY > playerTopY) {
                        const wallLeft = cellObject.x;
                        const wallRight = wallLeft + WALL_WIDTH;
                        if (playerRightX + speed > wallLeft && playerLeftX < wallLeft) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
}

class Player extends Renderer {
    constructor(...props) {
        super(...props);
        this.$player = null;
        this.isKillMode = false;
        this.speed = PLAYER_SPEED;
        this.killModeTimeout = false;
    }

    render() {
        if (!this.$player) {
            this.$player = elt('div', 'player', null, {
                position: 'absolute',
                top: this.y + 'px',
                left: this.x + 'px',
                width: PLAYER_WIDTH + 'px',
                height: PLAYER_HEIGHT + 'px',
                background: 'rgb(197,121,19)',
                borderRadius: "50%",
                zIndex: "99",
            })
        } else {
            setStyle(this.$player, {
                left: this.x + 'px',
                top: this.y + 'px',
            })
        }
        $container.append(this.$player);
    }

    static create(...params) {
        return new Player(...params);
    }

    getType() {
        return TYPE_PLAYER;
    }

    eatCoins() {
        for (const row of game.characters) {
            for (const cellObject of row) {
                if (cellObject.getType() === TYPE_COIN || cellObject.getType() === TYPE_KILL_COIN) {
                    if (cellObject.isEaten) continue;
                    const coinLeft = cellObject.x;
                    const coinRight = cellObject.x + COIN_WIDTH;
                    const coinTop = cellObject.y;
                    const coinBottom = cellObject.y + COIN_HEIGHT;

                    const playerLeft = player.x
                    const playerRight = player.x + PLAYER_WIDTH
                    const playerTop = player.y
                    const playerBottom = player.y + PLAYER_HEIGHT;

                    let touches = false;
                    if (playerRight > coinLeft && playerLeft < coinLeft) {
                        if (playerTop < coinBottom && playerBottom > coinBottom) {
                            touches = true;
                        } else if (playerBottom > coinTop && playerTop < coinTop) {
                            touches = true;
                        }
                    } else if (playerLeft < coinRight && playerRight > coinRight) {
                        if (playerTop < coinBottom && playerBottom > coinBottom) {
                            touches = true;
                        } else if (playerBottom > coinTop && playerTop < coinTop) {
                            touches = true;
                        }
                    }

                    if (touches) {
                        cellObject.isEaten = true;
                        if (cellObject.getType() === TYPE_KILL_COIN) {
                            player.isKillMode = true;
                            player.speed += 2
                            if (player.isKillMode) {
                                clearTimeout(player.killModeTimeout)
                            }
                            player.killModeTimeout = setTimeout(() => {
                                player.isKillMode = false;
                                player.speed = PLAYER_SPEED;
                                player.killModeTimeout = false;
                            }, 10 * 1000)
                        }
                    }
                }
            }
        }
    }

    update() {
        if (MOVING_DIR === MOVING_LEFT) {
            if (MoveHelper.canGoLeft(this.x, this.y, this.speed)) {
                this.x -= this.speed;
            }
        } else if (MOVING_DIR === MOVING_RIGHT) {
            if (MoveHelper.canGoRight(this.x, this.y, this.speed)) {
                this.x += this.speed;
            }
        } else if (MOVING_DIR === MOVING_UP) {
            if (MoveHelper.canGoUp(this.x, this.y, this.speed)) {
                this.y -= this.speed;
            }
        } else if (MOVING_DIR === MOVING_DOWN) {
            if (MoveHelper.canGoDown(this.x, this.y, this.speed)) {
                this.y += this.speed;
            }
        }

        this.eatCoins()
    }
}

const ENEMY_SPEED = 2;

class Enemy extends Renderer {
    constructor(...props) {
        super(...props)
        this.dir = null;
        this.moveInterval = null;
        this.$enemy = null;
        this.speed = ENEMY_SPEED + Math.random() * ENEMY_SPEED * 2
        this.isKilled = false;
    }

    render() {
        if (this.isKilled) {
            this.x = this.y = -1;
            setStyle(this.$enemy, {
                display: "none",
            });
            return;
        }
        if (!this.$enemy) {
            this.$enemy = elt('div', 'enemy', null, {
                position: 'absolute',
                top: this.y + 'px',
                left: this.x + 'px',
                width: ENEMY_WIDTH + 'px',
                height: ENEMY_HEIGHT + 'px',
                background: 'red',
                borderRadius: '50%',
                zIndex: "50",
            })
        } else {
            setStyle(this.$enemy, {
                left: this.x + 'px',
                top: this.y + 'px',
            })
        }
        $container.append(this.$enemy);
    }

    static create(...params) {
        return new Enemy(...params);
    }

    getType() {
        return TYPE_ENEMY
    }

    setDirection() {
        if (this.moveInterval) {
            if (this.dir === MOVING_LEFT && MoveHelper.canGoLeft(this.x, this.y, this.speed)) {
                this.x -= this.speed;
            } else if (this.dir === MOVING_RIGHT && MoveHelper.canGoRight(this.x, this.y, this.speed)) {
                this.x += this.speed;
            } else if (this.dir === MOVING_UP && MoveHelper.canGoUp(this.x, this.y, this.speed)) {
                this.y -= this.speed;
            } else if (this.dir === MOVING_DOWN && MoveHelper.canGoDown(this.x, this.y, this.speed)) {
                this.y += this.speed;
            } else {
                clearTimeout(this.moveInterval);
                this.moveInterval = null;
                this.dir = null;
            }
            this.checkCollisionToPlayer();
            return;
        }

        this.dir = null;
        const canGoLeft = MoveHelper.canGoLeft(this.x, this.y, this.speed);
        const canGoRight = MoveHelper.canGoRight(this.x, this.y, this.speed);
        const canGoUp = MoveHelper.canGoUp(this.x, this.y, this.speed);
        const canGoDown = MoveHelper.canGoDown(this.x, this.y, this.speed);
        const randomNumber = Math.random();
        const xDirection = randomNumber > .5;
        if (xDirection) {
            if (Math.abs(player.x - this.x) > 4 * PLAYER_WIDTH) {
                // noinspection DuplicatedCode
                if (player.x < this.x && canGoLeft) {
                    this.dir = MOVING_LEFT;
                } else if (player.x > this.x && canGoRight) {
                    this.dir = MOVING_RIGHT
                } else if (player.y < this.y && canGoUp) {
                    this.dir = MOVING_UP;
                } else if (player.y > this.y && canGoDown) {
                    this.dir = MOVING_DOWN;
                }
            } else {
                // noinspection DuplicatedCode
                if (player.y < this.y && canGoUp) {
                    this.dir = MOVING_UP;
                } else if (player.y > this.y && canGoDown) {
                    this.dir = MOVING_DOWN;
                } else if (player.x < this.x && canGoLeft) {
                    this.dir = MOVING_LEFT;
                } else if (player.x > this.x && canGoRight) {
                    this.dir = MOVING_RIGHT
                }
            }
        } else {
            if (Math.abs(player.y - this.y) > 4 * PLAYER_HEIGHT) {
                // noinspection DuplicatedCode
                if (player.y < this.y && canGoUp) {
                    this.dir = MOVING_UP;
                } else if (player.y > this.y && canGoDown) {
                    this.dir = MOVING_DOWN;
                } else if (player.x < this.x && canGoLeft) {
                    this.dir = MOVING_LEFT;
                } else if (player.x > this.x && canGoRight) {
                    this.dir = MOVING_RIGHT
                }
            } else {
                // noinspection DuplicatedCode
                if (player.x < this.x && canGoLeft) {
                    this.dir = MOVING_LEFT;
                } else if (player.x > this.x && canGoRight) {
                    this.dir = MOVING_RIGHT
                } else if (player.y < this.y && canGoUp) {
                    this.dir = MOVING_UP;
                } else if (player.y > this.y && canGoDown) {
                    this.dir = MOVING_DOWN;
                }
            }
        }
        if (this.dir === MOVING_LEFT && canGoLeft) {
            this.x -= this.speed;
        } else if (this.dir === MOVING_RIGHT && canGoRight) {
            this.x += this.speed;
        } else if (this.dir === MOVING_UP && canGoUp) {
            this.y -= this.speed;
        } else if (this.dir === MOVING_DOWN && canGoDown) {
            this.y += this.speed;
        }

        this.checkCollisionToPlayer()

        this.moveInterval = setTimeout(() => {
            this.moveInterval = null;
        }, 300);
    }

    checkCollisionToPlayer() {
        const enemyLeft = this.x;
        const enemyRight = this.x + ENEMY_WIDTH;
        const enemyTop = this.y;
        const enemyBottom = this.y + ENEMY_HEIGHT;
        const playerLeft = player.x;
        const playerRight = player.x + PLAYER_WIDTH;
        const playerTop = player.y;
        const playerBottom = player.y + PLAYER_HEIGHT;
        let touches = false;
        if (enemyLeft < playerRight && enemyRight > playerRight) {
            if (enemyTop < playerBottom && enemyBottom > playerBottom) {
                touches = true;
            }
            if (enemyBottom > playerTop && enemyTop < playerTop) {
                touches = true;
            }
        } else if (enemyRight > playerLeft && enemyLeft < playerLeft) {
            if (enemyTop < playerBottom && enemyBottom > playerBottom) {
                touches = true;
            }
            if (enemyBottom > playerTop && enemyTop < playerTop) {
                touches = true;
            }
        }
        if (touches) {
            if (player.isKillMode) {
                this.isKilled = true;
            } else {
                game.state = STATE_STOPPED
            }
        }
    }

    update() {
        this.setDirection()
    }
}

class Coin extends Renderer {
    constructor(...props) {
        super(...props)
        this.degree = Math.random() * 360;
        this.baseX = this.x;
        this.baseY = this.y;
        this.isEaten = false;
        this.$coin = null;
    }

    getOffsetX() {
        return (WALL_WIDTH - COIN_WIDTH) / 2
    }

    getOffsetY() {
        return (WALL_HEIGHT - COIN_HEIGHT) / 2
    }

    render() {
        if (this.isEaten) {
            setStyle(this.$coin, {
                display: 'none',
            })
            return;
        }
        if (!this.$coin) {
            this.$coin = elt('div', 'wall', null, {
                position: 'absolute',
                top: this.y + this.getOffsetY() + 'px',
                left: this.x + this.getOffsetX() + 'px',
                width: COIN_WIDTH + 'px',
                height: COIN_HEIGHT + 'px',
                background: "orange",
                borderRadius: "50%",
                zIndex: "1",
            })
        } else {
            setStyle(this.$coin, {
                left: this.x + this.getOffsetX() + 'px',
                top: this.y + this.getOffsetX() + 'px',
            })
        }
        $container.append(this.$coin)
    }

    static create(...params) {
        return new Coin(...params);
    }

    getType() {
        return TYPE_COIN
    }

    update() {
        this.x = this.baseX + Math.sin(this.degree)
        this.y = this.baseY + Math.cos(this.degree)
        this.degree += .5;
    }
}

class KillCoin extends Coin {
    constructor(...props) {
        super(...props)
        this.degree = Math.random() * 360;
        this.baseX = this.x;
        this.baseY = this.y;
        this.isEaten = false;
        this.$coin = null;
    }

    getOffsetX() {
        return (WALL_WIDTH - COIN_WIDTH) / 2
    }

    getOffsetY() {
        return (WALL_HEIGHT - COIN_HEIGHT) / 2
    }

    render() {
        super.render();
        setStyle(this.$coin, {
            background: 'purple',
        })
    }

    static create(...params) {
        return new KillCoin(...params);
    }

    getType() {
        return TYPE_KILL_COIN
    }

    update() {
        this.x = this.baseX + Math.sin(this.degree)
        this.y = this.baseY + Math.cos(this.degree)
        this.degree += .5;
    }
}

class Wall extends Renderer {
    constructor(...props) {
        super(...props)
        this.$wall = null;
    }

    render() {
        if (!this.$wall) {
            this.$wall = elt('div', 'wall', null, {
                position: 'absolute',
                top: this.y + 'px',
                left: this.x + 'px',
                width: WALL_WIDTH + 'px',
                height: WALL_HEIGHT + 'px',
                background: "darkcyan",
                zIndex: "1",
            })
            $container.append(this.$wall)
        }
    }

    static create(...params) {
        return new Wall(...params);
    }

    getType() {
        return TYPE_WALL;
    }
}

class LeftWall extends Wall {
    constructor(...props) {
        super(...props);
    }

    render() {
        super.render();
        setStyle(this.$wall, {
            background: '',
            borderLeft: '5px solid darkcyan',
        })
    }

    static create(...params) {
        return new LeftWall(...params);
    }
}

class RightWall extends Wall {
    constructor(...props) {
        super(...props);
    }

    render() {
        super.render();
        setStyle(this.$wall, {
            background: '',
            borderRight: '5px solid darkcyan',
            left: this.x - 5 + 'px',
        })
    }

    static create(...params) {
        return new RightWall(...params);
    }
}

class TopWall extends Wall {
    constructor(...props) {
        super(...props);
    }

    render() {
        super.render();
        setStyle(this.$wall, {
            background: '',
            borderTop: '5px solid darkcyan',
        })
    }

    static create(...params) {
        return new TopWall(...params);
    }
}

class BottomWall extends Wall {
    constructor(...props) {
        super(...props);
    }

    render() {
        super.render();
        setStyle(this.$wall, {
            background: '',
            borderBottom: '5px solid darkcyan',
            top: this.y - 5 + 'px',
        })
    }

    static create(...params) {
        return new BottomWall(...params);
    }
}

class EmptyCell extends Renderer {
    constructor(...props) {
        super(...props)
        this.$emptyCell = null;
    }

    render() {
        if (!this.$emptyCell) {
            this.$emptyCell = elt('div', 'empty-cell', null, {
                position: 'absolute',
                top: this.y + 'px',
                left: this.x + 'px',
                width: WALL_WIDTH + 'px',
                height: WALL_HEIGHT + 'px',
                background: "rgb(246,237,237)",
                border: '1px solid rgb(246,237,237)',
                borderColor: 'rgb(250,245,245)',
                zIndex: "1",
            })
            $container.append(this.$emptyCell)
        }
    }

    static create(...params) {
        return new EmptyCell(...params);
    }

    getType() {
        return TYPE_EMPTY_CELL;
    }
}

class SlowCell extends EmptyCell {
    constructor(...props) {
        super(...props);
    }

    render() {
        super.render()
        setStyle(this.$emptyCell, {
            background: 'rgb(241,232,221)',
            borderColor: 'rgb(241,232,221)',
        })
    }

    static create(...params) {
        return new SlowCell(...params);
    }
}

const PLAYER_CHAR = {
    '#': Wall,
    "o": Coin,
    'p': Player,
    "x": Enemy,
    ' ': EmptyCell,
    'l': LeftWall,
    'r': RightWall,
    't': TopWall,
    'b': BottomWall,
    '.': SlowCell,
    'k': KillCoin,
}

function getClassByChar(char) {
    if (PLAYER_CHAR[char] !== undefined) {
        return PLAYER_CHAR[char]
    }
    return DOMException();
}

class Level {
    constructor(level) {
        this.level = this.normalize(level)
    }

    normalize(level) {
        return level
            .trim()
            .split('\n')
            .map(line => line.trim())
            .map(line => line.split(''))
    }

    getLevel() {
        return this.level;
    }
}

class Game {
    constructor(level) {
        // Level object
        this.state = STATE_STOPPED;
        this.level = level;
        this.characters = [];
    }

    render() {
        const gameLevel = this.level.getLevel()
        if (isGameStarted) {
            for (const [i, characters] of gameLevel.entries()) {
                for (const [j, char] of characters.entries()) {
                    this.characters[i][j].render();
                }
            }
        } else {
            for (const [i, characters] of gameLevel.entries()) {
                const row = []
                for (const [j, char] of characters.entries()) {
                    const charClass = getClassByChar(char);
                    const charObject = charClass.create(j * WALL_HEIGHT, i * WALL_WIDTH)
                    charObject.render()
                    row.push(charObject);
                    if (charObject.getType() === TYPE_PLAYER) {
                        player = charObject;
                    }
                }
                this.characters.push(row);
            }
        }
    }

    runApplication(fn) {
        const self = this;

        function run() {
            if (self.state === STATE_PLAYING) {
                fn();
                window.requestAnimationFrame(run)
            }
        }

        window.requestAnimationFrame(run)
    }

    registerEvents() {
        document.addEventListener('keydown', e => {
            if (e.key === "ArrowLeft") {
                MOVING_DIR = MOVING_LEFT
            } else if (e.key === "ArrowRight") {
                MOVING_DIR = MOVING_RIGHT
            } else if (e.key === "ArrowUp") {
                MOVING_DIR = MOVING_UP
            } else if (e.key === "ArrowDown") {
                MOVING_DIR = MOVING_DOWN
            }
        })
        document.addEventListener('keyup', e => {
            MOVING_DIR = null;
        })
    }

    destroy() {
        $container.innerHTML = ""
    }

    update() {
        for (const row of game.characters) {
            for (const cellObject of row) {
                cellObject.update();
            }
        }
    }

    setContainerBackgroundColor() {
        const pattern = this.level.getLevel()
        const rowCount = pattern.length;
        const columnCount = pattern[0].length;
        setStyle($container, {
            backgroundColor: "rgb(246,237,237)",
            width: columnCount * WALL_WIDTH + 'px',
            height: rowCount * WALL_HEIGHT + 'px',
        })
    }

    start() {
        this.setContainerBackgroundColor();

        this.render();
        this.registerEvents()
        this.state = STATE_PLAYING

        isGameStarted = true;
        this.runApplication(() => {
            // this.destroy()
            this.update();
            this.render();
        })
    }
}

const level = new Level(GAME_LEVEL)
const game = new Game(level);
game.start();

