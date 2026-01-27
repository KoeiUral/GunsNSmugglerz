let engine;
let engineFont;




function windowResized() {
    let maxW = min(windowWidth, DEFAULT_W);
    let maxH = min(windowHeight, DEFAULT_H);
    let xScale = maxW / canvas.width;
    let yScale = maxH / canvas.height;

    resizeCanvas(maxW, maxH, false);
    engine.resize(xScale, yScale);
}

function preload() {
    engineFont = loadFont('engine/engine-font.ttf');
}

function setup() {
    let maxW = min(windowWidth, DEFAULT_W);
    let maxH = min(windowHeight, DEFAULT_H);

    // Create the P5 Canvas
    canvas = createCanvas(maxW, maxH);

    // Create the game engine, passing json conf for asset
    engine = new Engine(maxW, maxH, 'assets/game.json', 'assets/gui/gui.json', 'assets/plot/plot.json');

    // Disable browser context menu while right clicking
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    // Hide mouse pointer
    noCursor();
}

function keyPressed() {
    if (isGameLoading === false) {
        engine.processInput(keyCode, null);
    }
}

function mousePressed() {
    if (isGameLoading === false) {
        engine.processInput(null, mouseButton);
    }
}


function draw() {
    // Nominal game loop, the engine is running
    if (engine.pause === false) {
        background(0);
        engine.step();
        engine.show();
    }
}
