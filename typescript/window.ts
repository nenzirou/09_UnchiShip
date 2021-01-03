import * as PIXI from "pixi.js";
/*
ウィンドウ
*/
export class TextWindow extends PIXI.TilingSprite {
    buttonText: PIXI.Text;
    constructor(x: number, y: number, z: number, scaleX: number, scaleY: number) {
        super(PIXI.Loader.shared.resources.window.texture, 400, 500);
        this.x = x;// ウィンドウのｘ座標
        this.y = y;// ウィンドウのｙ座標
        this.scale.set(scaleX, scaleY);
        this.zIndex = z;
        this.interactive = true;
        this.alpha = 0.8;
        // テキストに関するパラメータを定義する(ここで定義した意外にもたくさんパラメータがある)
        const textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", // フォント
            fontSize: 32,// フォントサイズ
            lineHeight:32,
            fontWeight: 'bold',
            fill: 0x333333, // 色(16進数で定義するので#ffffffと書かずに0xffffffと書く)
            dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
            dropShadowDistance: 1, // ドロップシャドウの影の距離
        });
        this.buttonText = new PIXI.Text("", textStyle); // テキストオブジェクトをtextStyleのパラメータで定義
        this.buttonText.position.set(25, 30);
        this.addChild(this.buttonText);
    }
    setText(text: string) {
        this.buttonText.text = text;
    }
}