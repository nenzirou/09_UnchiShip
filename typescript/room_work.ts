import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Button } from "./button";
import { Ship } from "./ship";
import { Item } from "./item";
import { TextWindow } from "./window";
import { MyText } from "./text";
/*
働く場所
*/
export class Room_work extends Room {
    displayItems: Item[] = [];//第１層のアイテムアイコン
    onlyDisplayItems: Item[] = [];//第２層のアイテムアイコン
    childWindows: TextWindow[] = [];//第２層のウィンドウ
    makingItem: number = 0;
    needItems: number[] = [];
    makeCnt: number = 0;
    static makableItems: number[] = [1, 2, 3, 4, 5];
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super(x, y, rNx, rNy, PIXI.Loader.shared.resources.room_work.texture, gamescene);
        this.id = "work";
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.stateText = new MyText(48, 300, 1, 32, 0x333333);
        this.window.addChild(this.stateText);
        this.stateText.text = this.state;
        //ワークベンチがクリックされたときの挙動
        this.on("pointerdown", () => {
            PIXI.Loader.shared.resources.open.sound.play();
            this.visibleMenu();
        });
        // 第１層戻るボタンの挙動
        this.back = new Button("戻る", 50, 30, 0, 0, 2, 0xcccccc);
        this.back.on("pointerdown", () => {
            PIXI.Loader.shared.resources.close.sound.play();
            this.window.visible = false;
            this.tilePosition.x = 0;
            Room.changeVisual(this.childWindows, false);
            for (let i = 0; i < this.onlyDisplayItems.length; i++) {
                Item.changeItem(this.onlyDisplayItems[i], 0);
            }
        })
        this.window.addChild(this.back);
        //必要アイテム
        for (let i = 0; i < 4; i++) {
            this.onlyDisplayItems.push(Item.makeItem(32 + 16, (i + 2) * 32 + 16, 0));
            this.onlyDisplayItems[i].zIndex = 100;
            this.window.addChild(this.onlyDisplayItems[i]);
        }
        //テキストの設定
        this.window.buttonText.position.set(64, 32);
        let text = '';
        //作成アイテムアイコンの挙動
        for (let i = 0; i < Room_work.makableItems.length; i++) {
            text += '<=' + Item.itemList[Room_work.makableItems[i]] + 'を作成\n';
            this.displayItems.push(Item.makeItem(32 + 16, (i + 1) * 32 + 16, Room_work.makableItems[i]));
            this.displayItems[i].interactive = true;
            this.displayItems[i].buttonMode = true;
            this.window.addChild(this.displayItems[i]);
            //入れ子ウィンドウ
            let itemWindow = new TextWindow(0, 0, 1, 1, 1, 1);
            itemWindow.visible = false;
            itemWindow.setText("必要素材\n");
            this.window.addChild(itemWindow);
            this.childWindows.push(itemWindow);
            //作成アイテムの挙動
            this.displayItems[i].on("pointerdown", () => {
                PIXI.Loader.shared.resources.open.sound.play();
                this.childWindows[i].visible = true;
                let itemlist = Item.itemMakeList[Room_work.makableItems[i]];
                for (let i = 0; i < itemlist.length; i++) {
                    Item.changeItem(this.onlyDisplayItems[i], itemlist[i]);
                    this.onlyDisplayItems[i].visible = true;
                }
            });
            //戻るボタンの挙動
            let back = new Button("戻る", 50, 30, 50, 0, 2, 0xcccccc);
            back.on("pointerdown", () => {
                PIXI.Loader.shared.resources.close.sound.play();
                this.childWindows[i].visible = false;
                for (let i = 0; i < this.onlyDisplayItems.length; i++) {
                    Item.changeItem(this.onlyDisplayItems[i], 0);
                }
            });
            this.childWindows[i].addChild(back);
            //作成ボタンの挙動
            let making = new Button("作成", 100, 50, this.window.width / 2, 400, 2, 0x333333);
            making.on("pointertap", () => {
                if (this.state === 'free') {
                    PIXI.Loader.shared.resources.close.sound.play();
                    this.childWindows[i].visible = false;//第２層のウィンドウを閉じる
                    this.state = 'gathering';//アイテム収集開始
                    for (let j = 0; j < this.onlyDisplayItems.length; j++) {
                        Item.changeItem(this.onlyDisplayItems[j], 0);
                    }
                    this.makingItem = this.displayItems[i].id;
                    console.log(this.makingItem);
                    this.needItems = this.needItems.concat(Item.itemMakeList[this.makingItem]);//必要リストに素材を追加
                }
            });
            this.childWindows[i].addChild(making);
        }
        this.window.setText(text);
    }
    move(ship: Ship) {
        this.stateText.text = "" + this.state;
        if (this.makingItem != 0) {
            for (let i = 0; i < this.needItems.length; i++) {
                let judge = this.gatherItem(ship, this.needItems[i]);
                if (judge) {
                    this.needItems.splice(i, 1);
                    i--;
                }
            }
            //アイテムが揃ったらアイテム作成開始
            if (this.needItems.length == 0 && this.state === 'gathering') {

                //近くのフリーおじさんを見つける
                let oji = Room.findNearFreeOji(ship, this.x, this.y);
                if (oji !== undefined) {
                    this.state = 'preparation';
                    oji.state = 'working';
                    oji.tl
                        .to(oji, { duration: Room.len(oji.x, oji.y, this.x, this.y) / oji.speed + 0.01, x: this.x, y: this.y })
                        .call(() => {
                            oji.visible = false;
                            this.ojiID.push(oji.id);
                            this.state = 'using'
                            this.itemlist = [];
                            this.makeCnt = 60 * 5;
                        });
                }
            } else if (this.state === 'using') {
                if (this.makeCnt <= 0) {
                    this.state = 'free';
                    Room.allFreeOji(ship.ojis, this.ojiID);
                    this.ojiID = [];
                    ship.makeItem(ship, this.x, this.y, this.makingItem, 1, 'in');
                    this.makingItem = 0;
                }
                this.makeCnt--;
            }
        }
    }
}