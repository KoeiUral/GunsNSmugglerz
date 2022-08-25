
const METEOR_SIZE = 17;
const METEOR_VEL = -7.5;
const METEOR_HP = 1;
const METEOR_SCORE = 1;

const FOLLOW_SIZE = 5;
const FOLLOW_VEL = 5;
const FOLLOW_HP = 1;
const FOLLOW_SCORE = 50;


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
    constructor(x, y, s, v, target) {
        super(x, y, s, s, v, v, FOLLOW_HP, FOLLOW_SCORE);
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
            posY = 0;
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
        let velX = (target.posX - posX) * 15 / d;  // TODO: REMOVE MAGIC 10, it is the DEFAULT KAMI velocity
        let velY = (target.posY - posY) * 15 / d;  // TODO: REMOVE MAGIC 10, it is the DEFAULT KAMI velocity

        super(posX, posY, 20, 5, velX, velY, 1, 100);
    }
}


class Tank extends Item {
    constructor(x, y, target, shots) {
        super(x, y, 90, 30, -5, 0, 6, 50);
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