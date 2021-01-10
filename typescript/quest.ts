import * as PIXI from "pixi.js";
import { Button } from "./button";
import { Ship } from "./ship";
import { itemList, Room } from "./room";
import { simpleWindow } from "./simpleWindow";
import { MyText } from "./myText";
import { Item } from "./item";
import { TextWindow } from "./window";
/*
クエスト
形式　id、タイトルテキスト、依頼者、詳細テキスト、必要アイテム、報酬アイテム
オイルガチャ
*/
interface questInfo {
    title: string;//クエストタイトル
    name: string;//依頼主の名前
    detail: string;//クエスト詳細
    needItemList: itemList;//必要アイテム
    rewordItemList: itemList[];//報酬アイテム
}
export class Quest extends PIXI.Sprite {
    static questInfo: questInfo[] = [
        {
            title: "ケツ用のネジ不足",
            name: "村の長",
            detail: "ケツにねじ込むためのネジが最近\n不足しているんじゃ。\nどこかにいいネジは無いものか…\nどこかにいいネジは無いものか…\nどこかにいいネジは無いものか…\nどこかにいいネジは無いものか…",
            needItemList: { id: 1, num: 3 },
            rewordItemList: [{ id: 10, num: 3 }, { id: 12, num: 2 }, { id: 13, num: 1 }]
        }, {
            title: "ケツ用のドライバー不足",
            name: "村の長",
            detail: "ケツにねじ込むためのドライバーが不作で\n困っておるんじゃ。\nどこかにいいドライバーは無いものか…",
            needItemList: { id: 1, num: 1 },
            rewordItemList: [{ id: 1, num: 1 }]
        },
    ];
    quests: number[];//クエストリスト
    backButton: Button;//戻るボタン
    max: number = 10;//クエスト最大数
    oneLayerTitleText: MyText;//クエストタイトルテキスト
    oneLayerButtons: Button[] = [];//クエスト詳細ボタン
    twoLayerWindows: TextWindow[] = [];//第２層のウィンドウ
    twoLayerNameTexts: MyText[] = [];//依頼者の名前を入れるテキスト
    twoLayerFlavorTexts: MyText[] = [];//依頼のフレーバーテキスト
    twoLayerNeedItemIcons: Item[] = [];//必要アイテムのアイコン
    twoLayerNeedItemTexts: MyText[] = [];//必要アイテムのテキスト
    twoLayerRewordItemIcons: Item[][] = [];//報酬アイテムのアイコン
    twoLayerRewordItemTexts: MyText[] = [];//報酬アイテムのテキスト
    constructor(ship: Ship) {
        super(PIXI.Loader.shared.resources.window.texture);
        for (let i = 0; i < this.max; i++)this.twoLayerRewordItemIcons.push(new Array(0));
        this.interactive = true;
        this.sortableChildren = true;
        this.zIndex = 100;//最前面表示
        this.alpha = 1;
        //戻るボタン作成
        this.backButton = Room.makeBackButton(0, 0, this);
        //「クエスト一覧」テキスト作成
        this.addChild(new MyText("クエスト一覧", 100, 0, 1, 32, 32, 0x333333));
        //クエストタイトルテキスト作成
        this.oneLayerTitleText = new MyText("", 20, 37, 1, 24, 35, 0x333333);
        this.addChild(this.oneLayerTitleText);
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
            const twoLayerFlavorText = new MyText("", 20, 64, 1, 20, 22, 0x333333);
            this.twoLayerWindows[i].addChild(twoLayerFlavorText);
            this.twoLayerFlavorTexts.push(twoLayerFlavorText);
            //必要なアイテムテキスト
            this.twoLayerWindows[i].addChild(new MyText("必要なアイテム", 20, 200, 1, 24, 32, 0x3333dd));
            //必要なアイテムアイコン
            this.twoLayerNeedItemIcons.push(Room.makeDisplayItem(35, 200 + 48, 0, this.twoLayerWindows[i], false));
            //必要なアイテム数表示テキスト
            this.twoLayerNeedItemTexts.push(new MyText("", 55, 235, 1, 24, 32, 0x333333));
            this.twoLayerWindows[i].addChild(this.twoLayerNeedItemTexts[i]);
            //報酬テキスト
            this.twoLayerWindows[i].addChild(new MyText("報酬", 20, 200 + 64, 1, 24, 32, 0xdd3333));
            //報酬アイテムアイコン
            for (let j = 0; j < 3; j++) {
                this.twoLayerRewordItemIcons[i].push(Room.makeDisplayItem(35, 310 + 32 * j, 0, this.twoLayerWindows[i], false));
            }
            //報酬アイテムテキスト
            this.twoLayerRewordItemTexts.push(new MyText("", 55, 295, 1, 24, 32, 0x333333));
            this.twoLayerWindows[i].addChild(this.twoLayerRewordItemTexts[i]);
            //詳細ボタン
            const detailsButton = new Button("詳細", 50, 32, 330, 35 * (i + 1), 0, 0x3333dd, 24, 1,true);
            detailsButton.on("pointertap", () => {//SE
                PIXI.Loader.shared.resources.open.sound.play();
                this.twoLayerWindows[i].visible = true;//入れ子ウィンドウを表示
                this.twoLayerNameTexts[i].setText("依頼主:" + Quest.questInfo[this.quests[i]].name);//依頼主テキスト設定
                this.twoLayerFlavorTexts[i].setText(Quest.questInfo[this.quests[i]].detail);//フレーバーテキスト設定
                Item.changeItem(this.twoLayerNeedItemIcons[i], Quest.questInfo[this.quests[i]].needItemList.id);//必要アイテムアイコン設定
                for (let j = 0; j < 3; j++) {
                    if (Quest.questInfo[this.quests[i]].rewordItemList.length > j) {
                        Item.changeItem(this.twoLayerRewordItemIcons[i][j], Quest.questInfo[this.quests[i]].rewordItemList[j].id);
                    } else {
                        Item.changeItem(this.twoLayerRewordItemIcons[i][j], 0);
                    }
                }
            });
            this.addChild(detailsButton);
            this.oneLayerButtons.push(detailsButton);
            //納品ボタン
            const deliButton = new Button("納品", 200, 50, 100, 500, 1, 0x3333dd, 24, 1,true);
            deliButton.on("pointertap", () => {
                const needItemList = Quest.questInfo[this.quests[i]].needItemList;
                const rewordItemList = Quest.questInfo[this.quests[i]].rewordItemList;
                if (Room.countItemNum(ship, needItemList.id, false) >= needItemList.num) {//指定アイテムがあるSE
                    PIXI.Loader.shared.resources.open.sound.play();
                    //アイテム納品処理
                    for (let j = 0; j < needItemList.num; j++) {
                        const warehouse = Room.findItemFromWarehouse(ship, needItemList.id);
                        const listID = Room.judgeHavingItem(warehouse.itemlist, needItemList.id, 1);
                        warehouse.itemlist[listID].num--;
                    }
                    //アイテム入手処理
                    for (let j = 0; j < rewordItemList.length; j++) {
                        Ship.makeItem(ship, 175 + Math.random() * 50, 175 + Math.random() * 50, rewordItemList[j].id, rewordItemList[j].num, 'made');
                    }
                    this.quests.splice(i, 1);
                    this.setQuestList(this.quests);
                    this.twoLayerWindows[i].visible = false;
                    this.addChild(Button.makeSpeech("クエストクリア！",0xdd3333, 1, ship.w, 30, 0, ship.h / 2, 100, 24, 1));
                } else {//指定アイテムがないSE
                    PIXI.Loader.shared.resources.nSelect.sound.play();
                }
            });
            this.twoLayerWindows[i].addChild(deliButton);
        }
        this.setQuestList([0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
    }
    display(ship: Ship) {
        if (this.visible) {
            for (let i = 0; i < this.max; i++) {
                if (this.twoLayerWindows[i].visible) {
                    this.twoLayerNeedItemTexts[i].setText(Item.itemInfo[Quest.questInfo[this.quests[i]].needItemList.id].name + "(" + Room.countItemNum(ship, Quest.questInfo[this.quests[i]].needItemList.id, false) + ")×" + Quest.questInfo[this.quests[i]].needItemList.num);//必要アイテム数設定
                    let text = "";
                    for (let j = 0; j < 3; j++) {//報酬アイテム数表示
                        if (Quest.questInfo[this.quests[i]].rewordItemList.length > j) {
                            text += Item.itemInfo[Quest.questInfo[this.quests[i]].rewordItemList[j].id].name + "(" + Room.countItemNum(ship, Quest.questInfo[this.quests[i]].rewordItemList[j].id, true) + ")×" + Quest.questInfo[this.quests[i]].rewordItemList[j].num + "\n";
                        }
                    }
                    this.twoLayerRewordItemTexts[i].setText(text);
                }
            }
        }
    }
    setQuestList(quests: number[]) {
        this.quests = quests;
        for (let i = 0; i < this.max; i++) {
            if (i < this.quests.length) this.oneLayerButtons[i].visible = true;
            else this.oneLayerButtons[i].visible = false;
        }
        let titleText = "";//タイトル一覧設定
        for (let i = 0; i < this.quests.length; i++) {
            titleText += Quest.questInfo[this.quests[i]].title + "\n";
        }
        if (this.quests.length == 0) titleText = "今のところ依頼は無いようだ。";
        this.oneLayerTitleText.setText(titleText);
    }
}