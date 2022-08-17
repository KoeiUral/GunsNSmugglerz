let game;

let barX;
let barY;
let barH;
let barW;


function windowResized() {
    let maxW = min(windowWidth, DEFAULT_W);
    let maxH = min(windowHeight, DEFAULT_H);
    let xScale = maxW / canvas.width;
    let yScale = maxH / canvas.height;

    resizeCanvas(maxW, maxH, false);
    game.resize(xScale, yScale);
}

function setup() {
    let maxW = min(windowWidth, DEFAULT_W);
    let maxH = min(windowHeight, DEFAULT_H);
    let xScale = maxW / DEFAULT_W;
    let yScale = maxH / DEFAULT_H;

    // Initi the load bar dimension according to the window
    barX = maxW / 2 - 200 * xScale;
    barY = maxH / 2 - 25 * yScale;
    barW = 400 * xScale;
    barH = 50 * yScale;

    // Create the P5 Canvas
    canvas = createCanvas(maxW, maxH);

    // Create the game engine, passing json conf for asset
    game = new Engine(maxW, maxH, 'assets/game.json', 'assets/gui/gui.json', 'assets/plot/plot.json');
}

function keyPressed() {
    if (isGameLoading === false) {
        game.processInput(keyCode);
    }
}

function displayLoading () {
    background(0);

    noFill();
    strokeWeight(5);
    stroke(255);
    rect(barX, barY, barW, barH);

    noStroke();
    fill(200);
    rect(barX, barY, fileProgress / totalFileNbr * barW, barH);

    if ((floor(frameCount / 20)) % 2 == 0) {
        fill(255);
        textAlign(CENTER, BOTTOM);
        textSize(20);
        textStyle(BOLDITALIC);
        textFont('Courier');
        text("LOADING", game.cw / 2, game.ch / 2 + 1.5 * barH);
    }

}

function draw() {
    if (isGameLoading) {
        displayLoading();
    } else if (startUp) {
        // Reset the stroke and text style
        textStyle(NORMAL);
        strokeWeight(1);
        
        // Execute the game init once, when loading is over
        game.init();
    } else {
        // Nominal game loop, the engine is running
        if (game.pause === false) {
            background(0);
            game.step();
            game.show();
        }
    }
}
