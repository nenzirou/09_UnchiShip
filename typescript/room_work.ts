import * as PIXI from "pixi.js";
import { itemList, Room } from "./room";
import { Button } from "./button";
import { Ship } from "./ship";
import { Item } from "./item";
import { BackWindow } from "./backWindow";
/*
素材から加工品を作成する場所
*/

export class Room_work extends Room {
    constructor(ship:Ship,x: number, y: number, gamescene: PIXI.Container, state) {
        super(ship,4, x, y, PIXI.Loader.shared.resources.room_work.texture, gamescene, state);
        this.makableItems = [
            { id: 7, need: [{ id: 6, num: 1 }], num: 1 },
            { id: 8, need: [{ id: 6, num: 1 }], num: 1 },
            { id: 9, need: [{ id: 6, num: 1 }], num: 1 }
        ];
        this.makeItemSlot();
        //第１ウィンドウのテキスト位置の設定
        this.oneLayerWindow.contentText.position.set(64, 32);
        //作成アイテムアイコンの挙動
        for (let i = 0; i < this.makableItems.length; i++) {
            //第1層アイテムの設定
            this.oneLayerItems.push(Room.makeDisplayItem(32 + 16, (i + 1) * 32 + 16, this.makableItems[i].id, this.oneLayerWindow, true));
            //第2層ウィンドウの設定
            let itemWindow = new BackWindow(0, 0, 1, 1, 1, 1, false);
            this.oneLayerWindow.addChild(itemWindow);
            this.twoLayerWindows.push(itemWindow);
            const itemlist: itemList[] = this.makableItems[i].need;//itemlist[]型がくる
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
            //作成ボタンの挙動
            const makingButton = new Button("作成", 100, 50, 32, 400, 2, 0x333333, 26, 1, true);
            makingButton.on("pointerup", () => {
                if (this.makingItem.length >= this.slotLevel) {
                    PIXI.Loader.shared.resources.nSelect.sound.play();
                } else {
                    PIXI.Loader.shared.resources.close.sound.play();
                    this.twoLayerWindows[i].visible = false;//第２層のウィンドウを閉じる
                    this.makingItem.push(this.makableItems[i].id);//作成アイテムリストに追加
                    this.updateMakingItemIcon();
                }
            });
            this.twoLayerWindows[i].addChild(makingButton);
        }
    }
    move() {
        this.world();
        if (this.build) {
            //テキスト更新
            if (this.oneLayerWindow.visible) {//第1層テキスト更新
                let text: string = '';
                for (let i = 0; i < this.makableItems.length; i++) {
                    text += Item.itemInfo[this.makableItems[i].id].name + '(' + this.ship.countItemNum(this.makableItems[i].id, true) + ')\n';
                }
                this.oneLayerWindow.setContentText(text);
                for (let i = 0; i < this.twoLayerWindows.length; i++) {//第2層テキスト更新
                    if (this.twoLayerWindows[i].visible) {
                        const itemlist: itemList[] = this.makableItems[i].need;//[[],[]]型がくる
                        //必要素材の必要数を表示するテキストを設定
                        let needItemText = "必要素材\n";
                        for (let j = 0; j < itemlist.length; j++) {
                            needItemText += "　 " + Item.itemInfo[itemlist[j].id].name + "×" + itemlist[j].num + "(" + this.ship.countItemNum(itemlist[j].id, true) + ")\n";
                        }
                        this.twoLayerWindows[i].setContentText(needItemText);
                    }
                }
            }
        }
    }
}