/**
 *  Abstarct class as interface for specific level implementation
 */
 class BaseLevel {
    construsctor() {

    }

/* // TEMPLATE CLASS METHODS:
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
*/
    moveList(list, fireFlag) {
        // Move and in case fire all the items
        for (let i = 0; i < list.length; i++) {
            list[i].move();
            if (fireFlag) {
                list[i].fire();
            }

            // Remove an item if it is outside the screen
            if ((list[i].posX < 0) || (list[i].posX > engine.cw)|| (list[i].posY < 0)  || (list[i].posY > engine.ch) ) {
                list.splice(i, 1);
            } 
        }
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
        this.junks = [];

        // Level Set
        this.levelSet = [];

        // Add levels to the list of levels, to be used by engine
        this.levelSet.push(new Level1(this.ship));
        this.levelSet.push(new Level2(this.ship));
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
        let reachLevel = " " + (engine.currentLevel + parseInt('1')) + "-" + (this.levelSet[engine.currentLevel].stageId + parseInt('1'));
        // Start the music
        if (musicSet["DEAD"].isPlaying() === false) {
            musicSet["DEAD"].loop();
        }

        this.levelSet[0].bg.show();
        engine.gui.displayTextBox("GAME OVER", 80, 0, engine.ch / 2 - 40, engine.cw, engine.ch / 2);
        engine.gui.displayTextBox("Score: " + engine.gui.hk['Score'].val + " - Level: " + reachLevel, 40, 0, engine.ch / 2 + 80, engine.cw, engine.ch / 2);
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

    movePlayer() {
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
}




