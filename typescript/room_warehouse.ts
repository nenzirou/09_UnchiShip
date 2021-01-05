import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Button } from "./button";
import { Ship } from "./ship";
import { Item } from "./item";
/*
倉庫
*/

export class Room_warehouse extends Room {
    displayItems: Item[] = [];
    constructor(x: number, y: number, gamescene: PIXI.Container, state) {
        super(2, x, y, PIXI.Loader.shared.resources.room_warehouse.texture, gamescene, state);
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.on("pointerdown", () => {
            PIXI.Loader.shared.resources.open.sound.play();
            this.oneLayerWindow.visible = true;
            this.tilePosition.x = 50;
        });
        this.oneLayerBack = Room.makeBackButton(0, 0, this.oneLayerWindow);
        this.oneLayerBack.on("pointerdown", () => {
            this.tilePosition.x = 0;
        })
        this.oneLayerWindow.text.position.set(64, 32);
        for (let i = 0; i < 8; i++) {
            this.displayItems.push(new Item(32 + 16, (i + 1) * 32 + 16, 0, 1, 'display'));
            this.oneLayerWindow.addChild(this.displayItems[i]);
        }
    }
    move(ship: Ship) {
        this.buildRoom(ship);//部屋を立ててくれる関数
        this.gatherNeedItem(ship);//必要なアイテムを自動で集めてくれる関数
        if (this.build) {
            if (this.oneLayerWindow.visible) {
                let text: string = "";
                for (let i = 0; i < this.kind; i++) {
                    // 表示するアイテムのスプライト設定を行う
                    if (this.itemlist.length > i) {
                        Item.changeItem(this.displayItems[i], this.itemlist[i].id);
                    } else {//余ったリストは全部透明スプライトにする
                        Item.changeItem(this.displayItems[i], 0);
                    }
                    // アイテムの格納個数の表示
                    if (i < this.itemlist.length) {
                        text += Item.returnItemName(this.itemlist[i].id) + "×" + this.itemlist[i].num + "\n";
                    } else {
                        text += "空き\n";
                    }
                }
                this.oneLayerWindow.setText(text);
            }
        }
    }
}