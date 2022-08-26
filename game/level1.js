
let  MET_FREQ_LIST = [60, 50, 40, 30, 20, 30, 40, 50];
let  MET_NBR_LIST =  [ 1,  1,  1,  1,  1,  1,  1,  1];

const END_STAGE = 2;

class Level1 extends BaseLevel {
    constructor(player) {
        super();

        this.ship = player;
        this.meteors = [];
        this.enemies = [];
        this.bg = new StarsBG(engine.cw, engine.ch);

        this.meteorFreq = MET_FREQ_LIST[0];
        this.meteorNbr = MET_NBR_LIST[0];
        this.meteorIndex = 0;

        this.enemyFreq = 200;
        this.minEnemyNbr = 1;
        this.maxEnemyNbr = 3;

        this.updateFreq = 200;
        this.stageId = 0;
    }

    dispose() {
        // Clean all arrays
        this.meteors.splice(0, this.meteors.length);
        this.enemies.splice(0, this.enemies.length);
        engine.game.junks.splice(0, engine.game.junks.length);

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
        this.stageId = 0;
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
        engine.game.movePlayer();

        // Run the repair loop (if ship damaged)
        this.ship.repair();
        this.ship.fireBack(this.enemies);

        // Move all the enemies
        this.moveList(this.meteors, false);
        this.moveList(this.enemies, false);
        this.moveList(engine.game.junks, false);

        // Check all the collisions ...
        // Check shots and meteors
        engine.game.checkCollisions(this.ship.shots.list, this.meteors, false, true);

        // Check shots and enemies
        engine.game.checkCollisions(this.ship.shots.list, this.enemies, false, true);

        // Check enemies and meteors
        engine.game.checkCollisions(this.enemies, this.meteors, true, true);

        // check for ship collision
        engine.game.checkCollisions(new Array(this.ship), this.meteors, false, true);
        engine.game.checkCollisions(new Array(this.ship), this.enemies, false, false);

        // Check if the game is over
        if (this.ship.isDead()) {
            engine.phase = DEAD;
            musicSet["L1"].stop();
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
                this.enemies.push(new Follower(0, random(windowHeight), FOLLOW_SIZE, FOLLOW_VEL, this.ship));
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

                this.stageId++;
                engine.gui.consoleLine("STAGE " + (this.stageId + parseInt('1')));
                engine.addScore(100);

                if (this.stageId >= 3) { // TODO: REMOVE MAGIC
                    this.ship.rearOn = true;
                    this.ship.rearFreq = this.ship.rearFreq - 10;
                    engine.gui.consoleBox("*** !!! Rear Shoot updated !!! ***", engine.cw, engine.ch - 40, 700, 30, SCROLL_LEFT, 30);
                }

                if (this.stageId === END_STAGE) {
                    // Stage completed
                    musicSet["L1"].stop();
                    endLevel =  true;
                } else {
                    // If not the end, play the level-up sound
                    soundSet["LEVEL_UP"].play();
                }
            }

            this.meteorFreq = MET_FREQ_LIST[this.meteorIndex];
            this.meteorNbr = MET_NBR_LIST[this.meteorIndex];
        }

        return endLevel;
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
        for (let junk of engine.game.junks) {
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

        for (let it of engine.game.junks) {
            it.resize(xs, ys);
        }
    }
    
}