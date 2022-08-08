
const ENEMY_SIZE = 30;
const ENEMY_VEL = -15;
const ENEMY_HP = 1;

class Star extends Item {
    constructor(x, y) {
        let dist = random(5);
        super(x, y, dist, dist, -dist, 0, 1);

        this.blincking = floor(random(20, 50));
    }

    show() {
        if (floor(frameCount / this.blincking) % 2 == 0) {
            noStroke();
            fill(200);
            rect(this.posX, this.posY, this.w, this.h);
        }
    }
}

class StarsBG {
    constructor() {
        this.list = [];

        for (let i = 0; i < 100; i++) {
            this.list.push(new Star(random(windowWidth), random(windowHeight)));
        }
    }

    update() {
        for (let i = 0; i < this.list.length; i++) {
            this.list[i].move();

            if(this.list[i].posX < 0) {
                this.list[i].posX = windowWidth;
                this.list[i].posY = random(windowHeight);
            }
        }       
    }

    show() {
        for (let i = 0; i < this.list.length; i++) {
            this.list[i].show();
        } 
    }
}


class Junk extends Item {
    constructor(x, y, size) {
        let verse = (random() > 0.5) ? 1 : -1;
        let vx = verse * random (15, 30);

        verse = (random() > 0.5) ? 1 : -1;
        let vy = verse * random() * random (15, 30);

        let s = (size < 4) ? 4 : size;
        super(x, y, s, s, vx, vy, 0, 0);
        this.opacity = 200;
    }

    show() {
        this.opacity -= 10;
        noStroke();
        fill(this.opacity);
        rect(this.posX, this.posY, this.w, this.h);
    }
}

class Enemy extends Item {
    constructor(x, y) {
        let factor = random(1, 3);
        super(x, y, ENEMY_SIZE * factor, ENEMY_SIZE * factor, ENEMY_VEL / factor, 0, ENEMY_HP * factor, 1);
    }
}

class Follower extends Item {
    constructor(x, y) {
        super(x, y, 10, 10, 0, 0, 1, 50);
        this.origX = 0;
        this.origY = 0;
        this.exit = 1;
    }

    move() {
        if (this.posX <= game.ship.posX) {
            let d = dist(this.posX, this.posY, game.ship.posX, game.ship.posY);

            this.posX += (game.ship.posX - this.posX) * 10 / d;
            this.posY += (game.ship.posY - this.posY) * 10 / d;
        }
        else {
            if (this.origX == 0) {
                this.origX = this.posX;
                this.origY = this.posY;

                this.exit = (this.posY > windowHeight / 2) ? 1 : -1;
            }

            this.posX += 8;
            this.posY = this.origY + this.exit * pow(this.posX - this.origX, 2) / 100;
        }
    }
}


