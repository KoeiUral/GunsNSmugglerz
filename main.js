
let game;
let ibmFont;
let arrFont;
let gunsLevel1;
let gunsEnd;
let levelUpSound;
let hitSound;

function windowResized() {
    let maxW = min(windowWidth, DEFAULT_W);
    let maxH = min(windowHeight, DEFAULT_H);
    let xScale = maxW / canvas.width;
    let yScale = maxH / canvas.height;

    resizeCanvas(maxW, maxH, false);
    game.resize(xScale, yScale);
}


function preload() {
    ibmFont = loadFont('assets/font/INVASION2000.TTF');
    arrFont = loadFont('assets/font/PixArrows.ttf');

    gunsLevel1 = loadSound('assets/audio/guns1_s.mp3');
    gunsEnd = loadSound('assets/audio/guns_end_s.mp3');
    levelUpSound = loadSound('assets/audio/round_end.wav');
    hitSound = loadSound('assets/audio/death.wav');

    // Create the game engine prealoading the gui.json file
    game = new Engine(DEFAULT_W, DEFAULT_H, 'assets/gui/gui.json', 'assets/plot/plot.json');
}

function setup() {
    let maxW = min(windowWidth, DEFAULT_W);
    let maxH = min(windowHeight, DEFAULT_H);
    let xScale = maxW / DEFAULT_W;
    let yScale = maxH / DEFAULT_H;

    // Create the P5 Canvas
    canvas = createCanvas(maxW, maxH);
    game.gui.initFonts(ibmFont, arrFont);

    // Resize the game wrt default sizes
    game.resize(xScale, yScale);
}

function keyPressed() {
    game.processInput(keyCode)
}


function draw() {
    if (game.pause === false) {
        background(0);
        game.step();
        game.show();
    }
}
