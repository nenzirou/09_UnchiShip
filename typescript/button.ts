import * as PIXI from "pixi.js";
import gsap from "gsap";
/**
 * ボタンを生成してオブジェクトを返す関数
 * @param text テキスト
 * @param width 横幅
 * @param height 縦幅
 */
export class Button extends PIXI.Container {
    buttonText: PIXI.Text;
    constructor(text: string, width: number, height: number, x: number, y: number, z: number, color: number, fontSize: number, alpha: number, touch: boolean) {
        super();
        // ボタン作成
        const backColor = new PIXI.Graphics(); // グラフィックオブジェクト（背景に半透明な四角を配置するために使用）
        backColor.beginFill(color, alpha); // 色、透明度を指定して描画開始
        backColor.drawRect(0, 0, width, height); // 位置(0,0)を左上にして、width,heghtの四角形を描画
        backColor.endFill(); // 描画完了
        backColor.interactive = touch; // クリック可能にする
        backColor.buttonMode = touch;//クリック可能なマウスカーソルにする
        this.addChild(backColor); // 背景をボタンコンテナに追加

        // テキストに関するパラメータを定義する(ここで定義した意外にもたくさんパラメータがある)
        const textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", // フォント
            fontSize: fontSize,// フォントサイズ
            fill: 0xffffff, // 色(16進数で定義するので#ffffffと書かずに0xffffffと書く)
            dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
            dropShadowDistance: 2, // ドロップシャドウの影の距離
        });

        this.buttonText = new PIXI.Text(text, textStyle); // テキストオブジェクトをtextStyleのパラメータで定義
        this.buttonText.anchor.set(0.5);
        this.buttonText.position.set(this.width / 2, this.height / 2);
        this.interactive = true; // クリック可能にする
        this.addChild(this.buttonText); // ボタンテキストをボタンコンテナに追加
        this.x = x;
        this.y = y;
        this.zIndex = z;

    }
    static makeTouchSpeech(text: string, width: number, height: number, x: number, y: number, z: number, fontSize: number, alpha: number, parent) {
        let speech = new Button(text, width, height, x, y, z, 0x333333, fontSize, alpha,false);
        const tl = gsap.timeline();//タイムライン初期化
        tl
            .from(speech.scale, { duration: 0.1, x: 0.1, y: 0.1 })
            .to(speech, { duration: 5, alpha: 0, ease: "power4.in" })
            .call(() => {
                parent.interactive = true;
                parent.removeChild(speech);
            })
        parent.interactive = false;
        parent.addChild(speech);
    }
    static makeSpeech(text: string, color: number, duration: number, width: number, height: number, x: number, y: number, z: number, fontSize: number, alpha: number) {
        const speech = new Button(text, width, height, x, y, z, color, fontSize, alpha,false);
        speech.interactive = false;
        speech.buttonMode = false;
        const tl = gsap.timeline();//タイムライン初期化
        tl
            .from(speech.scale, { duration: 0.1, x: 0.1, y: 0.1 })
            .to(speech, { duration: duration, alpha: 0, ease: "power4.in" })
            .call(() => {
                speech.parent.removeChild(speech);
            })
        return speech;
    }
}