import * as PIXI from "pixi.js"; // node_modulesから PIXI.jsをインポート
import * as PIXI_SOUND from "pixi-sound";// node_modulesから PIXI_SOUNDをインポート
import { SceneManager } from "./scene_manager"; // シーン管理を行うクラスをインポート
import { createButton } from "./create_button"; // ボタン生成関数をインポート
import { Ship } from "./ship"; // ボタン生成関数をインポート

// PIXI_SOUNDを有効にするためには必ずこの初期化命令を実行すること
PIXI_SOUND.default.init();

// PIXI.JSアプリケーションを呼び出す (この数字はゲーム内の画面サイズ)
const app = new PIXI.Application({ width: 400, height: 600 });

// index.htmlのbodyにapp.viewを追加する (app.viewはcanvasのdom要素)
document.body.appendChild(app.view);

// ゲームcanvasのcssを定義する
// ここで定義した画面サイズ(width,height)は実際に画面に表示するサイズ
app.renderer.view.style.position = "relative";
app.renderer.view.style.width = "400px";
app.renderer.view.style.height = "600px";
app.renderer.view.style.display = "block";

// canvasの周りを点線枠で囲う (canvasの位置がわかりやすいので入れている)
app.renderer.view.style.border = "2px dashed black";

// canvasの背景色
app.renderer.backgroundColor = 0x333333;

// ゲームで使用する画像をあらかじめ読み込んでおく(プリロードという)
// v5.3.2　だと PIXI.Loader.shared.addでプリロードする
const sound = { hit: "sound/hit.mp3" };
const image = { oji: "image/oji.png", room_wall: "image/room_wall.png", room_aisle: "image/room_aisle.png" };
Object.keys(sound).forEach(key => PIXI.Loader.shared.add(key,sound[key]));
Object.keys(image).forEach(key => PIXI.Loader.shared.add(key,image[key]));

const sceneManager = new SceneManager(app);

// プリロード処理が終わったら呼び出されるイベント
PIXI.Loader.shared.load((loader, resources) => {
    /**
     * 状態が変化する変数一覧
     */

    /**
     * ゲームのメインシーンを生成する関数
     */
    function createGameScene() {
        // 他に表示しているシーンがあれば削除
        sceneManager.removeAllScene();
        // 毎フレームイベントを削除
        sceneManager.removeAllGameLoops();

        // ゲーム用のシーンを生成
        const gameScene = new PIXI.Container();
        // ゲームシーンを画面に追加
        app.stage.addChild(gameScene);

        // ボール画像を表示するスプライトオブジェクトを実体化させる
        // const ball = new PIXI.Sprite(resources["image/background1.png"].texture); //引数には、プリロードしたURLを追加する
        // ball.x = 200; // x座標
        // ball.y = 500; // y座標
        // ball.interactive = true; // クリック可能にする
        // ball.on("pointerdown", () =>      // クリック時に発動する関数
        // {
        //     resources["sound/hit.mp3"].sound.play(); // クリックで音が鳴る
        // });
        // gameScene.addChild(ball); // ボールをシーンに追加
        const ship = new Ship(0, 0, 400, 600);
        gameScene.addChild(ship);
        // テキストに関するパラメータを定義する(ここで定義した意外にもたくさんパラメータがある)
        // const textStyle = new PIXI.TextStyle({
        //     fontFamily: "Arial", // フォント
        //     fontSize: 20,// フォントサイズ
        //     fill: 0xffffff, // 色(16進数で定義するので#ffffffと書かずに0xffffffと書く)
        //     dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
        //     dropShadowDistance: 2, // ドロップシャドウの影の距離
        // });

        // const text = new PIXI.Text("SCORE:0", textStyle); //スコア表示テキスト
        // gameScene.addChild(text); // スコア表示テキストを画面に追加する
        // const tweetButton = createButton("ツイート", 100, 60, 0, 0, 0x0000ff, () => {
        //     //ツイートＡＰＩに送信
        //     //結果ツイート時にURLを貼るため、このゲームのURLをここに記入してURLがツイート画面に反映されるようにエンコードする
        //     const url = encodeURI("https://hothukurou.com"); // ツイートに載せるURLを指定(文字はエンコードする必要がある)
        //     window.open(`http://twitter.com/intent/tweet?text=SCORE:点で力尽きた&hashtags=sample&url=${url}`); //ハッシュタグをsampleにする
        // });
        // gameScene.addChild(tweetButton); // ボタンを結果画面シーンに追加

        function gameLoop() // 毎フレームごとに処理するゲームループの関数
        {
            ship.move();
        }
        // ゲームループ関数を毎フレーム処理の関数として追加
        sceneManager.addGameLoop(gameLoop);
    }
    // 起動直後はゲームシーンを追加する
    createGameScene();
});
