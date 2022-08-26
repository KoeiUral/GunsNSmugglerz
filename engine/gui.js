const DEFAULT_W = 1024;
const DEFAULT_H = 768;
const DEFAULT_FONT = 20;

const SCROLL_LEFT = 0;
const SCROLL_UP = 1;
const SCROLL_VEL = -2;

class ScrollingMsg {
    constructor (x, y, w, h, s, t, msg, font) {
        this.boxX = x;
        this.boxY = y;
        this.boxW = w;
        this.boxH = h;
        this.font = font
        this.size = s * engine.ch / DEFAULT_H;
        this.boxScroll = t;
        this.boxVel = SCROLL_VEL;
        this.boxMessage = msg;
    }

    show(xOffset) {
        textWrap(WORD);
        fill(255);
        textFont(this.font);
        textSize(this.size);
        textAlign(CENTER, BASELINE);

        text(this.boxMessage, xOffset, this.boxY, this.boxW, this.boxH);
        xOffset = textWidth(this.boxMessage);

        if (this.boxScroll === SCROLL_UP) {
            this.boxY += this.boxVel;
            if ((this.boxY + this.boxH) < 0) {
                xOffset = -1;
            }
        } else if (this.boxScroll === SCROLL_LEFT) {
            this.boxX += this.boxVel;
            if ((this.boxX + this.boxW) < 0) {
                xOffset = -1;
            }
        }

        return xOffset;
    }

    scroll () {
        this.boxX = (this.boxScroll === SCROLL_LEFT) ? this.boxX - 100 * engine.ch / DEFAULT_H : this.boxX;
        this.boxY = (this.boxScroll === SCROLL_UP) ? this.boxY - 100 * engine.ch / DEFAULT_H : this.boxY;
    }
}



class Gui {
    constructor(width, height, file) {
        this.hk = loadJSON(file);
        this.fontSize = DEFAULT_FONT;
        this.cw = width;
        this.ch = height;
        this.scrollBoxes = [];

        // Display text varibales
        this.msgCounter = 0;
        this.msgConsole = "";
        this.frameLnOffset = 0;

        this.defValues = {};
    }

    initFonts() {
        this.font = fontSet["TEXTF"];
        this.iconFont = fontSet["ICONF"];

        // Store HK default values
        for (const key of Object.keys(this.hk)) {
            this.defValues[key] = this.hk[key].val;
        }
    }

    reset(scoreReset) {
        this.msgConsole = "";
        this.msgCounter = 0;
        //this.scrollBoxes.splice(0, this.scrollBoxes.length);
        this.scrollBoxes.length = 0;
        
        for (const key of Object.keys(this.hk)) {
            // Skip the score reset
            if ((scoreReset === false) && (key === 'Score')) {
                continue;
            }

            this.hk[key].val = this.defValues[key];

            if (this.hk[key].type == 'icon') {
                this.hk[key].active = 1;
            }
        }
    }

    resize (xScale, yScale) {
        this.cw = this.cw * xScale;
        this.ch = this.ch * yScale;

        for (const key of Object.keys(this.hk)) {
            this.hk[key].x = floor(this.hk[key].x * xScale);
            this.hk[key].y = floor(this.hk[key].y * yScale);
            this.fontSize = floor(DEFAULT_FONT * this.ch / DEFAULT_H);

            if (this.hk[key].type === 'prog') {
                this.hk[key].w = floor(this.hk[key].w * xScale);
            }
        } 
    }

    show() { 
        fill(255);
        textAlign(LEFT, TOP);
        textSize(this.fontSize);
        let yOffset = textAscent() * 0.4; // -> 0.8 / 2

        for (const key of Object.keys(this.hk)) {
            if (this.hk[key].type === 'icon') {
                textFont(this.iconFont);
                textSize(this.fontSize);
                if ((this.hk[key].active === 1) || ((floor(frameCount / 10)) % 2 == 0)) {
                    text(this.hk[key].val, this.hk[key].x, this.hk[key].y - yOffset);
                }

                continue;
            }

            textFont(this.font);
            // Add the label
            text(key + ": ", this.hk[key].x, this.hk[key].y - yOffset);
            let xOffset = textWidth(key + ": ");

            if (this.hk[key].type === 'flat') {
                text(this.hk[key].val, this.hk[key].x + xOffset, this.hk[key].y - yOffset);
            } else if (this.hk[key].type === 'prog') {
                let curLen = this.hk[key].val / this.hk[key].max * this.hk[key].w;

                noFill();
                stroke(255);
                rect(this.hk[key].x + xOffset, this.hk[key].y - yOffset, this.hk[key].w, this.fontSize);
                fill(255);
                rect(this.hk[key].x + xOffset, this.hk[key].y - yOffset, curLen, this.fontSize);
            }
        }

        // Show the console message (if any)
        if (this.msgCounter > 0) {
            this.displayText(this.msgConsole, 50, true);
            this.msgCounter--;
        }

        // Show the scrolling box if any
        this.showScrollingBox();

        // Reset the frameLineOffset
        this.frameLnOffset = 0;
    }

    displayText(message, size, blinking) {
        fill(255);
        textFont(this.font);
        textSize(size  * this.ch / DEFAULT_H);
        textAlign(CENTER, BASELINE);
        textWrap(WORD);

        if ((blinking) && ((floor(frameCount / 10)) % 2 == 0)) {
            return;
        } 

        text(message, 0, this.ch / 2 - 25 + this.frameLnOffset, this.cw, this.ch / 2);
        this.frameLnOffset += size + textDescent() * 0.4;
    }

    displayTextBox(message, size, x, y, w, h) {
        let xBox = x * this.cw / DEFAULT_W;
        let yBox = y * this.ch / DEFAULT_H;
        let wBox = w * this.cw / DEFAULT_W;
        let hBox = h * this.ch / DEFAULT_H;

        fill(255);
        textWrap(WORD);
        textFont(this.font);
        textSize(size  * this.ch / DEFAULT_H);
        textAlign(CENTER, BASELINE);
        
        text(message, xBox, yBox, wBox, hBox);
    }

    showScrollingBox() {
        let offset = 0;
        let delta = 0;

        // Init the x offset to cocatenate multiple horzional messages
        if (this.scrollBoxes.length > 0) {
            offset = this.scrollBoxes[0].boxX;
        }
    
        // Iterate over all the scrolling boxes
        for (let i = 0; i < this.scrollBoxes.length; i++) {
            delta = this.scrollBoxes[i].show(offset);
            // Show the Msg and if it is out of screen
            if (delta === -1) {
                // Remove the message fomr the list
                this.scrollBoxes.splice(i, 1);
                delta = 0;
            }

            offset += delta;
        }
    }

    displayContinueMsg(keyMsg, actionMsg) {
        if ((floor(frameCount / 40)) % 2 == 0) {
            fill(255);
            textFont(this.font);
            textAlign(CENTER, CENTER);
            textSize(20  * engine.ch / DEFAULT_H);
            text("- Press " + keyMsg +" to " + actionMsg + " -", engine.cw / 2, engine.ch / 8 * 7);
        }
    }

    scroll () {
        for (let box of this.scrollBoxes) {
            box.scroll();
        }
    }

    isScrollBoxOver () {
        return (this.scrollBoxes.length === 0);
    }

    consoleLine(message) {
        this.msgCounter = 150;
        this.msgConsole = message.slice();
    }

    consoleBox(message, x, y, w, h, type, size) {
        this.scrollBoxes.push(new ScrollingMsg(x,y,w, h, size, type, message, this.font));
        
        /*
        this.boxSize = size * this.ch / DEFAULT_H;

        // if a message is scrolling, append the new one 
        if ((this.boxEnd === false) && (type === this.boxScroll)) {
            this.boxW += (w + 100) * this.cw / DEFAULT_W;
            this.boxH += h * this.ch / DEFAULT_H;

            this.boxMessage += "  :::  ";
            this.boxMessage += message;
        } // else reset from beginning
        else {
            this.boxX = x * this.cw / DEFAULT_W;
            this.boxY = y * this.ch / DEFAULT_H;
            this.boxW = w * this.cw / DEFAULT_W;
            this.boxH = h * this.ch / DEFAULT_H;
            this.boxScroll = type;

            this.boxMessage = message.slice();
        }

        this.boxEnd = false;
        */
    }
}