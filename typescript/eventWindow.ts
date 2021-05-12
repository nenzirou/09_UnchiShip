import * as PIXI from "pixi.js";
import { simpleWindow } from "./simpleWindow";
import { MyText } from "./myText";
import gsap from "gsap";

export class eventWindow extends simpleWindow {
    mode: number;
    cnt: number;
    wordCnt: number;
    text: string;
    displayText: MyText;
    sencho: PIXI.Sprite;
    speed: number;
    constructor() {
        super(400, 600, 0, 0, 101, 0x333333, 0.9, false);
        this.speed = 1;
        this.displayText = new MyText("", 10, 200, 0, 23, 25, 0xdddddd);
        this.displayText.style.wordWrapWidth = 380;
        this.addChild(this.displayText);
        this.on("pointertap", () => {
            if (this.mode == 1) this.mode = 2;
        });
        this.sencho = new PIXI.Sprite(PIXI.Loader.shared.resources.sencho.texture);
        this.sencho.anchor.set(0.5);
        this.sencho.position.set(50, 100);
        this.addChild(this.sencho);
        this.initialize();
    }
    display() {
        if (this.mode == 0) {
            if (this.cnt % this.speed == 0) {
                this.wordCnt++;
            }
            const text = this.text.substr(0, this.wordCnt);
            if (this.cnt % this.speed == 0) {
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
        if (this.sencho.visible) this.sencho.rotation = Math.sin(this.cnt / 100) / 10;
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