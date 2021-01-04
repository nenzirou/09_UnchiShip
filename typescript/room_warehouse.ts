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
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super(2,x, y, PIXI.Loader.shared.resources.room_warehouse.texture, gamescene);
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.on("pointerdown", () => {
            PIXI.Loader.shared.resources.open.sound.play();
            this.visibleMenu();
            this.tilePosition.x = 50;
        });
        this.oneLayerBack = new Button("戻る", 50, 30, 0, 0, 10, 0xcccccc);
        this.oneLayerBack.on("pointerdown", () => {
            PIXI.Loader.shared.resources.close.sound.play();
            this.oneLayerWindow.visible = false;
            this.tilePosition.x = 0;
        })
        this.oneLayerWindow.buttonText.position.set(64, 32);
        this.oneLayerWindow.addChild(this.oneLayerBack);
        for (let i = 0; i < 8; i++) {
            this.displayItems.push(Item.makeItem(32 + 16, (i + 1) * 32 + 16, 0));
            this.oneLayerWindow.addChild(this.displayItems[i]);
        }
    }
    move(ship: Ship) {
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