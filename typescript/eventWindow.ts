import * as PIXI from "pixi.js";
import { simpleWindow } from "./simpleWindow";
import { MyText } from "./myText";

export class eventWindow extends simpleWindow {
    mode: number;
    cnt: number;
    wordCnt: number;
    text: string;
    displayText: MyText;
    constructor() {
        super(400, 600, 0, 0, 101, 0x333333, 0.9, false);
        this.displayText = new MyText("", 0, 0, 0, 25, 25, 0xdddddd);
        this.displayText.style.wordWrapWidth = 400;
        this.addChild(this.displayText);
        this.interactive = true;
    }
    display() {
        if (this.mode == 0) {
            if (this.cnt % 15 == 0) {
                this.wordCnt++;
            }
            const text = this.text.substr(0, this.wordCnt);
            if (this.cnt % 15 == 0) {
                console.log(text.substr(-1));
                if (text.substr(-1).match(/\n/)) {
                } else {
                    PIXI.Loader.shared.resources.message.sound.play();
                }
            }
            this.displayText.setText(text);
            if (text.length == this.text.length) {
                this.mode = 1;
            }
        } else if (this.mode == 1) {
            this.on("pointertap", () => {
                this.visible = false;
                this.mode = 2;
            });
        }
        this.cnt++;
    }
    initialize() {
        this.cnt = 0;
        this.wordCnt = 0;
        this.mode = 0;
    }
    setText(text: string) {
        this.text = text;
    }
}