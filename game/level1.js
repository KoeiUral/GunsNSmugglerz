
let  MET_FREQ_LIST = [60, 50, 40, 30, 20, 30, 40, 50];
let  MET_NBR_LIST =  [ 1,  1,  1,  1,  1,  1,  1,  1];

const END_STAGE = 10;

class Level1 extends BaseLevel {
    constructor(player) {
        super();

        this.ship = player;
        this.meteors = [];
        this.enemies = [];
        this.junks = [];
        this.bg = new StarsBG(engine.cw, engine.ch);

        this.meteorFreq = MET_FREQ_LIST[0];
        this.meteorNbr = MET_NBR_LIST[0];
        this.meteorIndex = 0;

        this.enemyFreq = 200;
        this.minEnemyNbr = 1;
        this.maxEnemyNbr = 3;

        this.updateFreq = 200;
        this.stageCount = 1;
    }

    dispose() {
        // Clean all arrays
        this.meteors.splice(0, this.meteors.length);
        this.enemies.splice(0, this.enemies.length);
        this.junks.splice(0, this.junks.length);

        // Reset meteors adding parameters
        for (let i = 0; i < MET_NBR_LIST.length; i++) {
            MET_NBR_LIST[i] = 1;
        }

        MET_FREQ_LIST[0] =  60;
        MET_FREQ_LIST[1] =  50;
        MET_FREQ_LIST[2] =  40;
        MET_FREQ_LIST[3] =  30;
        MET_FREQ_LIST[4] =  20;
        MET_FREQ_LIST[5] =  30;
        MET_FREQ_LIST[6] =  40;
        MET_FREQ_LIST[7] =  50;
        
        this.meteorFreq = MET_FREQ_LIST[0];
        this.meteorNbr = MET_NBR_LIST[0];
        this.meteorIndex = 0;

        this.enemyFreq = 200;
        this.minEnemyNbr = 1;
        this.maxEnemyNbr = 3;
        this.stageCount = 1;
    }

    update() {
        let isLevelEnd = false;

        // If music is not playing, start it
        if (musicSet["L1"].isPlaying() === false) {
            musicSet["L1"].loop();
        }

        // Update BG
        this.bg.update();

        // Move the ship with keyboard inputs
        if (keyIsDown(LEFT_ARROW)) {
            this.ship.move(LEFT);
        }
        if (keyIsDown(RIGHT_ARROW)) {
            this.ship.move(RIGHT);
        } 
        if (keyIsDown(UP_ARROW)) {
            this.ship.move(UP);
        } 
        if (keyIsDown(DOWN_ARROW)) {
            this.ship.move(DOWN);
        }

        // Run the repair loop (if ship damaged)
        this.ship.repair();
        this.ship.fireBack(this.enemies);

        // Move all the meteors
        for (let i = 0; i < this.meteors.length; i++) {
            this.meteors[i].move();

            // Remove a meteor if it is outside the screen (left side)
            if (this.meteors[i].posX < 0) {
                this.meteors.splice(i, 1);
            } 
        }

        // Move all the enemies 
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].move();

            // Remove a enemy if it is outside the screen (right side)
            if ((this.enemies[i].posX > engine.cw) || (this.enemies[i].posY > engine.ch) || (this.enemies[i].posY < 0)) {
                this.enemies.splice(i, 1);
            } 
        }

        // Move all the junks
        for (let i = 0; i < this.junks.length; i++) {
            this.junks[i].move();

            // Remove a meteor if it is outside the screen (left side)
            if ((this.junks[i].posX < 0) || (this.junks[i].posX > engine.cw) || (this.junks[i].posY > windowHeight) || (this.junks[i].posY < 0)) {
                this.junks.splice(i, 1);
            } 
        }

        // Check all the collisions ...
        // Check shots and meteors
        this.checkCollisions(this.ship.shots.list, this.meteors, false, true);

        // Check shots and enemies
        this.checkCollisions(this.ship.shots.list, this.enemies, false, true);

        // Check enemies and meteors
        this.checkCollisions(this.enemies, this.meteors, true, true);

        // check for ship collision
        this.checkCollisions(new Array(this.ship), this.meteors, false, true);
        this.checkCollisions(new Array(this.ship), this.enemies, false, false);

        // Check if the game is over
        if (this.ship.isDead()) {
            engine.phase = DEAD;
            musicSet["L1"].stop(); // TODO: change L1 key with variable of the level
        } else {
            // Increment level difficulty
            isLevelEnd = this.levelUpdate(frameCount);
        }

        return isLevelEnd;
    }

    levelUpdate(counter) {
        let endLevel = false;

        // Add meteors according to timer
        if ((counter % this.meteorFreq) === 0) {
            for (let i = 0; i < this.meteorNbr; i++) {
                this.meteors.push(new Meteor(engine.cw, random(engine.ch)));
            }
        }

        // Add Follower according to timer
        if ((counter % this.enemyFreq) === 0) {
            let swarmNbr = floor(random (this.minEnemyNbr, this.maxEnemyNbr));
            for (let i = 0; i < swarmNbr; i++) {
                this.enemies.push(new Follower(0, random(windowHeight), this.ship));
            }
        }

        // Increase difficulty
        if ((counter % this.updateFreq) === 0) {
            this.meteorIndex = (this.meteorIndex + 1) % MET_FREQ_LIST.length;

            // Next level   
            if (this.meteorIndex === 0) {
                for (let i = 0; i < MET_FREQ_LIST.length; i++) {
                    MET_FREQ_LIST[i]--;
                    MET_NBR_LIST[i]++;
                }

                if (this.enemyFreq > 50) {
                    this.enemyFreq -= 10;
                }
                this.minEnemyNbr++;
                this.maxEnemyNbr++;

                this.stageCount++;
                engine.gui.consoleLine("STAGE " + this.stageCount);
                engine.addScore(100);

                if (this.stageCount >= 3) { // TODO: REMOVE MAGIC
                    this.ship.rearOn = true;
                    this.ship.rearFreq = this.ship.rearFreq - 10;
                    engine.gui.consoleBox("*** !!! Rear Shoot updated !!! ***", engine.cw, engine.ch - 40, 700, 30, SCROLL_LEFT, 30);
                }

                if (this.stageCount === END_STAGE) {
                    // Stage completed
                    musicSet["L1"].stop();
                    endLevel =  true;
                } else {
                    // If not the end, play the level-up sound
                    soundSet["LEVEL_UP"].play();
                }

                return endLevel;
            }

            this.meteorFreq = MET_FREQ_LIST[this.meteorIndex];
            this.meteorNbr = MET_NBR_LIST[this.meteorIndex];
        }
    }

    checkCollisions(hitList, targetList, hitScore, targetScore) {
        for (let i = 0; i < hitList.length; i++) {
            let hit = false;
            for (let j = 0; j < targetList.length; j++) {
                if (hitList[i].intersects(targetList[j])) {
                    hitList[i].hit();
                    targetList[j].hit();

                    if (hitList[i].isDead()) {
                        // Add scores if hit dies
                        if (hitScore) {
                            engine.addScore(hitList[i].score);
                            // Create junks
                            let pieces = floor(random(2, 5));
                            for (let k = 0; k < pieces; k++) {
                                this.junks.push(new Junk(hitList[i].posX, hitList[i].posY, hitList[i].w / pieces));
                            }
                        }

                        hitList.splice(i, 1);
                        hit = true;
                    }

                    if (targetList[j].isDead()) {
                        if (targetScore) {
                            engine.addScore(targetList[j].score);
                            let pieces = floor(random(2, 5));
                            for (let k = 0; k < pieces; k++) {
                                this.junks.push(new Junk(targetList[j].posX, targetList[j].posY, targetList[j].w / pieces));
                            }
                        }
                        targetList.splice(j, 1);
                    }

                    break;
                }
            }

            // Jump to the next hit list item
            if (hit === true) {
                continue;
            }
        }
    }


    show() {       
        // draw the BG
        this.bg.show();

        // Draw the ship
        this.ship.show();

        // Draw the meteors
        for (let meteor of this.meteors) {
            meteor.show();
        } 

        // Draw the enemies
        for (let enemy of this.enemies) {
            enemy.show();
        }

        // Draw the junks
        for (let junk of this.junks) {
            junk.show();
        }
    }

    resize(xs, ys) {
        this.bg.resize(xs, ys);
        this.ship.resize(xs, ys);

        for (let it of this.meteors) {
            it.resize(xs, ys);
        }

        for (let it of this.enemies) {
            it.resize(xs, ys);
        }

        for (let it of this.junks) {
            it.resize(xs, ys);
        }
    }
    
}