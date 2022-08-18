
let  MET_FREQ_LIST = [60, 50, 40, 30, 20, 30, 40, 50];
let  MET_NBR_LIST =  [ 1,  1,  1,  1,  1,  1,  1,  1];

// Game phases
const LOAD = 0;
const SPLASH = 1;
const STORY_PLAY = 2;
const STORY_WAIT = 3;
const RUN = 4;
const PAUSE = 5;
const DEAD = 6;

const KEY_SPACE = 32;
const KEY_M = 78;
const KEY_P = 80;
const KEY_S = 83;

const END_LEVEL = 10;

const fontSet = {};
const soundSet = {};
const musicSet = {};

class Engine {
    constructor(w, h, gameFile, guiFile, plotFile) {
        // Read audio and song info
        loadJSON(gameFile, this.onJsonLoaded);

        // Hold canvas size
        this.cw = w;
        this.ch = h;

        // Game entities
        this.ship = new SpaceShip(20, this.ch / 2);
        this.meteors = [];
        this.enemies = [];
        this.junks = [];
        this.bg = new StarsBG(this.cw, this.ch);
        this.gui = new Gui(this.cw, this.ch, guiFile);
        this.story = new StoryTeller(plotFile);
        this.storyChapter = "";

        this.phase = SPLASH;
        this.meteorFreq = MET_FREQ_LIST[0];
        this.meteorNbr = MET_NBR_LIST[0];
        this.meteorIndex = 0;

        this.enemyFreq = 200;
        this.minEnemyNbr = 1;
        this.maxEnemyNbr = 3;

        this.updateFreq = 200;
        this.levelCount = 1;
        this.pause = false;

        // Sound effects
        //....
    }

    onJsonLoaded(data) {
        // Count number of file to loads
        totalFileNbr += Object.keys(data['Fonts']).length + Object.keys(data['Sounds']).length + Object.keys(data['Music']).length;

        // Load the Fonts
        for (let font of Object.keys(data['Fonts'])) {
            fontSet[font] = loadFont(data['Fonts'][font], notifyProgress);
        }

        // Load the sounds
        for (let sound of Object.keys(data['Sounds'])) {
            soundSet[sound] = loadSound(data['Sounds'][sound], notifyProgress);
        }

        // Load the music
        for (let music of Object.keys(data['Music'])) {
            musicSet[music] = loadSound(data['Music'][music], notifyProgress);
        }
    }

    init() {
        // Sound notification 
        soundSet["LEVEL_UP"].play();
        this.gui.initFonts();
        startUp = false;
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

                // Remove a meteor if it is outside the screen (left side)
                if (this.meteors[i].posX < 0) {
                    this.meteors.splice(i, 1);
                } 
            }

            // Move all the enemies 
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].move();

                // Remove a enemy if it is outside the screen (right side)
                if ((this.enemies[i].posX > this.cw) || (this.enemies[i].posY > this.ch) || (this.enemies[i].posY < 0)) {
                    this.enemies.splice(i, 1);
                } 
            }

            // Move all the junks
            for (let i = 0; i < this.junks.length; i++) {
                this.junks[i].move();

                // Remove a meteor if it is outside the screen (left side)
                if ((this.junks[i].posX < 0) || (this.junks[i].posX > this.cw) || (this.junks[i].posY > windowHeight) || (this.junks[i].posY < 0)) {
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

                musicSet["L1"].stop(); // TODO: change L1 key with variable of the level
                musicSet["DEAD"].loop();
            }

            // Increment level difficulty
            this.levelUpdate(frameCount);
        }
    }

    levelUpdate(counter) {
        // Add meteors according to timer
        if ((counter % this.meteorFreq) === 0) {
            for (let i = 0; i < this.meteorNbr; i++) {
                this.meteors.push(new Meteor(this.cw, random(this.ch)));
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
                

                this.addScore(100);

                if (this.levelCount >= 3) { 
                    this.ship.rearOn = true;
                    this.ship.rearFreq = this.ship.rearFreq - 10;
                    this.gui.consoleBox("*** !!! Rear Shoot updated !!! ***", this.cw, this.ch - 40, 700, 30, SCROLL_LEFT, 30);
                }

                if (this.levelCount === END_LEVEL) {
                    // Stage completed
                    musicSet["L1"].stop();

                    // Get next Chapter
                    this.storyChapter = this.story.getNextChapter();
                    this.phase = STORY_PLAY;
                } else {
                    // If not the end, play the level-up sound
                    soundSet["LEVEL_UP"].play();
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
        else if ((this.phase === STORY_PLAY) || (this.phase == STORY_WAIT)) {
            this.story.playCh(this.storyChapter);

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

            // Draw the GUI
            this.gui.show();
            this.gui.showScrollingBox();

        } else if (this.phase === DEAD) {
            this.gui.displayText("GAME OVER", 80, false);
            this.gui.displayText("Score: " + this.gui.hk['Score'].val + " - Level: " + this.levelCount, 40, false);
            this.gui.displayContinueMsg("s", "restart");

        }

        // Reset the frame line offset in the GUI
        this.gui.frameLnOffset = 0;
    }

    processInput(key) {
        if (key === KEY_SPACE) {
            if (this.phase === SPLASH) {
                // Show the story's beginning
                this.storyChapter = this.story.getNextChapter();
                game.phase = STORY_PLAY;
            } else if (this.phase === STORY_PLAY) {
                // Just scroll up the text 
                this.gui.scrollUp();
            } else if ((this.phase === STORY_WAIT) && (this.storyChapter != "END")) {
                // Check if it is the last frame and move to run
                let lastFrame = this.story.nextFrame(this.storyChapter);
    
                if (lastFrame) {
                    musicSet["L1"].loop();
                    this.phase = RUN;
                } else {
                    this.phase = STORY_PLAY;
                }
            } else if (this.phase === RUN) {
                // If running, fire
                game.ship.fire();
            }
        } else if ((key === KEY_S) && ((this.phase === DEAD) || (this.storyChapter === "END"))) {
            // If game ended, press s to reset
            this.reset();
        } else if (key === KEY_P) {
            // Enable / disable pause
            this.pause = (this.pause) ? false : true;
        }
    }

    resize(xs, ys) {
        this.cw = this.cw * xs;
        this.ch = this.ch * ys;

        this.gui.resize(xs, ys);
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
        textFont(fontSet["TEXTF"]);
        textAlign(CENTER, CENTER);
        textSize(150 * this.ch / DEFAULT_H);
        text("GUNS N\nSMUGGLERz", this.cw / 2, this.ch / 2 - this.ch / 10);

        this.gui.displayContinueMsg("SPACE", "start");
    }

    reset() {
        // Clean all arrays
        this.meteors.splice(0, this.meteors.length);
        this.enemies.splice(0, this.enemies.length);
        this.junks.splice(0, this.junks.length);
        
        // Reset GUI and HK
        this.gui.reset();
        this.story.reset();

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

        // Stop the music
        for (let song of Object.keys(musicSet)) {
            musicSet[song].stop();
        }

        this.levelCount = 1;
        this.phase = SPLASH;
    }

}