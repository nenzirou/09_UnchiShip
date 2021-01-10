import * as PIXI from "pixi.js";
import { Button } from "./button";
import { Ship } from "./ship";
import { itemList, Room } from "./room";
import { simpleWindow } from "./simpleWindow";
import { MyText } from "./myText";
import { Item } from "./item";
import { TextWindow } from "./window";
interface barInfo {
    title: string;//話のタイトル
    name: string;//話者の名前
    detail: string;//話の内容
    money: number;//話を聞くのに必要なお金
    flag: number;//オンにするフラグナンバー
}
export class Bar extends PIXI.Sprite {
    static barInfo: barInfo[] = [
        {
            title: "ケツの祖先の話",
            name: "好奇心旺盛なケツおじさん",
            detail: "俺たちの祖先がチキュー生まれだって\nいうのは知っているか？\nそのチキューが寒さでダメになったから\n宇宙まで逃げてきたって話だ。\nもしも外に住める惑星が無かったら\n今頃どうなってただろうな。\n",
            money: 20,
            flag: 50
        }, {
            title: "ケツおじさんの起源の話",
            name: "気さくなケツおじさん",
            detail: "俺たちケツおじさんは元々はニンゲンだった\nらしいぜ。\n俺の友達の従妹のおじいちゃんと\n連れションしたときにそう聞いたんだ。\nまあ、じいちゃんは当時からボケてたから\n本当かどうかは分かんねえけどな。\n\n...ん？\n僕たちはニンゲンじゃないのかって？\nははははっ！そんな訳ないだろー。",
            money: 30,
            flag: 51
        }
    ];
    talks: number[];//クエストリスト
    backButton: Button;//戻るボタン
    moneyText: MyText;//お金表示
    max: number = 5;//話の最大数
    oneLayerTitleText: MyText;//クエストタイトルテキスト
    oneLayerMoneyText: MyText;//お金テキスト
    oneLayerButtons: Button[] = [];//クエスト詳細ボタン
    twoLayerWindows: TextWindow[] = [];//第２層のウィンドウ
    twoLayerNameTexts: MyText[] = [];//依頼者の名前を入れるテキスト
    twoLayerFlavorTexts: MyText[] = [];//依頼のフレーバーテキスト
    constructor(ship: Ship) {
        super(PIXI.Loader.shared.resources.window.texture);
        this.interactive = true;
        this.sortableChildren = true;
        this.zIndex = 100;//最前面表示
        this.alpha = 1;
        //戻るボタン作成
        this.backButton = Room.makeBackButton(0, 0, this);
        //所持金表示テキスト作成
        this.moneyText = new MyText("", 160, 5, 0, 20, 32, 0xdddd33);
        this.addChild(this.moneyText);
        //「クエスト一覧」テキスト作成
        this.addChild(new MyText("小話一覧", 50, 0, 1, 24, 32, 0x333333));
        //クエストタイトルテキスト作成
        this.oneLayerTitleText = new MyText("", 20, 37, 1, 24, 35, 0x333333);
        this.addChild(this.oneLayerTitleText);
        //お金表示テキスト作成
        this.oneLayerMoneyText = new MyText("", 20, 37, 1, 24, 35, 0xffff33);
        this.addChild(this.oneLayerMoneyText);
        for (let i = 0; i < this.max; i++) {
            //入れ子ウィンドウ
            const twoLayerWindow = new TextWindow(0, 0, 5, 1, 1, 1, false);
            Room.makeBackButton(50, 0, twoLayerWindow);//戻るボタン
            this.addChild(twoLayerWindow);
            this.twoLayerWindows.push(twoLayerWindow);
            //依頼者の名前のテキスト
            const twoLayerNameText = new MyText("", 20, 32, 1, 24, 32, 0x3333dd);
            this.twoLayerWindows[i].addChild(twoLayerNameText);
            this.twoLayerNameTexts.push(twoLayerNameText);
            //依頼の詳細テキスト
            const twoLayerFlavorText = new MyText("", 20, 64, 1, 18, 24, 0x333333);
            this.twoLayerWindows[i].addChild(twoLayerFlavorText);
            this.twoLayerFlavorTexts.push(twoLayerFlavorText);
            //詳細ボタン
            const detailsButton = new Button("話を聞く", 100, 32, 280, 35 * (i + 1) * 2, 0, 0x3333dd, 24, 1, true);
            detailsButton.on("pointertap", () => {//SE
                this.twoLayerNameTexts[i].setText("∴" + Bar.barInfo[this.talks[i]].name);//依頼主テキスト設定
                this.twoLayerFlavorTexts[i].setText(Bar.barInfo[this.talks[i]].detail);//フレーバーテキスト設定
                if (!ship.eventFlags[Bar.barInfo[this.talks[i]].flag]) {
                    if (ship.money >= Bar.barInfo[this.talks[i]].money) {
                        PIXI.Loader.shared.resources.open.sound.play();
                        this.twoLayerWindows[i].visible = true;//入れ子ウィンドウを表示
                        ship.money -= Bar.barInfo[this.talks[i]].money;//お金清算
                        ship.eventFlags[Bar.barInfo[this.talks[i]].flag] = true;
                    } else PIXI.Loader.shared.resources.nSelect.sound.play();
                } else {
                    PIXI.Loader.shared.resources.open.sound.play();
                    this.twoLayerWindows[i].visible = true;//入れ子ウィンドウを表示
                }
            });
            this.addChild(detailsButton);
            this.oneLayerButtons.push(detailsButton);
        }
        this.setTalkList([0, 1, 0, 1]);
    }
    display(ship: Ship) {
        if (this.visible) {
            this.moneyText.setText("所持金:" + ship.money + "G");
            let text = "\n";
            for (let i = 0; i < this.talks.length; i++) {
                text += Bar.barInfo[this.talks[i]].money + "G\n\n";
            }
            this.oneLayerMoneyText.setText(text);
        }
    }
    setTalkList(talks: number[]) {
        this.talks = talks;
        for (let i = 0; i < this.max; i++) {
            if (i < this.talks.length) this.oneLayerButtons[i].visible = true;
            else this.oneLayerButtons[i].visible = false;
        }
        let titleText = "";//タイトル一覧設定
        for (let i = 0; i < this.talks.length; i++) {
            titleText += Bar.barInfo[this.talks[i]].title + "\n\n";
        }
        this.oneLayerTitleText.setText(titleText);
    }
}