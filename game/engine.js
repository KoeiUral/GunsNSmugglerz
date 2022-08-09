
let  MET_FREQ_LIST = [60, 50, 40, 30, 20, 30, 40, 50];
let  MET_NBR_LIST =  [ 1,  1,  1,  1,  1,  1,  1,  1];

// Game phases
const SPLASH = 0;
const STORY = 1;
const RUN = 2;
const DEAD = 3;
const WIN = 4;
const END_LEVEL = 10;

class Engine {
    constructor(w, h) {
        // Game entities
        this.ship = new SpaceShip(20, windowHeight / 2);
        this.meteors = [];
        this.enemies = [];
        this.junks = [];
        this.bg = new StarsBG();
        this.gui = new Gui(w, h);

        this.phase = SPLASH;
        this.meteorFreq = MET_FREQ_LIST[0];
        this.meteorNbr = MET_NBR_LIST[0];
        this.meteorIndex = 0;

        this.enemyFreq = 200;
        this.minEnemyNbr = 1;
        this.maxEnemyNbr = 3;

        this.updateFreq = 200;
        this.levelCount = 1;
        this.cw = w;
        this.ch = h;
        this.pause = false;

        // Sound effects
        //....
    }

    step() {
        if (this.phase === RUN) {
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
            this.ship.fireBack();

            // Move all the meteors
            for (let i = 0; i < this.meteors.length; i++) {
                this.meteors[i].move();

                // Remove a metor if it is outside the screen (left side)
                if (this.meteors[i].posX < 0) {
                    this.meteors.splice(i, 1);
                } 
            }

            // Move all the enemies 
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].move();

                // Remove a enemy if it is outside the screen (right side)
                if ((this.enemies[i].posX > windowWidth) || (this.enemies[i].posY > windowHeight) || (this.enemies[i].posY < 0)) {
                    this.enemies.splice(i, 1);
                } 
            }

            // Move all the junks
            for (let i = 0; i < this.junks.length; i++) {
                this.junks[i].move();

                // Remove a metor if it is outside the screen (left side)
                if ((this.junks[i].posX < 0) || (this.junks[i].posX > windowWidth) || (this.junks[i].posY > windowHeight) || (this.junks[i].posY < 0)) {
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
                this.phase = DEAD;
                gunsLevel1.stop();
                gunsEnd.loop();
            }

            // Increment level difficulty
            this.levelUpdate(frameCount);
        }
    }

    levelUpdate(counter) {
        // Add meteors according to timer
        if ((counter % this.meteorFreq) === 0) {
            for (let i = 0; i < this.meteorNbr; i++) {
                this.meteors.push(new Enemy(windowWidth, random(windowHeight)));
            }
        }

        // Add meteors according to timer
        if ((counter % this.enemyFreq) === 0) {
            let swarmNbr = floor(random (this.minEnemyNbr, this.maxEnemyNbr));
            for (let i = 0; i < swarmNbr; i++) {
                this.enemies.push(new Follower(0, random(windowHeight)));
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

                this.levelCount++;
                this.gui.consoleLine("LEVEL " + this.levelCount);
                
                levelUpSound.play();
                this.addScore(100);

                if (this.levelCount >= 3) { 
                    this.ship.rearOn = true;
                    this.ship.rearFreq = this.ship.rearFreq - 10;
                    //this.gui.consoleLine("Rear shoot updated");
                }

                if (this.levelCount === END_LEVEL) {
                    // Game completed
                    this.phase = WIN;
                    gunsLevel1.stop();
                    gunsEnd.loop();
                }
            }

            this.meteorFreq = MET_FREQ_LIST[this.meteorIndex];
            this.meteorNbr = MET_NBR_LIST[this.meteorIndex];
        }
    }

    addScore(points) {
        this.gui.hk['Score'].val += points;
    }

    show() {
        this.bg.show();

        if (this.phase === SPLASH) {
            this.displayIntro();
        }
        else if (this.phase === STORY) {
            //image(introImg, 10, this.ch / 2 - introImg.height, 2 * introImg.width, 2 * introImg.height);
            this.gui.displayTextBox();

            if (this.gui.isBoxDisplayOver()) {
                this.phase = RUN;
                gunsLevel1.loop();
            }
        } else if (this.phase === RUN) {
            // Draw the ship
            this.ship.show();

            // Draw the meteors
            for (let i = 0; i < this.meteors.length; i++) {
                this.meteors[i].show();
            } 

            // Draw the enemies
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].show();
            }

            // Draw the junks
            for (let i = 0; i < this.junks.length; i++) {
                this.junks[i].show();
            }

            // Draw the gui
            this.gui.show();
        } else if (this.phase === DEAD) {
            this.gui.displayText("GAME OVER", 80, false);
            this.gui.displayText("Score: " + this.gui.hk['Score'].val + " - Level: " + this.levelCount, 40, false);
            this.gui.displayText("Press s to restart or refresh the page", 20, true);
        } else if (this.phase === WIN) {
            this.gui.displayText("STAGE COMPLETE", 80, false);
            this.gui.displayText("You left the bloody pigs behind, good job boy!", 40, false);
            this.gui.displayText("... next stage coming soon ...", 30, false); 
            this.gui.displayText("Press s to restart or refresh the page", 20, true);
        }

        // Reset the frame line offset in the gui
        this.gui.frameLnOffset = 0;
    }

    resize(w, h) {
        this.cw = w;
        this.ch = h;
        this.gui.resize(w, h);
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
                            this.addScore(hitList[i].score);
                            // create junks
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
                            this.addScore(targetList[j].score);
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


    displayIntro() {
        fill(255);
        textFont(ibmFont);
        textAlign(CENTER);
        textSize(200);
        text("GUNS N\nSMUGGLERz", windowWidth / 2, windowHeight / 2 - 150);

        if ((floor(frameCount / 40)) % 2 == 0) {
            textSize(20);
            text("- Press SPACE to start -", windowWidth / 2, windowHeight / 2 + 250);
        }
    }

    reset() {
        // Clean all arrays
        this.meteors.splice(0, this.meteors.length);
        this.enemies.splice(0, this.enemies.length);
        this.junks.splice(0, this.junks.length);
        
        // Reset gui and HK
        this.gui.reset();

        // Move the ship at the beginning
        this.ship.reset();
        this.ship.posX = 20;
        this.ship.posY = windowHeight / 2;

        // Reset meteors adding parameters
        for (let i = 0; i < MET_NBR_LIST.length; i++) {
            MET_NBR_LIST[i] = 1;
        }

        MET_FREQ_LIST[0] =  60; //[60, 50, 40, 30, 20, 30, 40, 50];
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

        this.levelCount = 1;
        this.phase = SPLASH;

        // Stop the music
        gunsEnd.stop();
    }

}