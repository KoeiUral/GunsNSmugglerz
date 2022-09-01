
const ENEMEY_STAGE = [
    {f:  0,  k:   0, t:   0, d:  50, m: ""},                                         // Stage 0 intro
    {f:  80, k:   0, t:   0, d:  600, m: "A flock of followers is cheasing you!"},    // Stage 1
    {f: 200, k: 100, t:   0, d: 1000, m: "Ballistic missles coming!"},                // Stage 2
    {f: 200, k:  80, t:   0, d:  800, m: "Enemy fire is increasing!"},                // Stage 3
    {f: 200, k:   0, t: 150, d: 1200, m: "You reach the space tank defense line!"},   // Stage 4
    {f:   0, k:   0, t:  80, d: 1000, m: "You reach the hearth of tanks division!"},  // Stage 5
    {f: 250, k: 200, t: 150, d: 1000, m: "Crazy mess is coming, please survive!"},    // Stage 6
    {f:   0, k:   0, t:   0, d: 1000, m: "Bloody Hell! you are in the middle of admiral's fleet"}   // Stage BOOSSS
];   

class Level2 extends BaseLevel {
    constructor(player) {
        super(player);

        this.bg = new PerlinStarsBG(engine.cw, engine.ch);
        this.kamiz = [];  
        this.tanks = [];
        this.followers = [];
        this.bosses = [];
        this.enemyShots = new Shots();

        this.updateFreq = 400;
        this.stageId = 0;
        this.stageFrCount = 0;

        this.kamiFreq = ENEMEY_STAGE[this.stageId].k;
        this.tankFreq = ENEMEY_STAGE[this.stageId].t;
        this.followFreq = ENEMEY_STAGE[this.stageId].f;

        this.maxKamiNbr = 1;
        this.maxTankNbr = 1;
        this.maxFollowNbr = 1;

        this.initialized = false;
        this.coolDown = false;       
    }

    init() {
        // If music is not playing, start it
        if (musicSet["L2"].isPlaying() === false) {
            musicSet["L2"].loop();
        }

        this.stageFrCount = frameCount;
        engine.gui.consoleLine(ENEMEY_STAGE[this.stageId].m);
        this.ship.rearOn = true;
        this.initialized = true;
    }

    dispose() {
        // Clean all arrays
        this.kamiz.splice(0, this.kamiz.length);
        this.tanks.splice(0, this.tanks.length);
        this.followers.splice(0, this.followers.length);
        engine.game.junks.splice(0, engine.game.junks.length);

        this.stageId = 0;
        this.stageFrCount = 0;

        this.kamiFreq = ENEMEY_STAGE[this.stageId].k;
        this.tankFreq = ENEMEY_STAGE[this.stageId].t;
        this.followFreq = ENEMEY_STAGE[this.stageId].f;
        this.bossFreq = 0;

        this.maxKamiNbr = 1;
        this.maxTankNbr = 1;
        this.maxFollowNbr = 1;
        this.initialized = false;
        this.coolDown = false;

        // Reset the ship status and gui wo changing score
        engine.game.ship.reset();
        engine.gui.reset(false);
    }

    update() {
        let isLevelEnd = false;

        // Update BG
        this.bg.update();

        // Move the ship with keyboard inputs
        engine.game.movePlayer();

        // Run the repair loop (if ship damaged)
        this.ship.repair(2);
        this.ship.fireBack(this.followers.concat(this.tanks, this.kamiz));

        // Move all the enemies
        this.moveList(this.kamiz, false);
        this.moveList(this.tanks, true);
        this.moveList(this.followers, true);
        this.moveList(this.bosses, false);
        this.moveList(engine.game.junks, false);

        // Move all enemy shots
        this.enemyShots.update();

        // Check all the collisions ...
        engine.game.checkCollisions(this.ship.shots.list, this.kamiz, false, true);
        engine.game.checkCollisions(this.ship.shots.list, this.tanks, false, true);
        engine.game.checkCollisions(this.ship.shots.list, this.followers, false, true);
        engine.game.checkCollisions(this.bosses, this.ship.shots.list, true, true);

        engine.game.checkCollisions(this.tanks, this.followers, false, true);
        engine.game.checkCollisions(this.tanks, this.kamiz, false, true);
        engine.game.checkCollisions(this.kamiz, this.followers, false, true);       

        // check for ship collision
        engine.game.checkCollisions(new Array(this.ship), this.kamiz, false, false);
        engine.game.checkCollisions(new Array(this.ship), this.tanks, false, false);
        engine.game.checkCollisions(new Array(this.ship), this.followers, false, false);
        engine.game.checkCollisions(new Array(this.ship), this.enemyShots.list, false, false);
        engine.game.checkCollisions(this.bosses, new Array(this.ship), false, false);

        // Check if the game is over
        if (this.ship.isDead()) {
            engine.phase = DEAD;
            musicSet["L2"].stop();
            musicSet["BOSS"].stop();
        } else if (this.coolDown === false) {
            // Increment level difficulty
            this.levelUpdate(frameCount);
        } else {
            isLevelEnd = ((this.kamiz.length === 0) && (this.tanks.length === 0) && (this.bosses.length === 0) && (this.followers.length === 0)) ? true : false;
        }

        return isLevelEnd;
    }

    levelUpdate(counter) {
        // Add Kamikaze according to timer
        if ((counter % this.kamiFreq) === 0) {
            let swarmNbr = floor(random (1, this.maxKamiNbr));
            for (let i = 0; i < swarmNbr; i++) {
                this.kamiz.push(new Kamikaze(engine.cw, engine.ch, this.ship));
            }
        }

        // Add tanks according to timer
        if ((counter % this.tankFreq) === 0) {
            let swarmNbr = floor(random (1, this.maxTankNbr));
            for (let i = 0; i < swarmNbr; i++) {
                this.tanks.push(new Tank(engine.cw, random(engine.ch), this.ship, this.enemyShots));
            }
        }

        // Add Followers according to timer
        if ((counter % this.followFreq) === 0) {
            let swarmNbr = floor(random (1, this.maxFollowNbr));
            for (let i = 0; i < swarmNbr; i++) {
                this.followers.push(new FollowerNg(0, random(engine.ch), FOLLOW_SIZE, FOLLOW_VEL, this.ship, this.enemyShots));
            }
        }

        // Add Boss according to timer
        if ((counter % this.bossFreq) === 0) {
            this.bosses.push(new StarCruiser(engine.cw, random(0,2) * engine.ch / 4, this.ship, this.enemyShots));
        }

        // Increase difficulty
        if ((counter % this.updateFreq) === 0) {
            // Increase number of enemies
            this.maxKamiNbr = this.increaseNumber(this.kamiFreq, this.maxKamiNbr);
            this.maxTankNbr = this.increaseNumber(this.tankFreq, this.maxTankNbr);
            this.maxFollowNbr = this.increaseNumber(this.followFreq, this.maxFollowNbr);

            // Check if stage is over
            if ((counter - this.stageFrCount) >= ENEMEY_STAGE[this.stageId].d) {
                this.stageId++;
                this.stageFrCount = counter;

                // In case the boss is coming
                if (this.stageId === ENEMEY_STAGE.length - 1) {
                    // Stop the level song and play the boss song.
                    musicSet["L2"].stop();
                    musicSet["BOSS"].loop();
                    this.bossFreq = 1100;
                } // Check if there are more stages or not
                else if (this.stageId === ENEMEY_STAGE.length) {
                    // Level completed
                    musicSet["BOSS"].stop();
                    this.bossFreq = 0;
                    this.kamiFreq = 0;
                    this.tankFreq = 0;
                    this.followFreq = 0;
                    this.coolDown = true;
                    return;  // TODO: ugly solution to skip the freq. update ...
                }

                // Set all the new frequencies (actually duty cycle)
                this.kamiFreq = ENEMEY_STAGE[this.stageId].k;
                this.tankFreq = ENEMEY_STAGE[this.stageId].t;
                this.followFreq = ENEMEY_STAGE[this.stageId].f;

                // Display the message for the new Stage
                engine.gui.consoleLine(ENEMEY_STAGE[this.stageId].m);
                engine.addScore(100);

                // Play the Alarm sound
                soundSet["ALARM"].play();
            }
        }
    }

    increaseNumber(freq, nbr) {
        if (freq !== 0) {
            nbr++;
        }
        else {
            nbr = 1;
        }
        return nbr;
    }

    show() {
        // draw the BG
        this.bg.show();

        // Draw the ship
        this.ship.show();

        // Draw the kamiz
        for (let kami of this.kamiz) {
            kami.show();
        }

        // Draw the tank
        for (let tank of this.tanks) {
            tank.show();
        }

        // Draw the follower
        for (let follower of this.followers) {
            follower.show();
        }       

        // Draw the junks
        for (let junk of engine.game.junks) {
            junk.show();
        }

        // Draw the Boss
        for (let boss of this.bosses) {
            boss.show();
        }
    }

    resize(xs, ys) {
        this.bg.resize(xs, ys);
        this.ship.resize(xs, ys);

        for (let it of this.kamiz) {
            it.resize(xs, ys);
        }

        for (let it of this.tanks) {
            it.resize(xs, ys);
        }

        for (let it of this.followers) {
            it.resize(xs, ys);
        }

        for (let it of engine.game.junks) {
            it.resize(xs, ys);
        }
    }
    
}
