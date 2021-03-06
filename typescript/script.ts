import * as PIXI from "pixi.js"; // node_modulesから PIXI.jsをインポート
import * as PIXI_SOUND from "pixi-sound";// node_modulesから PIXI_SOUNDをインポート
import { SceneManager } from "./scene_manager"; // シーン管理を行うクラスをインポート
import { Ship } from "./ship";
import { GameEvent } from "./gameEvent";

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
app.renderer.view.autofocus = true;
// canvasの周りを点線枠で囲う (canvasの位置がわかりやすいので入れている)
//app.renderer.view.style.border = "2px dashed black";
// canvasの背景色
app.renderer.backgroundColor = 0x000033;
// ゲームで使用する画像をあらかじめ読み込んでおく(プリロードという)
// v5.3.2　だと PIXI.Loader.shared.addでプリロードする
const sound = {
    bgm1: "sound/bgm1.mp3", open: "sound/open.mp3", close: "sound/close.mp3", nSelect: "sound/nSelect.mp3", shop: "sound/shop.mp3", shopButton: "sound/shopButton.mp3", questButton: "sound/questButton.mp3", barButton: "sound/barButton.mp3", mapButton: "sound/mapButton.mp3", building: "sound/building.mp3", complete: "sound/complete.mp3", letsGo: "sound/letsGo.mp3", message: "sound/message.mp3"
};
const image = {
    oji: "image/oji.png", window: "image/window.png", cursor: "image/cursor.png", cursor2: "image/cursor2.png", item: "image/item.png", room_building: "image/room_building.png", room_warehouse: "image/box.png", room_wall: "image/room_wall.png", room_work: "image/desk.png", room_aisle: "image/room_aisle.png", room_bed: "image/room_bed.png", room_engine: "image/room_engine.png", rocket: "image/rocket.png", map: "image/map.png", menu: "image/menu.jpg", ship: "image/ship.png", sencho: "image/sencho.png",star:"image/star.png"
};
Object.keys(sound).forEach(key => PIXI.Loader.shared.add(key, sound[key]));
Object.keys(image).forEach(key => PIXI.Loader.shared.add(key, image[key]));

const sceneManager = new SceneManager(app);

// プリロード処理が終わったら呼び出されるイベント
PIXI.Loader.shared.load((loader, resources) => {
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
        gameScene.sortableChildren = true;
        app.stage.addChild(gameScene);
        const ship = new Ship(0, 0, 400, 500, gameScene);
        gameScene.addChild(ship);
        const event = new GameEvent(gameScene);

        // const tweetButton = createButton("ツイート", 100, 60, 0, 0, 0x0000ff, () => {
        //     //ツイートＡＰＩに送信
        //     //結果ツイート時にURLを貼るため、このゲームのURLをここに記入してURLがツイート画面に反映されるようにエンコードする
        //     const url = encodeURI("https://hothukurou.com"); // ツイートに載せるURLを指定(文字はエンコードする必要がある)
        //     window.open(`http://twitter.com/intent/tweet?text=SCORE:点で力尽きた&hashtags=sample&url=${url}`); //ハッシュタグをsampleにする
        // });
        // gameScene.addChild(tweetButton); // ボタンを結果画面シーンに追加

        function gameLoop() // 毎フレームごとに処理するゲームループの関数
        {
            if (ship.event) event.act(ship, gameScene);
            ship.move(app);
        }
        // ゲームループ関数を毎フレーム処理の関数として追加
        sceneManager.addGameLoop(gameLoop);
    }
    // 起動直後はゲームシーンを追加する
    createGameScene();
});
