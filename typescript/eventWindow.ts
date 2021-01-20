import * as PIXI from "pixi.js";
import { simpleWindow } from "./simpleWindow";
import { MyText } from "./myText";

export class eventWindow extends simpleWindow {
    mode: number;
    cnt: number;
    wordCnt: number;
    text: string;
    displayText: MyText;
    sencho: PIXI.Sprite;
    constructor() {
        super(400, 600, 0, 0, 101, 0x333333, 0.9, false);
        this.displayText = new MyText("", 10, 200, 0, 23, 25, 0xdddddd);
        this.displayText.style.wordWrapWidth = 380;
        this.addChild(this.displayText);
        this.on("pointertap", () => {
            if (this.mode == 1) this.mode = 2;
        });
        this.sencho = new PIXI.Sprite(PIXI.Loader.shared.resources.sencho.texture);
        this.addChild(this.sencho);
        this.initialize();
    }
    display() {
        if (this.mode == 0) {
            if (this.cnt % 1 == 0) {
                this.wordCnt++;
            }
            const text = this.text.substr(0, this.wordCnt);
            if (this.cnt % 1 == 0) {
                if (text.substr(-1).match(/\n/)) {
                } else {
                    PIXI.Loader.shared.resources.message.sound.play();
                }
            }
            this.displayText.setText(text);
            if (text.length == this.text.length) {
                this.mode = 1;
            }
        }
        this.cnt++;
    }
    initialize() {
        this.cnt = 0;
        this.wordCnt = 0;
        this.mode = 0;
        this.text = "";
        this.displayText.y = 200;
        this.sencho.visible = false;
    }
    setText(text: string) {
        this.text = text;
    }
}