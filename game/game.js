/**
 *  Abstarct class as interface for specific level implementation
 */
 class BaseLevel {
    construsctor() {

    }

    init() {

    }

    dispose() {

    }

    update() {

    }

    show() {

    }

    resize(xs, ys) {

    }
    
}



/** 
 * Game class implementing fundamental methods
 */
class Game {
    constructor() {
        // Create the player
        let startPos = 70 * engine.cw / DEFAULT_W; 
        this.ship = new SpaceShip(startPos, engine.ch / 2);

        // Level Set
        this.levelSet = [];

        // Add levels to the list of levels, to be used by engine
        this.levelSet.push(new Level1(this.ship));
        //this.levelSet.push(new Level2(this.ship));
        //this.levelSet.push(new Level3(this.ship));
    }

    reset() {
        // Reset the player
        this.ship.reset();
        this.ship.posX = 70 * engine.cw / DEFAULT_W; 
        this.ship.posY = engine.ch / 2;

        for(let level of this.levelSet) {
            level.dispose();
        }
    }

    resize(levelId, xScale, yScale) {
        this.levelSet[levelId].resize(xScale, yScale);
    }

    // Custom function for the splash game
    displaySplash() {
        // Diplsay the static stars
        this.levelSet[0].bg.show();

        // Display the GAME title
        fill(255);
        textFont(fontSet["TEXTF"]);
        textAlign(CENTER, CENTER);
        textSize(150 * engine.ch / DEFAULT_H);
        text("GUNS N\nSMUGGLERz", engine.cw / 2, engine.ch / 2 - engine.ch / 10);

        engine.gui.displayContinueMsg("SPACE", "start");
    }

    // Custom function for the end of game, when dead 
    displayGameOver() {
        // Start the music
        if (musicSet["DEAD"].isPlaying() === false) {
            musicSet["DEAD"].loop();
        }

        this.levelSet[0].bg.show();
        engine.gui.displayText("GAME OVER", 80, false);
        engine.gui.displayText("Score: " + engine.gui.hk['Score'].val + " - Level: " + engine.currentLevel + 1, 40, false);
        engine.gui.displayContinueMsg("s", "restart");
    }

    // Custom function to display the game back ground, used in story mode
    displayBg() {
        // Diplsay the static stars of Level 1
        this.levelSet[0].bg.show();
    }

    processInput(key) {
        if (key === KEY_SPACE) {
            this.ship.fire();
        }
    }

}




