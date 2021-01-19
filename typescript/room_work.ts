import * as PIXI from "pixi.js";
import { itemList, Room } from "./room";
import { Button } from "./button";
import { Ship } from "./ship";
import { Item } from "./item";
import { TextWindow } from "./window";
import { MyText } from "./myText";
/*
働く場所
*/
interface makeItemInfo {
    id: number;
    need: itemList[];
    num: number;
}
export class Room_work extends Room {
    static makableItems: makeItemInfo[] = [
        { id: 1, need: [], num: 1 },
        { id: 2, need: [], num: 3 },
    ];
    constructor(x: number, y: number, gamescene: PIXI.Container, state) {
        super(4, x, y, PIXI.Loader.shared.resources.room_work.texture, gamescene, state);
        //状態表示テキストの設定 デバッグ用
        this.stateText = new MyText("", 100, 0, 1, 32, 32, 0x333333);
        this.oneLayerWindow.addChild(this.stateText);
        this.stateText.text = this.state;
        //部屋がクリックされたときの処理
        this.on("pointerup", () => {
            PIXI.Loader.shared.resources.open.sound.play();
            this.oneLayerWindow.visible = true;
        });
        // 第１層戻るボタンの設定
        this.oneLayerBack = Room.makeBackButton(0, 0, this.oneLayerWindow);//第１層ウィンドウに戻るボタンを追加
        this.oneLayerBack.on("pointerdown", () => {
            Room.changeVisual(this.twoLayerWindows, false);//２層のウィンドウを全て非表示にする
        })
        //第１ウィンドウのテキスト位置の設定
        this.oneLayerWindow.text.position.set(64, 32);
        //作成アイテムアイコンの挙動
        for (let i = 0; i < Room_work.makableItems.length; i++) {
            //第1層アイテムの設定
            this.oneLayerItems.push(Room.makeDisplayItem(32 + 16, (i + 1) * 32 + 16, Room_work.makableItems[i].id, this.oneLayerWindow, true));
            //第2層ウィンドウの設定
            let itemWindow = new TextWindow(0, 0, 1, 1, 1, 1, false);
            this.oneLayerWindow.addChild(itemWindow);
            this.twoLayerWindows.push(itemWindow);
            const itemlist: itemList[] = Room_work.makableItems[i].need;//itemlist[]型がくる
            //第2層アイテムの設定
            for (let j = 0; j < itemlist.length; j++) {
                this.twoLayerItems.push(Room.makeDisplayItem(32 + 16, (j + 2) * 32 + 16, itemlist[j].id, this.twoLayerWindows[i], true));
            }
            //第1層アイテムの挙動
            this.oneLayerItems[i].on("pointerup", () => {
                //第2層ウィンドウ表示
                PIXI.Loader.shared.resources.open.sound.play();
                this.twoLayerWindows[i].visible = true;
            });
            //第２層戻るボタンの設定
            this.twoLayerBacks.push(Room.makeBackButton(50, 0, this.twoLayerWindows[i]));
            //作成ボタンの挙動
            let makingButton = new Button("作成", 100, 50, 32, 400, 2, 0x333333, 26, 1, true);
            makingButton.on("pointerup", () => {
                if (this.state === 'free') {
                    PIXI.Loader.shared.resources.close.sound.play();
                    this.twoLayerWindows[i].visible = false;//第２層のウィンドウを閉じる
                    this.startMakeItem(this.oneLayerItems[i].id);
                }
            });
            this.twoLayerWindows[i].addChild(makingButton);
        }
    }
    move(ship: Ship) {
        this.buildRoom(ship);//部屋を立ててくれる関数
        this.gatherNeedItem(ship);//必要なアイテムを自動で集めてくれる関数
        if (this.build) {
            //テキスト更新
            if (this.oneLayerWindow.visible) {//第1層テキスト更新
                this.stateText.text = "" + this.state;
                let text: string = '';
                for (let i = 0; i < Room_work.makableItems.length; i++) {
                    text += Item.itemInfo[Room_work.makableItems[i].id].name + '(' + Room.countItemNum(ship, Room_work.makableItems[i].id, true) + ')\n';
                }
                this.oneLayerWindow.setText(text);
            }
            for (let i = 0; i < this.twoLayerWindows.length; i++) {//第2層テキスト更新
                if (this.twoLayerWindows[i].visible) {
                    const itemlist: itemList[] = Room_work.makableItems[i].need;//[[],[]]型がくる
                    //必要素材の必要数を表示するテキストを設定
                    let needItemText = "必要素材\n";
                    for (let j = 0; j < itemlist.length; j++) {
                        needItemText += "　 " + Item.itemInfo[itemlist[j].id].name + "×" + itemlist[j].num + "(" + Room.countItemNum(ship, itemlist[j].id, true) + ")\n";
                    }
                    this.twoLayerWindows[i].setText(needItemText);
                }
            }
            //アイテム作成処理
            if (this.makingItem != 0) {
                //アイテムが揃ったらアイテム作成開始
                if (this.needItems.length == 0 && this.state === 'gathering') {
                    const result = Room_work.makableItems.find((v) => v.id === this.makingItem);
                    if (Room.judgeFullList(result.need, this.itemlist)) {//欲しいアイテムがRoomのItemListに揃っている場合
                        let oji = Room.findNearFreeOji(ship, this.x, this.y);//近くのフリーおじさんを見つける
                        if (oji !== undefined) {//フリーおじさんがいた場合
                            this.state = 'preparation';
                            oji.state = 'working';
                            oji.tl
                                .to(oji, { duration: Room.len(oji.x, oji.y, this.x, this.y) / oji.speed + 0.01, x: this.x, y: this.y })
                                .call(() => {
                                    oji.visible = false;
                                    this.ojiID.push(oji.id);
                                    this.state = 'using'
                                    this.itemlist = [];
                                    this.makeCnt = 60 * 10;
                                });
                        }
                    }
                } else if (this.state === 'using') {
                    if (this.makeCnt % 60 == 0) {
                        this.tilePosition.x = (this.tilePosition.x + 50) % 150;
                        if (this.tilePosition.x == 0) this.tilePosition.x += 50;
                    }
                    if (this.makeCnt <= 0) {
                        this.tilePosition.x = 0;
                        this.state = 'free';
                        Room.allFreeOji(ship.ojis, this.ojiID);
                        this.ojiID = [];
                        Ship.makeItem(ship, this.x, this.y, this.makingItem, 1, 'made');
                        if (this.loop) {
                            this.startMakeItem(this.makingItem);
                        } else {
                            this.makingItem = 0;
                        }
                    }
                    this.makeCnt--;
                }
            }
        }
    }
    startMakeItem(id: number) {
        if (this.state === 'free') {
            this.state = 'gathering';//アイテム収集開始
            this.makingItem = id;
            const result = Room_work.makableItems.find((v) => v.id === this.makingItem);
            this.needItems = Room.listOfItemToNeedList(result.need);//必要リストに素材を追加
            this.cnt = 0;
        }
    }
}