
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
    constructor(x, y, target) {
        super(x, y, FOLLOW_SIZE, FOLLOW_SIZE, FOLLOW_VEL, FOLLOW_VEL, FOLLOW_HP, FOLLOW_SCORE);
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


