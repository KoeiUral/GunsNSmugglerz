const HALO = true;
const TRAIL_LEN = 3;

/**
 * Implements a general item wit basic functionality.
 */
class Item {
    constructor(px, py, w, h, vx, vy, life, score) {
        this.posX = px;
        this.posY = py;
        this.w = w;
        this.h = h;

        this.velX = vx;
        this.velY = vy;

        this.hp = life;
        this.score = score;
        this.halo = HALO;
        this.trail = false;
        this.trailSampling = 1;
        this.prevPos = [];
    }

    // Check intersection with any other Rectangle object.
    intersects(other) {
        return !(
            this.posX + this.w  <= other.posX            ||
            this.posX           >= other.posX + other.w  ||
            this.posY + this.h  <= other.posY            ||
            this.posY           >= other.posY + other.h
          );   
    }

    isOffScreen(W, H) {
        return (
            this.posX + this.w  <= 0  ||
            this.posX - this.w  >= W  ||
            this.posY + this.h  <= 0  ||
            this.posY - this.h  >= H
          );
    }

    hit() {
        this.hp--;
    }

    isDead() {
        return (this.hp <= 0);
    }

    storeTrail() {
        if (frameCount % this.trailSampling === 0) {
            // Updated the sliding window buffer
            this.prevPos.push({x: this.posX, y:this.posY});

            if (this.prevPos.length > TRAIL_LEN) {
                this.prevPos.splice(0, 1);
            }
        }
    }

    showTrail() {
        let len = this.prevPos.length - 1;

        for (let i = 0; i < len; i++) {
            fill(255, 255, 255, 55 + 50 * i);
            rect(this.prevPos[i].x, this.prevPos[i].y, this.w, this.h);
        }
    }

    // Moves this rectangle by the provided x and y distances.
    move () {
        this.posX += this.velX;
        this.posY += this.velY;

        if (this.trail) {
            this.storeTrail();
        }
    }

    setVel(vx, vy) {
        this.velX = vx;
        this.velY = vy;
    }

    show() {
        noStroke();

        // If trail on, draw the previous positions
        if (this.trail) {
            this.showTrail();
        }

        if (this.halo) {
            fill(255, 0, 255);
            rect(this.posX - 1, this.posY - 1, this.w, this.h);
            fill(0, 255, 255);
            rect(this.posX + 1, this.posY + 1, this.w, this.h);
        }

        // Draw the current position
        fill(255);
        rect(this.posX, this.posY, this.w, this.h);
    }

    resize(xScale, yScale) {
        this.w = this.w * xScale;
        this.h = this.h * yScale;
        
        this.posX = this.posX * xScale;
        this.posY = this.posY * yScale;
        this.velX = this.velX * xScale;
        this.velY = this.velY * yScale;
    }
}




class DirShot extends Item {
    constructor(x, y, vx, vy) {
        super(x, y, SHOT_SIZE, SHOT_SIZE, vx, vy, 1, 0);
    }

    show() {
        textFont(fontSet["TEXTF"]);
        textAlign(CENTER, CENTER);
        textSize(30 * engine.ch / DEFAULT_H);
        text("*", this.posX, this.posY);
    }
}

class Shots {
    constructor () {
        this.list = [];
    }

    addDir(x, y, vx, vy) {
        this.list.push(new DirShot(x, y, vx, vy)); 
    }

    update() {
        for (let i = 0; i < this.list.length; i++) {
            this.list[i].move();

            if ((this.list[i].posX >= 0)        && 
                (this.list[i].posX < engine.cw) &&
                (this.list[i].posY >= 0)        &&
                (this.list[i].posY < engine.ch)) {
                this.list[i].show();
            } else {
                this.list.splice(i, 1);
            }
        }
    }
}