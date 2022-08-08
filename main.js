
let game;
let ibmFont;
let arrFont;
let gunsLevel1;
let gunsEnd;
let levelUpSound;
let hitSound;

let introMessage = "The galaxy is ruled by the evil government, you are smuggling goods all over the planets. Unfortunately, you have been found and the Gov. is chasing you. Hide yourself behind the meteors to escape the Gov's ships and survive. Good LUCK and ... enjoy the Guns!";

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    game.resize(canvas.width, canvas.height);
}


function preload() {
    ibmFont = loadFont('assets/font/INVASION2000.TTF');
    arrFont = loadFont('assets/font/PixArrows.ttf');

    gunsLevel1 = loadSound('assets/audio/guns1_s.mp3');
    gunsEnd = loadSound('assets/audio/guns_end_s.mp3');
    levelUpSound = loadSound('assets/audio/round_end.wav');
    hitSound = loadSound('assets/audio/death.wav');
}

function setup() {
    // let minSize = min(windowWidth, windowHeight);
    canvas = createCanvas(windowWidth, windowHeight);

    // Create the game engine
    game = new Engine(canvas.width, canvas.height);
    game.gui.initFonts(ibmFont, arrFont);
}

function keyPressed() {
    if ((keyCode === 32) && (game.phase == RUN)) { //SPACEBAR
        game.ship.fire();
    } else if ((keyCode === 32) && (game.phase == SPLASH)) { //SPACEBAR
        game.phase = STORY; // STORY
        game.gui.consoleBox(introMessage, 200, game.ch, game.cw - 400, 600);
    } else if ((keyCode === 32) && (game.phase == STORY)) { //SPACEBAR
        game.gui.scrollUp();
    } else if (keyCode === 80) {
        game.pause = (game.pause) ? false : true;
    }
}


function draw() {
    if (game.pause === false) {
        background(0);
        game.step();
        game.show();
    }
}
