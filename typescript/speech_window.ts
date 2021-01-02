import * as PIXI from "pixi.js";
/*
ウィンドウ
*/
export class SpeechWindow extends PIXI.TilingSprite {
    buttonText: PIXI.Text;
    constructor(x: number, y: number, z: number, scaleX: number, scaleY: number) {
        super(PIXI.Loader.shared.resources.window.texture, 50, 100);
        this.anchor.set(0.5);
        this.x = x;// ウィンドウのｘ座標
        this.y = y;// ウィンドウのｙ座標
        this.scale.set(scaleX, scaleY);
        this.zIndex = z;
        this.interactive = true;
        // テキストに関するパラメータを定義する(ここで定義した意外にもたくさんパラメータがある)
        const textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", // フォント
            fontSize: 50,// フォントサイズ
            fontWeight: 'bold',
            stroke:0x000000,
            fill: 0xff0000, // 色(16進数で定義するので#ffffffと書かずに0xffffffと書く)
        });
        this.buttonText = new PIXI.Text("", textStyle); // テキストオブジェクトをtextStyleのパラメータで定義
        this.buttonText.anchor.set(0.5);
        this.buttonText.scale.set(0.25);
        this.buttonText.position.set(0,0);
        this.addChild(this.buttonText);
    }
    setText(text: string) {
        this.buttonText.text = text;
    }
}