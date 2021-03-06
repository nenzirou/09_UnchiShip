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
    constructor(ship:Ship,x: number, y: number, gamescene: PIXI.Container, state) {
        super(ship,2, x, y, PIXI.Loader.shared.resources.room_warehouse.texture, gamescene, state);
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.oneLayerWindow.contentText.position.set(64, 32);
        //アイテムオブジェクトの配置
        for (let i = 0; i < 15; i++) {
            this.displayItems.push(new Item(32 + 16, (i + 1) * 32 + 16, 0, 1, 'display'));
            this.displayItems[i].interactive = true;
            this.displayItems[i].buttonMode = true;
            this.oneLayerWindow.addChild(this.displayItems[i]);
        }
    }
    move() {
        this.world();
        //建設後の処理
        if (this.build) {
            if (this.oneLayerWindow.visible) {
                this.kind = this.kindLevel * 4;
                if (this.kind >= 15) this.kind = 15;
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
                this.oneLayerWindow.setContentText(text);
                for (let i = 0; i < 15;i++) this.displayItems[i].removeListener("pointertap");
                //タップで捨てる
                for (let i = 0; i < this.itemlist.length; i++){
                    this.displayItems[i].on("pointertap", () => {
                        this.ship.makeItem(this.x, this.y, this.itemlist[i].id, this.itemlist[i].num, 'extracted');
                        this.itemlist.splice(i, 1);
                    })
                }
            }
        }
        //アイテムが無くなったときの処理
        for (let i = 0; i < this.itemlist.length; i++) {
            if (this.itemlist[i].num <= 0) {
                this.itemlist.splice(i, 1);
            }
        }
    }
}