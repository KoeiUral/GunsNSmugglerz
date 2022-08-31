
const METEOR_SIZE = 17;
const METEOR_VEL = -7.5;
const METEOR_HP = 1;
const METEOR_SCORE = 1;

const FOLLOW_SIZE = 5;
const FOLLOW_VEL = 5;
const FOLLOW_HP = 1;
const FOLLOW_SCORE = 50;

const KAMI_S_W = 20;
const KAMI_S_H = 5;
const KAMI_VEL = 15;
const KAMI_HP = 1;
const KAMI_SCORE = 100;

const TANK_S_W = 90;
const TANK_S_H = 30;
const TANK_VEL_X = -5;
const TANK_VEL_Y = 0;
const TANK_HP = 5;
const TANK_SCORE = 50;



const CRUISER_W = 1000;
const CRUISER_H = 400;
const CRUISER_SEGS = 20;
const CRUISER_VEL = -1;


class Junk extends Item {
    constructor(x, y, size) {
        let verse = (random() > 0.5) ? 1 : -1;
        let vx = verse * random (15, 30); // Why 15 -30 ??

        verse = (random() > 0.5) ? 1 : -1;
        let vy = verse * random (15, 30); // Why 15 -30 ??

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
    constructor(x, y, s, v, target) {
        super(x, y, s, s, v, v, FOLLOW_HP, FOLLOW_SCORE);
        this.trail = true;
        this.origX = 0;
        this.origY = 0;
        this.exit = 1;
        this.target = target;
    }

    move() {
        if (this.posX <= this.target.posX) {
            let d = dist(this.posX, this.posY, this.target.posX, this.target.posY);

            this.posX += (this.target.posX - this.posX) * this.velX / d;
            this.posY += (this.target.posY - this.posY) * this.velY / d;
        }
        else {
            if (this.origX == 0) {
                this.origX = this.posX;
                this.origY = this.posY;

                this.exit = (this.posY > engine.ch / 2) ? 1 : -1;
            }

            this.posX += 8;
            this.posY = this.origY + this.exit * pow(this.posX - this.origX, 2) / 100;
        }

        // Updated the sliding window buffer
        if (this.trail) {
            this.storeTrail();
        }
    }
}

class FollowerNg extends Follower {
    constructor(x, y, s, v, target, shots) {
        super(x, y, s * 1.8, v * 1.3, target);
        this.shots = shots;
        this.fireFreq = 20;
        this.frameOff = frameCount;
    }

    fire() {
        if ((abs(this.posY - this.target.posY) < 50) && ((frameCount - this.frameOff) % this.fireFreq === 0)) {
            this.shots.addDir(this.posX + this.w, this.posY + this.h /2, SHOT_VEL, 0);
        }
    }
}


class Kamikaze extends Item {
    constructor(w, h, target) {
        let startPos = random(3);
        let posX = 0;
        let posY = 0;

        if (startPos < 0.2) {
            posX = w - random(w/10);
        }
        else if (startPos > 2.7 ){
            posX = w - random(w/10);
            posY = h;
        }
        else  {
            posX = w;
            posY = random(h);
        }


        let d = dist(posX, posY, target.posX, target.posY);
        let velX = (target.posX - posX) * KAMI_VEL / d;
        let velY = (target.posY - posY) * KAMI_VEL / d;

        super(posX, posY, KAMI_S_W, KAMI_S_H, velX, velY, KAMI_HP, KAMI_SCORE);
    }
}


class Tank extends Item {
    constructor(x, y, target, shots) {
        super(x, y, TANK_S_W, TANK_S_H, TANK_VEL_X, TANK_VEL_Y, TANK_HP, TANK_SCORE);
        this.target = target;
        this.shots = shots;
        this.frameOff = frameCount;
        this.fireFreq = 100;
        this.fireToggle = 0;
    }

    fire() {
        if ((frameCount - this.frameOff) % this.fireFreq === 0) {
            let d = dist(this.target.posX, this.target.posY, this.posX, this.posY) * 2; // 2 * to reduce the shot velocity
            let velX = (this.target.posX - this.posX) * SHOT_VEL / d;
            let velY = (this.target.posY - this.posY) * SHOT_VEL / d;

            let xOffset = (this.fireToggle === 0) ? this.w / 4 : this.w * 3 / 4;
            let yOffset = (this.target.posY > this.PosY) ? this.h : -this.h;
            this.fireToggle = (this.fireToggle === 0) ? 1 : 0;

            this.shots.addDir(this.posX + xOffset, this.posY + yOffset, velX, velY);
        }
    }
}


class StarCruiser {
    constructor(x, y, target, shots) {
        this.segments = [];
        this.windows = [];
        this.target = target;
        this.shots = shots;

        let xi = 0;
        let yi = 0;
        let wi = 0;
        let hi = 0;

        // Create all the items composing the cruiser
        for (let i = 0; i < CRUISER_SEGS; i++) {
            xi = x + i * CRUISER_W / CRUISER_SEGS;
            yi = y + (CRUISER_H / 2) * (1 - (i + 1) / CRUISER_SEGS);
            wi = CRUISER_W / CRUISER_SEGS;
            hi = (i + 1) * CRUISER_H / CRUISER_SEGS;

            this.segments.push(new Item(xi, yi, wi, hi, CRUISER_VEL, 0, 100, 10000));
            this.segments[i].halo = false;
        }
    }

    intersects(other) {
        let overlap = false;

        for (let it of this.segments) {
            overlap = it.intersects(other);

            if (overlap) {
                break;
            }
        }

        return overlap;
    }

    hit() {
        this.segments[0].hit();
    }

    isDead() {
        return (this.segments[0].isDead());
    }

    move() {
        for (let it of this.segments) {
            it.move();
        }
    }

    show() {
        for (let it of this.segments) {
            it.show();
        }
    }
}