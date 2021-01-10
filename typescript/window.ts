import * as PIXI from "pixi.js";
import { MyText } from "./myText";
/*
ウィンドウ
*/
export class TextWindow extends PIXI.TilingSprite {
    text: MyText;//ウィンドウ内テキスト
    constructor(x: number, y: number, z: number, scaleX: number, scaleY: number, alpha: number,visible:boolean) {
        super(PIXI.Loader.shared.resources.window.texture, 400, 600);
        this.x = x;// ウィンドウのｘ座標
        this.y = y;// ウィンドウのｙ座標
        this.zIndex = z;//ウィンドウのｚ座標
        this.scale.set(scaleX, scaleY);//ウィンドウの大きさ
        this.alpha = alpha;//ウィンドウの透明度
        this.sortableChildren = true;//子のｚ座標を考慮する
        this.visible = visible;//表示設定
        this.text = new MyText("",25, 30, 0, 32, 32, 0x333333);//ウィンドウ内のテキスト
        this.text.position.set(25, 30);//ウィンドウ内のテキストの位置
        this.addChild(this.text);//ウィンドウテキストをウィンドウに登録
        this.interactive = true;//ウィンドウに隠れた物のタッチを無効にするために設定
    }
    //ウィンドウ内テキストを変更する
    setText(text: string) {
        this.text.text = text;
    }
}