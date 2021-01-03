import * as PIXI from "pixi.js";
/**
 * ボタンを生成してオブジェクトを返す関数
 * @param text テキスト
 * @param width 横幅
 * @param height 縦幅
 */
export class Button extends PIXI.Container {
    buttonText: PIXI.Text;
    constructor(text: string, width: number, height: number, x: number, y: number, z: number, color: number) {
        super();
        const fontSize = 20; // フォントサイズ
        const buttonAlpha = 0.6; // ボタン背景の透明度
        // ボタン作成
        const backColor = new PIXI.Graphics(); // グラフィックオブジェクト（背景に半透明な四角を配置するために使用）
        backColor.beginFill(color, buttonAlpha); // 色、透明度を指定して描画開始
        backColor.drawRect(0, 0, width, height); // 位置(0,0)を左上にして、width,heghtの四角形を描画
        backColor.endFill(); // 描画完了
        backColor.interactive = true; // クリック可能にする
        backColor.buttonMode = true;
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
        this.buttonText.anchor.x = 0.5; // アンカーを中央に設置する(アンカーは0~1を指定する)
        this.buttonText.anchor.y = 0.5; // アンカーを中央に設置する(アンカーは0~1を指定する)
        this.buttonText.x = width / 2; // ボタン中央にテキストを設置するため、width/2の値をx値に指定
        this.buttonText.y = height / 2; // ボタン中央テキストを設置するため、height/2の値をy値に指定
        this.addChild(this.buttonText); // ボタンテキストをボタンコンテナに追加
        this.interactive = true;
        this.x = x;
        this.y = y;
        this.zIndex = z;
    }
}