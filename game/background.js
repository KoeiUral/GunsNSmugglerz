const STAR_SIZE = 5;

class Star extends Item {
    constructor(x, y) {
        let dist = random(STAR_SIZE);
        super(x, y, dist, dist, -dist, 0, 1);

        this.dist = dist;
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

class PerlinStarsBG extends StarsBG {
    constructor(w, h) {
        super(w, h);
        this.noiseOffset = random(100);
        this.noiseDelta = 0.001;
    }

    // Override update method
    update() {
        let angle = noise(this.noiseOffset) * TWO_PI;
        let force = p5.Vector.fromAngle(angle);
        force.setMag(2);
        
        this.noiseOffset += this.noiseDelta;

        for (let star of this.list) {
            star.setVel(force.x * star.dist, force.y * star.dist);
            star.move();

            if (star.posX < 0) {
                star.posX = this.cw;
                star.posY = random(this.ch);
            }
            else if (star.posX > this.cw) {
                star.posX = 0;
                star.posY = random(this.ch);
            }
            else if (star.posY < 0) {
                star.posX = random(this.cw);
                star.posY = this.ch;
            }
            else if (star.posY > this.ch) {
                star.posX = random(this.cw);
                star.posY = 0;
            }
        } 
    }
}