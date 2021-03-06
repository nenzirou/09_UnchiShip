import * as PIXI from "pixi.js";
export class MyText extends PIXI.Text {
    constructor(text: string, x: number, y: number, z: number, fontSize: number, height: number, fill: number) {
        super(text);
        // テキストに関するパラメータを定義する(ここで定義した意外にもたくさんパラメータがある)
        const textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", // フォント
            fontSize: fontSize,// フォントサイズ
            lineHeight: height,
            fontWeight: 'bold',
            fill: fill, // 色(16進数で定義するので#ffffffと書かずに0xffffffと書く)
            dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
            dropShadowDistance: 1, // ドロップシャドウの影の距離d
            dropShadowAlpha: 0.9,
            wordWrap: true,
            wordWrapWidth: 360,
            breakWords:true
        });
        this.style = textStyle;
        this.x = x;// ウィンドウのｘ座標
        this.y = y;// ウィンドウのｙ座標
        this.zIndex = z;
    }
    setText(text: string) {
        this.text = text;
    }
}