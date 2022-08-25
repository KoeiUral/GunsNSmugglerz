const HALO = true;

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

    hit() {
        this.hp--;
    }

    isDead() {
        return (this.hp <= 0);
    }

    // Moves this rectangle by the provided x and y distances.
    move () {
        this.posX += this.velX;
        this.posY += this.velY;
    }

    setVel(vx, vy) {
        this.velX = vx;
        this.velY = vy;
    }

    show() {
        noStroke();

        if (HALO) {
            fill(255, 0, 255);
            rect(this.posX - 1, this.posY - 1, this.w, this.h);
            fill(0, 255, 255);
            rect(this.posX + 1, this.posY + 1, this.w, this.h);
        }

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
