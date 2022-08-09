const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;
const FIRE = 4;
//const STAB = 5;

const SHIP_W = 30;
const SHIP_H = 15;
const SHIP_VEL_H = 10;
const SHIP_VEL_V = 5;
const SHOT_VEL = 30;
const SHOT_SIZE = SHIP_H / 3;
const SHIP_HP = 3;
const OP_WORK = 400;
const FIRE_FREQ = 70;


class SpaceShip extends Item {
    constructor(x, y) {
        super(x, y, SHIP_W, SHIP_H, 0, 0, SHIP_HP); 
        this.posX = x;
        this.posY = y;
        this.width = SHIP_W;
        this.height = SHIP_H;
        this.immunity = 0;

        this.shots = new Shots();
        this.ops = [OP_WORK, OP_WORK, OP_WORK, OP_WORK, OP_WORK];
        this.workingOps = [0, 1, 2, 3, 4];
        this.rearFreq = FIRE_FREQ;
        this.rearOn = false;
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
        if (this.immunity <= 0) { 
            this.hp--;
            this.immunity = 20;  // TODO, remove MAGIC NBR
            let faultId = 0;
            let keyId = '';

            //game.monoSynth.play('C1', 1, 0, 2);
            hitSound.play();
            game.gui.hk['Life'].val -= 100;

            if (this.workingOps.length > 0) {
                faultId = floor(random(this.workingOps.length));
                keyId = this.getFaultKey(this.workingOps[faultId]);

                this.ops[this.workingOps[faultId]] = 0;
                game.gui.hk[keyId].active = 0;

                game.gui.consoleLine(this.getFaultMsg(this.workingOps[faultId]) + " damaged!");
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
        for (let i = 0; i < this.ops.length; i++) {
            if (this.ops[i] >= OP_WORK) {
                return false;
            }
        }

        return true;
    }

    move(direction) {
        let faultFactor = 1;

        switch (direction) {
            case UP:
                faultFactor += (1 - (this.ops[UP] == OP_WORK)) * 2;
                this.posY -= SHIP_VEL_V / faultFactor;
                break;
            case DOWN:
                faultFactor += (1 - (this.ops[DOWN] == OP_WORK)) * 2;
                this.posY += SHIP_VEL_V  / faultFactor;
                break;
            case LEFT:
                faultFactor += (1 - (this.ops[LEFT] == OP_WORK)) * 2;
                this.posX -= SHIP_VEL_H / faultFactor;
                break;
            case RIGHT:
                faultFactor += (1 - (this.ops[RIGHT] == OP_WORK)) * 2;
                this.posX += SHIP_VEL_H / faultFactor;
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
        if (this.posX > windowWidth - SHIP_W) {
            this.posX = windowWidth - SHIP_W;
        } else if (this.posX < 0) {
            this.posX = 0;
        }
        if (this.posY > windowHeight - SHIP_H) {
            this.posY = windowHeight - SHIP_H;
        } else if (this.posY < 0) {
            this.posY = 0;
        }
    }

    repair() {
        for (let i = 0; i < this.ops.length; i++) {
            if (this.ops[i] < OP_WORK) {
                this.ops[i]++;
                game.gui.hk['Repair'].val = this.ops[i];

                if (this.ops[i] == OP_WORK) {
                    this.workingOps.push(i);
                    game.gui.consoleLine(this.getFaultMsg(i) + "  repaired!");

                    let keyId = this.getFaultKey(i);

                    game.gui.hk['Repair'].val = 0;
                    game.gui.hk['Life'].val += 100;
                    game.gui.hk[keyId].active = 1;
                }
                break;
            }
        }
    }

    fireBack() {
        if ((this.rearOn) && (frameCount % this.rearFreq === 0)) {
            for (const enemy of game.enemies) {
                if (enemy.posX < this.posX) {
                    let d = dist(enemy.posX, enemy.posY, this.posX, this.posY);
                    let velX = (enemy.posX - this.posX) * SHOT_VEL / d;
                    let velY = (enemy.posY - this.posY) * SHOT_VEL / d;

                    this.shots.addBack(this.posX, this.posY, velX, velY);
                    break;
                }
            }
        }
    }

    fire() {
        if (this.ops[FIRE] == OP_WORK) {
            this.shots.add(this.posX, this.posY);
        }
    }

    show() {
        stroke(255);
        fill(255);
        rect(this.posX, this.posY, this.width, this.height);

        this.shots.update();

        // decrement immunity
        if (this.immunity > 0) {
            this.immunity--;
        }
    }
}



class Shot extends Item {
    constructor(x, y) {
        super(x + SHIP_W, y + SHIP_H / 2, SHOT_SIZE * 3, SHOT_SIZE, SHOT_VEL, 0, 1, 0);
    }

    show() {
        textFont(ibmFont);
        textAlign(CENTER);
        textSize(30);
        text("*", this.posX, this.posY + 10);
    }
}

class RearShot extends Item {
    constructor(x, y, vx, vy) {
        super(x, y + SHIP_H / 2, SHOT_SIZE, SHOT_SIZE, vx, vy, 1, 0);
    }
}

class Shots {
    constructor () {
        this.list = [];
    }

    add(x, y) {
        this.list.push(new Shot(x, y));
    }

    addBack(x, y, vx, vy) {
        this.list.push(new RearShot(x, y, vx, vy)); 
    }

    update() {
        for (let i = 0; i < this.list.length; i++) {
            this.list[i].move();
            if (this.list[i].posX < windowWidth) {
                this.list[i].show();
            } else {
                this.list.splice(i, 1);
            }
        }
    }
}