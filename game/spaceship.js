const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;
const FIRE = 4;

const SHIP_W = 17;
const SHIP_H = 9;
const SHIP_VEL_H = 6;
const SHIP_VEL_V = 4.5;
const SHOT_VEL = 18;
const SHOT_SIZE = 6;
const SHIP_HP = 5;
const OP_WORK = 400;
const FIRE_FREQ = 70;
const DASH_K = 4;

const DAMAGE_TICK = 3;


class SpaceShip extends Item {
    constructor(x, y) {
        super(x, y, SHIP_W, SHIP_H, SHIP_VEL_H, SHIP_VEL_V, SHIP_HP, 0); 
        this.posX = x;
        this.posY = y;
        this.immunity = 0;
        this.invincible = false;

        this.shots = new ShipShots();
        this.ops = [OP_WORK, OP_WORK, OP_WORK, OP_WORK, OP_WORK];
        this.workingOps = [0, 1, 2, 3, 4];
        this.rearFreq = FIRE_FREQ;
        this.rearOn = false;
        this.dashEnergy = 500; // TODO, remove MAGIC NBR
        this.dashOn = false;
        this.trailSampling = 2;
    }

    reset() {
        this.shots.list.splice(0, this.shots.list.length);
        this.rearFreq = FIRE_FREQ;
        this.rearOn = false;
        this.hp = SHIP_HP;
        
        for (let i = 0; i <  this.ops.length; i++) {
            this.ops[i] = OP_WORK;
        }

        this.workingOps = [0, 1, 2, 3, 4];
    }

    hit() {
        if ((this.invincible === false) && (this.immunity <= 0)) { 
            this.hp--;
            this.immunity = 20;  // TODO, remove MAGIC NBR
            let faultId = 0;
            let keyId = '';

            soundSet["HIT"].play();
            engine.gui.hk['Life'].val -= 100;

            if (this.workingOps.length > 0) {
                faultId = floor(random(this.workingOps.length));
                keyId = this.getFaultKey(this.workingOps[faultId]);

                this.ops[this.workingOps[faultId]] = 0;
                engine.gui.hk[keyId].active = 0;

                engine.gui.consoleBox(this.getFaultMsg(this.workingOps[faultId]) + " damaged!  ", engine.cw, engine.ch - 40, 600, 30, SCROLL_LEFT, 30);
                this.workingOps.splice(faultId, 1);
            }
        }
    }

    getFaultMsg(id) {
        let msg;
        switch (id) {
            case UP:
                msg = "-Y truster";
                break;
            case DOWN:
                msg = "+Y truster";
                break;
            case LEFT:
                msg = "-X truster";
                break;
            case RIGHT:
                msg = "+X truster";
                break;
            case FIRE:
                msg = "Shoot";
                break;
            default:
                break;
        }
        return msg;
    }

    getFaultKey(id) {
        let key;
        switch (id) {
            case UP:
                key = "Up";
                break;
            case DOWN:
                key = "Down";
                break;
            case LEFT:
                key = "Left";
                break;
            case RIGHT:
                key = "Right";
                break;
            case FIRE:
                key = "Fire";
                break;
            default:
                break;
        }
        return key;
    }

    isDead() {
        for (let opValue of this.ops) {
            if (opValue >= OP_WORK) {
                return false;
            }
        } 

        return true;
    }

    move(direction) {
        let faultFactor = 1;
        let dashFactor = 1;
        
        if (this.dashOn && this.dashEnergy > 50) {
            dashFactor = DASH_K;
            this.dashEnergy = this.dashEnergy - 25; // TODO: Remove magic

            this.storeTrail();
        }

        switch (direction) {
            case UP:
                faultFactor += (1 - (this.ops[UP] == OP_WORK)) * 2;
                this.posY -= (this.velY / faultFactor) * (dashFactor);
                break;
            case DOWN:
                faultFactor += (1 - (this.ops[DOWN] == OP_WORK)) * 2;
                this.posY += (this.velY  / faultFactor) * (dashFactor);;
                break;
            case LEFT:
                faultFactor += (1 - (this.ops[LEFT] == OP_WORK)) * 2;
                this.posX -= (this.velX / faultFactor) * (dashFactor);;
                break;
            case RIGHT:
                faultFactor += (1 - (this.ops[RIGHT] == OP_WORK)) * 2;
                this.posX += (this.velX / faultFactor) * (dashFactor);;
                break;

            default:
                break;
         }

        // Thrusters issue, stabilizier is off
        if (faultFactor > 1) {
            this.posX = this.posX + random(-1, 1);
            this.posY = this.posY + random(-1, 1);
        }

        // Wrap the postion
        if (this.posX > engine.cw - this.w) {
            this.posX = engine.cw - this.w;
        } else if (this.posX < 0) {
            this.posX = 0;
        }
        if (this.posY > engine.ch - this.h) {
            this.posY = engine.ch - this.h;
        } else if (this.posY < 0) {
            this.posY = 0;
        }
    }

    repair(inc) {
        for (let i = 0; i < this.ops.length; i++) {
            if (this.ops[i] < OP_WORK) {
                this.ops[i] = this.ops[i] + inc;
                engine.gui.hk['Rep'].val = this.ops[i];

                if (this.ops[i] >= OP_WORK) {
                    this.workingOps.push(i);
                    engine.gui.consoleBox(this.getFaultMsg(i) + "  repaired!  ", engine.cw, engine.ch - 40, 600, 30, SCROLL_LEFT, 30);

                    let keyId = this.getFaultKey(i);

                    engine.gui.hk['Rep'].val = 0;
                    engine.gui.hk['Life'].val += 100;
                    engine.gui.hk[keyId].active = 1;
                }
                break;
            }
        }

        // Restore Dash if not used
        if ((this.dashOn === false) && (this.dashEnergy < 500)) {
            this.dashEnergy = this.dashEnergy + inc;
        }

        engine.gui.hk['Dash'].val = this.dashEnergy;

        // Decrement immunity (if active)
        if (this.immunity > 0) {
            this.immunity--;
        }
    }

    fireBack(enemies) {
        if ((this.rearOn) && (frameCount % this.rearFreq === 0)) {
            for (const enemy of enemies) {
                if (enemy.posX < this.posX) {
                    let d = dist(enemy.posX, enemy.posY, this.posX, this.posY);
                    let velX = (enemy.posX - this.posX) * SHOT_VEL / d;
                    let velY = (enemy.posY - this.posY) * SHOT_VEL / d;

                    this.shots.addBack(this.posX, this.posY -this.h/2, velX, velY);
                    break;
                }
            }
        }
    }

    fire() {
        if (this.ops[FIRE] == OP_WORK) {
            this.shots.add(this.posX + this.w, this.posY - this.h/2);
        }
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

        if (!((this.ops[UP] < OP_WORK) && (floor(frameCount / 20) % 2 == 0))) {
            rect(this.posX - DAMAGE_TICK, this.posY - DAMAGE_TICK, this.w + DAMAGE_TICK, DAMAGE_TICK); 
        }

        if (!((this.ops[DOWN] < OP_WORK) && (floor(frameCount / 20) % 2 == 0))) {
            rect(this.posX -DAMAGE_TICK, this.posY + this.h, this.w + DAMAGE_TICK, DAMAGE_TICK); 
        }

        if (!((this.ops[LEFT] < OP_WORK) && (floor(frameCount / 20) % 2 == 0))) {
            rect(this.posX - DAMAGE_TICK, this.posY, DAMAGE_TICK, this.h);
        }

        if (!((this.ops[RIGHT] < OP_WORK) && (floor(frameCount / 20) % 2 == 0))) {
            rect(this.posX + this.w, this.posY, DAMAGE_TICK, this.h);
        }

        this.shots.update();

        if (this.dashOn && this.dashEnergy > 50) {
            this.showTrail();
        }
    }
}



class LineShot extends Item {
    constructor(x, y) {
        super(x, y, SHOT_SIZE * 3, SHOT_SIZE, SHOT_VEL, 0, 1, 0);
    }

    show() {
        textFont(fontSet["TEXTF"]);
        textAlign(CENTER, TOP);
        textSize(20 * engine.ch / DEFAULT_H);
        text("x", this.posX, this.posY);
    }
}

class ShipShots extends Shots {
    constructor (ship) {
        super();
    }

    add(x, y) {
        this.list.push(new LineShot(x, y));
    }

    addBack(x, y, vx, vy) {
        this.list.push(new DirShot(x, y, vx, vy)); 
    }
}