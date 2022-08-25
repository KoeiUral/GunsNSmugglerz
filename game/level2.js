


class Level2 extends BaseLevel {
    constructor(player) {
        super();

        this.ship = player;
        this.bg = new PerlinStarsBG(engine.cw, engine.ch);
        this.kamiz = [];  
        this.tanks = [];
        this.followers = [];
        this.enemyShots = new Shots();

        this.kamiFreq = 100;
        this.tankFreq = 100;
        this.followFreq = 100;
        this.minFollowNbr = 1;
        this.maxFollowNbr = 3;
        
        
        this.stageCount = 1;
    }

    init() {

    }

    dispose() {

    }

    update() {
        let isLevelEnd = false;

        // If music is not playing, start it
        if (musicSet["L1"].isPlaying() === false) {  // TODO: load the music for Level 2
            musicSet["L1"].loop();
        }

        // Update BG
        this.bg.update();

        // Move the ship with keyboard inputs
        engine.game.movePlayer();

        // Run the repair loop (if ship damaged)
        this.ship.repair();
        this.ship.fireBack(this.followers.concat(this.tanks, this.kamiz));

        // Move all the enemies
        this.moveList(this.kamiz, false);
        this.moveList(this.tanks, true);
        this.moveList(this.followers, true);
        this.moveList(engine.game.junks, false);

        // Move all enemy shots
        this.enemyShots.update();

        // Check all the collisions ...
        engine.game.checkCollisions(this.ship.shots.list, this.kamiz, false, true);
        engine.game.checkCollisions(this.ship.shots.list, this.tanks, false, true);
        engine.game.checkCollisions(this.ship.shots.list, this.followers, false, true);

        engine.game.checkCollisions(this.tanks, this.followers, false, true);
        engine.game.checkCollisions(this.tanks, this.kamiz, false, true);

        // check for ship collision
        engine.game.checkCollisions(new Array(this.ship), this.kamiz, false, false);
        engine.game.checkCollisions(new Array(this.ship), this.tanks, false, false);
        engine.game.checkCollisions(new Array(this.ship), this.followers, false, false);
        engine.game.checkCollisions(new Array(this.ship), this.enemyShots.list, false, false);


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
        // Add meteors according to timer
        if ((counter % this.kamiFreq) === 0) {
            //for (let i = 0; i < this.meteorNbr; i++) {
                this.kamiz.push(new Kamikaze(engine.cw, engine.ch, this.ship));
            //}
        }

        if ((counter % this.tankFreq) === 0) {
            //for (let i = 0; i < this.meteorNbr; i++) {
                this.tanks.push(new Tank(engine.cw, random(engine.ch), this.ship, this.enemyShots));
            //}
        }

        // Add Follower according to timer
        if ((counter % this.followFreq) === 0) {
            let swarmNbr = floor(random (this.minFollowNbr, this.maxFollowNbr));
            for (let i = 0; i < swarmNbr; i++) {
                this.followers.push(new FollowerNg(0, random(windowHeight), FOLLOW_SIZE, FOLLOW_VEL, this.ship, this.enemyShots));
            }
        }

        return false;
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
    }

    resize(xs, ys) {

    }
    
}
