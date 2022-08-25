


class Level2 extends BaseLevel {
    constructor(player) {
        super();

        this.ship = player;
        this.bg = new PerlinStarsBG(engine.cw, engine.ch);
        
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

        // ...

        // Check if the game is over
        if (this.ship.isDead()) {
            engine.phase = DEAD;
            musicSet["L1"].stop(); // TODO: change L1 key with variable of the level
        } else {
            // Increment level difficulty
            //isLevelEnd = this.levelUpdate(frameCount);
        }

        return isLevelEnd;
    }

    show() {
        // draw the BG
        this.bg.show();

        // Draw the ship
        this.ship.show();
    }

    resize(xs, ys) {

    }
    
}
