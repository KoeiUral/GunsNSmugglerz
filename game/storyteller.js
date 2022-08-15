
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
        this.audioPlaying = -1; // no audio is playing

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
            if ((element['type'] === "txtscroll") && (this.frameEnd)) {
                // Start a scrolling text box
                game.gui.consoleBox(element['msg'], element['x'], element['y'], element['w'], element['h'], SCROLL_UP, element['s']); // TODO: REMOVE MAGIC
                this.frameEnd = false;
            } else if (element['type'] === "txtbox") {
                game.gui.displayTextBox(element['msg'], element['s'], element['x'], element['y'], element['w'], element['h']);
            } else if (element['type'] === "image") {
                // Display the image
                image(imageSet[element['ref']], element['x'], element['y'], element['w'], element['h']);
            } else if ((element['type'] === "audio") && (this.audioPlaying === -1)) {
                this.audioPlaying = element['ref'];
                if (element['loop'] === true) {
                    audioSet[element['ref']].loop();
                } else {
                    audioSet[element['ref']].play();
                }
            }
        }

        // Show the text box scrolling
        game.gui.showScrollingBox();

        if (game.gui.isScrollBoxOver()) {
            if (plot[chapter]['frames'][this.curFrame]['auto']) {
                let chapterIsOver = this.nextFrame(this.curChapter);
    
                if (chapterIsOver) {
                    game.phase = RUN;
                    gunsLevel1.loop();
                } else {
                    game.phase = STORY_PLAY;
                }
            } else {
                game.gui.displayContinueMsg("SPACE", "continue");
                game.phase = STORY_WAIT;
            }
        }
    }

    nextFrame(chapter) {
        this.frameEnd = true;
        // Stop audio if it is playing 
        if (this.audioPlaying > -1) {
            audioSet[this.audioPlaying].stop();
            this.audioPlaying = -1;
        }

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
        this.curChapter = chapters[this.chapterId];
        this.chapterId++;

        return this.curChapter;
    }



}