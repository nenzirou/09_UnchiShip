import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Button } from "./button"; // ボタン生成関数をインポート
import { Ship } from "./ship";
/*
倉庫
*/

export class Room_warehouse extends Room {
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super(x, y, rNx, rNy, PIXI.Loader.shared.resources.box.texture, gamescene);
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
        this.window.addChild(this.back);
    }
    move(ship:Ship) {
        let text: string = "";
        for (let i = 0; i < this.kind; i++) {
            if (i < this.itemlist.length) {
                text += this.itemlist[i].id + "が" + this.itemlist[i].num + "個あります。\n";
            } else {
                text += "空き\n";
            }
        }
        this.window.setText(text);
    }
}