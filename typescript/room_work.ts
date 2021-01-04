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

    static makableItems: number[] = [1, 2, 3, 4, 5];
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super(4, x, y, PIXI.Loader.shared.resources.room_work.texture, gamescene);
        this.stateText = new MyText(48, 300, 1, 32, 32, 0x333333);
        this.oneLayerWindow.addChild(this.stateText);
        this.stateText.text = this.state;
        //ワークベンチがクリックされたときの挙動
        this.on("pointerup", () => {
            PIXI.Loader.shared.resources.open.sound.play();
            this.visibleMenu();
        });
        // 第１層戻るボタンの設定
        this.oneLayerBack = this.makeBackButton(0, 0, this.oneLayerWindow);//第１層ウィンドウに戻るボタンを追加
        this.oneLayerBack.on("pointerdown", () => {
            Room.changeVisual(this.twoLayerWindows, false);//２層のウィンドウを全て非表示にする
        })
        //必要アイテム
        for (let i = 0; i < 4; i++) {
            this.twoLayerItems.push(Item.makeItem(32 + 16, (i + 2) * 32 + 16, 0));
            this.twoLayerItems[i].zIndex = 100;
            this.oneLayerWindow.addChild(this.twoLayerItems[i]);
        }
        //テキストの設定
        this.oneLayerWindow.buttonText.position.set(64, 32);
        //作成アイテムアイコンの挙動
        for (let i = 0; i < Room_work.makableItems.length; i++) {
            this.oneLayerItems.push(Item.makeItem(32 + 16, (i + 1) * 32 + 16, Room_work.makableItems[i]));
            this.oneLayerItems[i].interactive = true;
            this.oneLayerItems[i].buttonMode = true;
            this.oneLayerWindow.addChild(this.oneLayerItems[i]);
            //入れ子作成ウィンドウ
            let itemWindow = new TextWindow(0, 0, 1, 1, 1, 1);
            itemWindow.visible = false;
            this.oneLayerWindow.addChild(itemWindow);
            this.twoLayerWindows.push(itemWindow);
            let itemlist = Item.itemMakeList[Room_work.makableItems[i]];//[[],[]]型がくる
            //必要素材のスプライト 透明なアイテムスプライト４つを第１層ウィンドウに共有しておいておく　強化ウィンドウを開くと、その４つが素材として表示される
            this.oneLayerItems[i].on("pointerdown", () => {
                //第二層ウィンドウ表示
                PIXI.Loader.shared.resources.open.sound.play();
                this.twoLayerWindows[i].visible = true;
                for (let j = 0; j < itemlist.length; j++) {
                    Item.changeItem(this.twoLayerItems[j], itemlist[j][0]);
                    this.twoLayerItems[j].visible = true;
                }
            });
            //第２層戻るボタンの設定
            this.twoLayerBacks.push(this.makeBackButton(50, 0, this.twoLayerWindows[i]));
            //作成ボタンの挙動
            let making = new Button("作成", 100, 50, this.oneLayerWindow.width / 2, 400, 2, 0x333333);
            making.on("pointertap", () => {
                if (this.state === 'free') {
                    PIXI.Loader.shared.resources.close.sound.play();
                    this.twoLayerWindows[i].visible = false;//第２層のウィンドウを閉じる
                    for (let j = 0; j < this.twoLayerItems.length; j++) {
                        Item.changeItem(this.twoLayerItems[j], 0);
                    }
                    this.make(this.oneLayerItems[i].id);
                }
            });
            this.twoLayerWindows[i].addChild(making);
        }
    }
    move(ship: Ship) {
        //テキスト更新
        if (this.oneLayerWindow.visible) {
            this.stateText.text = "" + this.state;
            let text = '';
            for (let i = 0; i < Room_work.makableItems.length; i++) {
                text += Item.itemList[Room_work.makableItems[i]] + '(' + Room.countItemNum(Ship.warehouses, Room_work.makableItems[i]) + ')を作成\n';
            }
            this.oneLayerWindow.setText(text);
        }
        for (let i = 0; i < this.twoLayerWindows.length; i++) {
            if (this.twoLayerWindows[i].visible) {
                let itemlist = Item.itemMakeList[Room_work.makableItems[i]];//[[],[]]型がくる
                //必要素材の必要数を表示するテキストを設定
                let needItemText = "必要素材\n";
                for (let j = 0; j < itemlist.length; j++) {
                    needItemText += "　 " + Item.itemList[itemlist[j][0]] + "×" + itemlist[j][1] + "(" + Room.countItemNum(Ship.warehouses, itemlist[j][0]) + ")\n";
                }
                this.twoLayerWindows[i].setText(needItemText);
            }
        }
        //アイテム作成処理
        if (this.makingItem != 0) {
            if (this.cnt % 300 == 0) {
                for (let i = 0; i < this.needItems.length; i++) {
                    Room.gatherItem(ship, this, this.needItems[i]);
                }
            }
            //アイテムが揃ったらアイテム作成開始
            if (this.needItems.length == 0 && this.state === 'gathering') {
                //アイテムがRoomの倉庫に揃っているかどうかを調べる
                let needItemlist = Item.itemMakeList[this.makingItem];//[[],[]]型がくる
                let judge: boolean = true;
                for (let i = 0; i < needItemlist.length; i++) {
                    if (!Room.judgeHavingItem(this.itemlist, needItemlist[i][0], needItemlist[i][1])) judge = false;
                }
                if (true) {
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
                                this.makeCnt = 60 * 20;
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
                    ship.makeItem(ship, this.x, this.y, this.makingItem, 1, 'made');
                    if (this.loop) {
                        this.make(this.makingItem);
                    } else {
                        this.makingItem = 0;
                    }
                }
                this.makeCnt--;
            }
        }
        this.cnt++;
    }
    make(id: number) {
        if (this.state === 'free') {
            this.state = 'gathering';//アイテム収集開始
            this.makingItem = id;
            this.needItems = Room.listOfItemToNeedList(Item.itemMakeList[this.makingItem]);//必要リストに素材を追加
            this.cnt = 0;
        }
    }
}