
const METEOR_SIZE = 17;
const METEOR_VEL = -7.5;
const METEOR_HP = 1;
const METEOR_SCORE = 1;

const FOLLOW_SIZE = 5;
const FOLLOW_VEL = 5;
const FOLLOW_HP = 1;
const FOLLOW_SCORE = 50;

const STAR_SIZE = 5;

class Star extends Item {
    constructor(x, y) {
        let dist = random(STAR_SIZE);
        super(x, y, dist, dist, -dist, 0, 1);

        this.blincking = floor(random(20, 50));
    }

    show() {
        if (floor(frameCount / this.blincking) % 2 == 0) {
            noStroke();

            if (HALO) {
                fill(255, 0, 255, 180);
                rect(this.posX -1, this.posY -1, this.w, this.h);
                fill(0, 255, 255, 180);
                rect(this.posX +1, this.posY +1, this.w, this.h);     
            }

           fill(255, 255, 255, 200);
           rect(this.posX, this.posY, this.w, this.h);
        }
    }
}

class StarsBG {
    constructor(w, h) {
        this.cw = w;
        this.ch = h;
        this.list = [];

        for (let i = 0; i < 100; i++) {
            this.list.push(new Star(random(this.cw), random(this.ch)));
        }
    }

    update() {
        for (let star of this.list) {
            star.move();

            if (star.posX < 0) {
                star.posX = this.cw;
                star.posY = random(this.ch);
            }
        }       
    }

    show() {
        for (let star of this.list) {
            star.show();
        } 
    }

    resize(xs, ys) {
        this.cw = this.cw * xs;
        this.ch = this.ch * ys;

        for (let star of this.list) {
            star.resize(xs, ys);
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

class Meteor extends Item {
    constructor(x, y) {
        let factor = random(1, 3);
        super(x, y, METEOR_SIZE * factor, METEOR_SIZE * factor, METEOR_VEL / factor, 0, METEOR_HP * factor, METEOR_SCORE);
    }
}

class Follower extends Item {
    constructor(x, y) {
        super(x, y, FOLLOW_SIZE, FOLLOW_SIZE, FOLLOW_VEL, FOLLOW_VEL, FOLLOW_HP, FOLLOW_SCORE);
        this.origX = 0;
        this.origY = 0;
        this.exit = 1;
    }

    move() {
        if (this.posX <= game.ship.posX) {
            let d = dist(this.posX, this.posY, game.ship.posX, game.ship.posY);

            this.posX += (game.ship.posX - this.posX) * this.velX / d;
            this.posY += (game.ship.posY - this.posY) * this.velY / d;
        }
        else {
            if (this.origX == 0) {
                this.origX = this.posX;
                this.origY = this.posY;

                this.exit = (this.posY > game.ch / 2) ? 1 : -1;
            }

            this.posX += 8;
            this.posY = this.origY + this.exit * pow(this.posX - this.origX, 2) / 100;
        }
    }
}


