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
        super(x, y, rNx, rNy, PIXI.Loader.shared.resources.room_warehouse.texture, gamescene);
        this.id = "warehouse";
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.on("pointerdown", () => {
            PIXI.Loader.shared.resources.open.sound.play();
            this.visibleMenu();
            this.tilePosition.x = 50;
        });
        this.back = new Button("戻る", 50, 30, 0, 0, 10, 0xcccccc);
        this.back.on("pointerdown", () => {
            PIXI.Loader.shared.resources.close.sound.play();
            this.window.visible = false;
            this.tilePosition.x = 0;
        })
        this.window.buttonText.position.set(64, 32);
        this.window.addChild(this.back);
        for (let i = 0; i < 8; i++) {
            this.displayItems.push(Item.makeItem(32 + 16, (i + 1) * 32 + 16, 0));
            this.window.addChild(this.displayItems[i]);
        }
    }
    move(ship: Ship) {
        let text: string = "";
        for (let i = 0; i < this.kind; i++) {
            // 表示するアイテムのスプライト設定を行う
            if (this.itemlist.length > i) {
                Item.changeItem(this.displayItems[i], this.itemlist[i].id);
            } else {
                Item.changeItem(this.displayItems[i], 0);
            }
            // アイテムの格納個数の表示
            if (i < this.itemlist.length) {
                text += Item.returnItemName(this.itemlist[i].id)+"×" + this.itemlist[i].num + "\n";
            } else {
                text += "空き\n";
            }
        }
        this.window.setText(text);
    }
}