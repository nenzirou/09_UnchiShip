import gsap from "gsap";
import { TimeLimiter } from "pixi.js";
import { Button } from "./button";
import { eventWindow } from "./eventWindow";
import { MyText } from "./myText";
import { Ship } from "./ship";
import { simpleWindow } from "./simpleWindow";

export class GameEvent {
    mode: number;
    cnt: number;
    background: eventWindow;
    texts: string[][] = [
        ["ここは宇宙のど真ん中。\n小さな星に小さな宇宙船がぽつり。", "船員のおじさん達は今日も元気に働き中。", "おじさんが地球を旅立ち１億年。\n地球には、もはや彼らを知る者は誰一人いない。", "そしておじさん達も、\n自分たちが宇宙を漂う理由を\n\nまだ知らない。",
            "よう！\n新しい船の調子はどうだ？", "...どうやらやるき満々のようだな。", "いざ、チキューに向けて出発だ！", "チキューは我らが故郷！\n生きるために必要な水や食料がたくさん手に入る。", "我らが生き延びるために\n再びチキューの地へと足を踏み入れるのだ！",
            "おっと。\nこの船にはまだエンジンがなかったな。", "たしかこの辺りに...",
            "あったあった。\nこれがエンジ...ん？", "へへっ、間違えて別の素材を持ってきちまった。\nぷりぷり。", "まあいいだろう。\n試しにこれで倉庫を作ってみよう！", "メニューの「建設」から倉庫のアイコンを選んで建設だ！",
            "無事倉庫が出来たみたいだな！\n宇宙にはたくさんのアイテムが散らばっている。\n倉庫はそのお宝を格納するために必須だ！", "っと、エンジンがいるんだったな。\n\n\n\n\n\nどれどれ...",
            "あったあった。\n今度こそエンジ...ん？", "へへへっ、また間違えちゃった。\nぷりぷり。", "いや、ブラウザバックしないで！\nチュートリアルのためにわざと間違えることを強いられてるんだ！", "というわけで、今度はベッドを作ってみよう！",
            "おじさんとて、働けば休憩も必要になる。\nおじさんの数だけベッドを用意して、\n過労死しないように気を付けるんだ！", "おじさんの数を増やすのにもベッドが必要だぞ！\nどうやって増えるのかって？\n\n\n...ぷりぷり。", "よし、今度こそエンジンを探してくるぞ。\n\n\n\nどれどれ...",
            "あったあった。\nこれぞ正真正銘のエンジ...ん？", "うん、まぎれもなくエンジンだ。\n最後にエンジンを作成してみよう！",
            "エンジンを作ると、FUELの最大値が増える。\nFUELがなくなると、\n永遠に宇宙を漂うことになるから気をつけろ。", "さあ、広大な宇宙へと旅立とう！\n「地図」から近くの星を選択して出発だ！"],
    ];
    constructor(gameScene: PIXI.Container) {
        this.background = new eventWindow();
        gameScene.addChild(this.background);
        this.initialize();
    }
    act(ship: Ship, gameScene: PIXI.Container) {
        const eventFlags: boolean[] = ship.eventFlags;
        //イベント１　チュートリアル①
        if (!eventFlags[0]) {
            if (this.mode == 0) {//初期化
                this.background.visible = true;
                ship.scale.set(0.75);
                ship.position.set(50, 90);
                ship.menuHider.visible = true;
            }
            this.setSpeak(0, 0, 4, 0, false);//冒頭の説明
            this.setSpeak(0, 4, 9, 0, true);//船長登場
            this.setWait(9, 120);//待ち
            this.setSpeak(0, 11, 13, 2, true);//エンジンを取り出すぞ！
            if (this.mode == 13) {//倉庫のアイテムを持ってきてしまった
                this.background.visible = false;
                this.cnt = 0;
                for (let i = 0; i < 3; i++) ship.makeItem( 200, 200, 7, 1, "made");
                for (let i = 0; i < 2; i++) ship.makeItem( 232, 200, 8, 1, "made");
                this.mode = 14;
            } else if (this.mode == 14) {
                if (this.cnt > 120) this.mode = 15;
            }
            this.setSpeak(0, 15, 19, 4, true);//倉庫作るか
            if (this.mode == 19) {
                this.background.visible = false;
                ship.menuHider.visible = false;
                gameScene.addChild(Button.makeSpeech("「建設」から倉庫を作ろう！", 0x33dd33, 5, 400, 25, 0, 0, 0, 25, 0.9));
                this.mode = 20;
            }
            if (this.mode == 20 && ship.warehouses.length > 0) {
                if (ship.warehouses[0].state === 'free') {
                    this.mode = 21;
                }
            }
            this.setSpeak(0, 21, 23, 6, true);//倉庫できたな
            if (this.mode == 23) {//ベッドの素材持ってきた
                this.background.visible = false;
                this.cnt = 0;
                ship.makeItem( 200, 200, 17, 1, "made");
                ship.makeItem( 232, 200, 16, 1, "made");
                this.mode = 24;
            } else if (this.mode == 24) {
                if (this.cnt > 120) this.mode = 25;
            }
            this.setSpeak(0, 25, 29, 8, true);//ベッドをつくろう
            if (this.mode == 29) {
                this.background.visible = false;
                ship.menuHider.visible = false;
                gameScene.addChild(Button.makeSpeech("「建設」からベッドを作ろう！", 0x33dd33, 5, 400, 25, 0, 0, 0, 25, 0.9));
                this.mode = 30;
            }
            if (this.mode == 30) {
                const bed = ship.rooms.find((v) => v.id === 3);
                if (bed !== undefined) {
                    if (bed.state === 'free') {
                        this.mode = 31;
                    }
                }
            }
            this.setSpeak(0, 31, 34, 10, true);//ベッドできたね
            if (this.mode == 34) {
                this.background.visible = false;
                this.cnt = 0;
                ship.makeItem( 200, 200, 18, 1, "made");
                ship.makeItem( 232, 200, 19, 1, "made");
                this.mode = 35;
            } else if (this.mode == 35) {
                if (this.cnt > 120) this.mode = 36;
            }
            this.setSpeak(0, 36, 38, 12, true);//今度こそエンジンだ
            if (this.mode == 38) {
                this.background.visible = false;
                ship.menuHider.visible = false;
                gameScene.addChild(Button.makeSpeech("「建設」からエンジンを作ろう！", 0x33dd33, 5, 400, 25, 0, 0, 0, 25, 0.9));
                this.mode = 39;
            }
            if (this.mode == 39) {
                const engine = ship.rooms.find((v) => v.id === 5);
                if (engine !== undefined) {
                    if (engine.state === 'free') {
                        ship.fuel = 500;
                        this.mode = 40;
                    }
                }
            }
            this.setSpeak(0, 40, 42, 14, true);
            if (this.mode == 42) {
                eventFlags[0] = true;
                this.initialize();
            }
        } else if (!eventFlags[1]) {

        }
        this.cnt++;
    }
    initialize() {
        this.cnt = 0;
        this.mode = 0;
        this.background.visible = false;
        this.background.initialize();
    }
    setSpeak(textID: number, first: number, end: number, buf: number, sencho: boolean) {
        for (let i = first; i < end; i++) {
            if (this.mode == i) {
                this.background.visible = true;
                this.background.sencho.visible = sencho;
                this.background.setText(this.texts[textID][i - buf]);
                this.background.display();
                if (this.background.mode == 2) {
                    this.background.initialize();
                    this.mode++;
                }
            }
        }
    }
    setWait(mode: number, time: number) {
        if (this.mode == mode) {
            this.background.visible = false;
            this.cnt = 0;
            this.mode = mode + 1;
        } else if (this.mode == mode + 1) {
            if (this.cnt > time) {
                this.background.visible = true;
                this.mode = mode + 2;
            }
        }
    }
}