let game;

function windowResized() {
    let maxW = min(windowWidth, DEFAULT_W);
    let maxH = min(windowHeight, DEFAULT_H);
    let xScale = maxW / canvas.width;
    let yScale = maxH / canvas.height;

    resizeCanvas(maxW, maxH, false);
    game.resize(xScale, yScale);
}


function preload() {
    // Create the game engine prealoading the asset files
    game = new Engine(DEFAULT_W, DEFAULT_H, 'assets/game.json', 'assets/gui/gui.json', 'assets/plot/plot.json');
}

function setup() {
    let maxW = min(windowWidth, DEFAULT_W);
    let maxH = min(windowHeight, DEFAULT_H);
    let xScale = maxW / DEFAULT_W;
    let yScale = maxH / DEFAULT_H;

    // Create the P5 Canvas
    canvas = createCanvas(maxW, maxH);
    game.gui.initFonts();

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
