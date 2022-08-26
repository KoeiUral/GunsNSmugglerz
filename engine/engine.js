

const VERSION = 0.1;

// ENGINE phases
const LOAD = 0;
const SPLASH = 1;
const STORY_PLAY = 2;
const STORY_WAIT = 3;
const RUN = 4;
const PAUSE = 5;
const DEAD = 6;
const WIN = 7;

const KEY_SPACE = 32;
const KEY_M = 78;
const KEY_P = 80;
const KEY_S = 83;

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
        this.barX = w / 2 - 200 * w / DEFAULT_W;
        this.barY = h / 2 - 25 * h / DEFAULT_H;
        this.barW = 400 * w / DEFAULT_W;
        this.barH = 50 * h / DEFAULT_H;

        // Engine entities
        this.gui = new Gui(this.cw, this.ch, guiFile);
        this.game = {}; //new Game();
        this.story = new StoryTeller(plotFile);
        this.storyChapter = "";

        this.phase = SPLASH;
        this.currentLevel = 0;
        this.pause = false;
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
        // Reset the stroke and text style
        textStyle(NORMAL);
        strokeWeight(1);

        // Sound notification 
        soundSet["LEVEL_UP"].play();  // TODO: it depands from the conf...
        this.gui.initFonts();
        this.game = new Game();

        startUp = false;
    }

    step() {
        if (this.phase === RUN) {
            // Execute level step, return true if level is finished
             if (this.game.levelSet[this.currentLevel].update()) {
                // Dispose the level
                this.game.levelSet[this.currentLevel].dispose();
                this.currentLevel++;

                // Get next Chapter
                this.storyChapter = this.story.getNextChapter();
                this.phase = STORY_PLAY;
            }
        }
    }

    addScore(points) {
        this.gui.hk['Score'].val += points;
    }

    show() {
        if (this.phase === SPLASH) {
            this.game.displaySplash();
        }
        else if ((this.phase === STORY_PLAY) || (this.phase == STORY_WAIT)) {
            this.game.displayBg();
            this.story.playCh(this.storyChapter);
        } 
        else if (this.phase === RUN) {
            // Draw the current level runnig
            this.game.levelSet[this.currentLevel].show();

            // Draw the GUI
            this.gui.show();
        }
        else if (this.phase === DEAD) {
            this.game.displayGameOver();
        }
        else if (this.phase === WIN) {
            this.game.displayBg();
            this.story.playCh(this.storyChapter);
            this.gui.displayContinueMsg("s", "restart");
        }
    }

    processInput(key) {
        if (key === KEY_SPACE) {
            if (this.phase === SPLASH) {
                // Show the story's beginning
                this.storyChapter = this.story.getNextChapter();
                this.phase = STORY_PLAY;
            } 
            else if (this.phase === STORY_PLAY) {
                // Just scroll up the text 
                this.gui.scroll();
            } 
            else if (this.phase === STORY_WAIT) {
                // Check if it is the last frame and move to run
                this.story.nextFrame(this.storyChapter);
            }
        } 
        else if ((key === KEY_S) && (this.phase >= DEAD)) {
            // If game ended, press s to reset
            this.reset();
        } 
        else if (key === KEY_P) {
            // Enable / disable pause
            this.pause = (this.pause) ? false : true;
        }

        // If game is running, forward the key to the game custom behaviour 
        if (this.phase === RUN) {
            this.game.processInput(key);
        }
    }


    displayLoading () {
        background(0);

        fill(255);
        textAlign(CENTER, BOTTOM);
        textSize(20);
        textStyle(NORMAL);
        textFont(engineFont);
        text("PROUDLY MADE WITH MuccaEngine v-" + VERSION, this.cw / 2, this.ch / 2 - this.barH);
    
        noFill();
        strokeWeight(5);
        stroke(255);
        rect(this.barX, this.barY, this.barW, this.barH);
    
        noStroke();
        fill(200);
        rect(this.barX, this.barY, fileProgress / totalFileNbr * this.barW, this.barH);
    
        if ((floor(frameCount / 20)) % 2 == 0) {
            textStyle(BOLDITALIC);
            text("LOADING", this.cw / 2, this.ch / 2 + 1.5 * this.barH);
        }
    }


    resize(xs, ys) {
        this.cw = this.cw * xs;
        this.ch = this.ch * ys;

        this.gui.resize(xs, ys);

        // Before init, the game is not yet instantiated
        if (this.game != undefined) {
            this.game.resize(this.currentLevel, xs, ys);
        }
    }


    reset() {      
        // Reset GUI and HK
        this.gui.reset(true);
        this.story.reset();
        this.game.reset();

        // Stop the music
        for (let song of Object.keys(musicSet)) {
            musicSet[song].stop();
        }

        this.currentLevel = 0;
        this.phase = SPLASH;
    }

}