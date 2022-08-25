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
}

function keyPressed() {
    if (isGameLoading === false) {
        engine.processInput(keyCode);
    }
}


function draw() {
    if (isGameLoading) {
        engine.displayLoading();
    } else if (startUp) {       
        // Execute the game init once, when loading is over
        engine.init();
    } else {
        // Nominal game loop, the engine is running
        if (engine.pause === false) {
            background(0);
            engine.step();
            engine.show();
        }
    }
}
