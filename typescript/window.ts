import * as PIXI from "pixi.js";
import { MyText } from "./text";
/*
ウィンドウ
*/
export class TextWindow extends PIXI.TilingSprite {
    buttonText: MyText;
    constructor(x: number, y: number, z: number, scaleX: number, scaleY: number, alpha: number) {
        super(PIXI.Loader.shared.resources.window.texture, 400, 600);
        this.x = x;// ウィンドウのｘ座標
        this.y = y;// ウィンドウのｙ座標
        this.scale.set(scaleX, scaleY);
        this.zIndex = z;
        this.interactive = true;
        this.alpha = alpha;
        this.sortableChildren = true;
        this.buttonText = new MyText(25, 30, 0, 32, 32, 0x333333);
        this.buttonText.position.set(25, 30);
        this.addChild(this.buttonText);
    }
    setText(text: string) {
        this.buttonText.text = text;
    }
}