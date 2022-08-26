
let plot;
let audioSet = [];
let imageSet = [];
let chapters = [];

let fileProgress = 0;
let totalFileNbr = 0;
let isGameLoading = true;
let startUp = true;

function notifyProgress() {
    fileProgress++;

    if (fileProgress >= totalFileNbr) {
        isGameLoading = false;
    }
}

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

        // Count number of file to load
        for (let chapter of Object.keys(plot)) {
            for (let frame of plot[chapter]['frames']) {
                for (let element of frame['screen']) {
                    if ((element['type'] === "audio") || (element['type'] === "image")) {
                        totalFileNbr++;  
                    }
                }
            }
        }

        for (let chapter of Object.keys(plot)) {
            // Save chapters in order
            chapters[plot[chapter]['id']] = chapter;

            // Iterate over all frames within the chapter
            for (let frame of plot[chapter]['frames']) {
                // Iterate over element within the screen
                for (let element of frame['screen']) {
                    // Check if it is audio, then load p5 audio in set
                    if (element['type'] === "audio") {
                        audioSet[audioId] = (loadSound(element['path'], notifyProgress));
                        element['ref'] = audioId;
                        audioId++;
                    } // Else if it is image, then load p5 image
                    else if (element['type'] === "image") {
                        imageSet[imageId] = (loadImage(element['path'], notifyProgress));
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
                engine.gui.consoleBox(element['msg'], element['x'], element['y'], element['w'], element['h'], SCROLL_UP, element['s']);
                this.frameEnd = false;
            } else if (element['type'] === "txtbox") {
                engine.gui.displayTextBox(element['msg'], element['s'], element['x'], element['y'], element['w'], element['h']);
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
        engine.gui.showScrollingBox();

        // If the scrolling is over and it is not the last frame of the game (i.e. WIN), then
        if ((engine.gui.isScrollBoxOver()) && (engine.phase !== WIN)) {
            // Move to the next frame if in auto mode
            if (plot[chapter]['frames'][this.curFrame]['auto']) {
                this.nextFrame(this.curChapter);
            } // Else wait for key input
            else {
                engine.gui.displayContinueMsg("SPACE", "continue");
                engine.phase = STORY_WAIT;
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

        // If chapter ended
        if (this.chapterEnd) { 
            // Move to the next level if we are not at the end of the game
            engine.phase = (chapter != "END") ? RUN : WIN;
        } else {
            // Continue with the story
            engine.phase = STORY_PLAY;
        }
    }

    getNextChapter() {
        this.curChapter = chapters[this.chapterId];
        this.chapterId++;

        return this.curChapter;
    }

    reset() {
        this.chapterId = 0;
        this.curChapter = "";
        this.curFrame = 0;
        this.chapterEnd = false;
        this.frameEnd = true;

        // Stop the music
        if (this.audioPlaying != -1) {
            audioSet[this.audioPlaying].stop();
            this.audioPlaying = -1;
        }
    }


}