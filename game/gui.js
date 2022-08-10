const DEFAULT_W = 1024;
const DEFAULT_H = 768;
const DEFAULT_FONT = 20;

class Gui {
    constructor(width, height, file) {
        this.hk = loadJSON(file);
        this.fontSize = DEFAULT_FONT;
        this.cw = width;
        this.ch = height;

        this.boxX = 0;
        this.boxY = 0;
        this.boxW = 0;
        this.boxH = 0;

        this.boxStart = 0;
        this.boxVel = -2;
        this.boxMessage = "";
        this.boxEnd = true;

        // display text varibales
        this.msgCounter = 0;
        this.msgConsole = "";
        this.frameLnOffset = 0;
    }

    initFonts(textFont, iconFont) {
        this.font = textFont;
        this.iconFont = iconFont;
    }

    reset() {
        for (const key of Object.keys(this.hk)) {
            this.hk[key].val = guiData[key].val;

            if (this.hk[key].type == 'icon') {
                this.hk[key].active = 1;
            }
        }
    }

    resize (xScale, yScale) {
        this.cw = this.cw * xScale;
        this.ch = this.ch * yScale;;

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

        // Reset the frameLineOffset
        this.frameLnOffset = 0;
    }

    displayText(message, size, blinking) {
        fill(255);
        textFont(this.font);
        textSize(size  * this.ch / DEFAULT_H);
        textAlign(CENTER, BASELINE);

        if ((blinking) && ((floor(frameCount / 10)) % 2 == 0)) {
            return;
        } 

        text(message, this.cw / 2, this.ch / 2 + this.frameLnOffset);
        this.frameLnOffset += size + textDescent() * 0.4;
    }

    displayTextBox() {
        if (this.boxEnd === false) {
            textWrap(WORD);
            fill(255);
            textFont(this.font);
            textSize(40 * this.ch / DEFAULT_H);
            textAlign(CENTER, BASELINE);

            text(this.boxMessage, this.boxX, this.boxStart, this.boxW, this.boxH);
            this.boxStart += this.boxVel;

            if ((this.boxStart + this.boxH) < 0) {
                this.boxEnd = true;
            }
        }
    }

    isBoxDisplayOver () {
        return this.boxEnd;
    }

    scrollUp () {
        if (this.boxEnd === false) {
            this.boxStart -= 100;
        } 
    }

    consoleLine(message) {
        this.msgCounter = 100;
        this.msgConsole = message.slice();
    }

    consoleBox(message, x, y, w, h) {
        this.boxX = x;
        this.boxY = y;
        this.boxW = w;
        this.boxH = h;

        this.boxStart = this.boxY ;//+ this.boxH;
        this.boxMessage = message.slice();
        this.boxEnd = false;
    }
}