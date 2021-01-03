import * as PIXI from "pixi.js";
export class MyText extends PIXI.Text {
    constructor(x: number, y: number, z: number, fontSize: number, fill:number) {
        super("");
        // テキストに関するパラメータを定義する(ここで定義した意外にもたくさんパラメータがある)
        const textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", // フォント
            fontSize: fontSize,// フォントサイズ
            lineHeight: fontSize,
            fontWeight: 'bold',
            fill: fill, // 色(16進数で定義するので#ffffffと書かずに0xffffffと書く)
            dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
            dropShadowDistance: 1, // ドロップシャドウの影の距離
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