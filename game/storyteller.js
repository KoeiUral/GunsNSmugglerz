
let plot;
let audioSet = [];
let imageSet = [];
let chapters = [];

class StoryTeller {
    constructor(filePath) {
        this.chapterId = 0;
        this.curChapter = "";
        this.curFrame = 0;
        this.chapterEnd = false;
        this.frameEnd = true;

        loadJSON(filePath, this.onJsonReady);
    }

    onJsonReady(data) {
        let audioId = 0;
        let imageId = 0;

        // Copy the data into variable
        plot = JSON.parse(JSON.stringify(data));

        for (let chapter of Object.keys(plot)) {
            console.log(chapter);
            // Save chapters in order
            chapters[plot[chapter]['id']] = chapter;

            // Iterate over all frames within the chapeter
            for (let frame of plot[chapter]['frames']) {
                // Iterate over element within the screen
                for (let element of frame['screen']) {
                    // Check if it is audio, then load p5 audio in set
                    if (element['type'] === "audio") {
                        audioSet[audioId] = (loadSound(element['path']));
                        element['ref'] = audioId;
                        audioId++;
                    } // Else if it is image, then load p5 image
                    else if (element['type'] === "image") {
                        imageSet[imageId] = (loadImage(element['path']));
                        element['ref'] = imageId;
                        imageId++;
                    }
                }
            }
        }
    }

    playCh(chapter) {

        let screen = plot[chapter]['frames'][this.curFrame]['screen'];

        for (let element of screen) {
            if ((element['type'] === "textbox") && (this.frameEnd)) {
                // Start a scrolling text box
                game.gui.consoleBox(element['msg'], element['x'], element['y'], element['w'], element['h'], SCROLL_UP, 20); // TODO: REMOVE MAGIC
                this.frameEnd = false;
            } else if (element['type'] === "image") {
                // Display the image
                image(imageSet[element['ref']], element['x'], element['y'], element['w'], element['h']);
            } else if ((element['type'] === "audio") && (audioSet[element['ref']].isPlaying() === false)) {
                if (element['loop'] === true) {
                    audioSet[element['ref']].loop();
                } else {
                    audioSet[element['ref']].play();
                }
            }
        }

        game.gui.displayTextBox();

        if (game.gui.isBoxDisplayOver()) {
            if ((floor(frameCount / 40)) % 2 == 0) {
                fill(255);
                textFont(ibmFont);
                textAlign(CENTER, CENTER);
                textSize(20  * game.ch / DEFAULT_H);
                text("- Press SPACE to continue -", game.cw / 2, game.ch / 2 - 100); // TODO: move this i a gui custom function
            }
            game.phase = STORY_WAIT;
        }
    }

    nextFrame(chapter) {
        this.frameEnd = true;

        if (plot[chapter]['frames'][this.curFrame + 1] != undefined) {
            this.curFrame += 1;
            this.chapterEnd = false;
        } else {
            this.curFrame = 0;
            this.chapterEnd = true;
        }

        return this.chapterEnd;
    }

    getNextChapter() {
        let nextCh = chapters[this.chapterId];
        this.chapterId++;

        return nextCh;
    }



}