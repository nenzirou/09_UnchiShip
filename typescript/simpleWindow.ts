import * as PIXI from "pixi.js";
import { MyText } from "./myText";
/*
ウィンドウ
*/
export class simpleWindow extends PIXI.Graphics {
    text: MyText;//ウィンドウ内テキスト
    constructor(width: number, height: number, x: number, y: number, z: number,color:number, alpha: number, visible: boolean) {
        super();
        this.beginFill(color, alpha); // 色、透明度を指定して描画開始
        this.drawRect(0, 0, width, height); // 位置(0,0)を左上にして、width,heghtの四角形を描画
        this.endFill(); // 描画完了
        this.x = x;// ウィンドウのｘ座標
        this.y = y;// ウィンドウのｙ座標
        this.zIndex = z;//ウィンドウのｚ座標
        this.sortableChildren = true;//子のｚ座標を考慮する
        this.visible = visible;//表示設定
        this.interactive = true;//ウィンドウに隠れた物のタッチを無効にするために設定
    }
}