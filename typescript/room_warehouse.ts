import * as PIXI from "pixi.js";
import { Room } from "./room";
import { createButton } from "./create_button"; // ボタン生成関数をインポート
/*
倉庫
*/

export class Room_warehouse extends Room {
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super(x, y, rNx, rNy, gamescene);
        this.id = "warehouse";
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.texture = PIXI.Loader.shared.resources.box.texture;
        this.on("pointerdown", () => {
            PIXI.Loader.shared.resources.hit.sound.play();
            this.visibleMenu();
        });
        this.back = createButton("戻る", 50, 30, 0, 0, 10, 0xcccccc, this.invisibleMenu);
        this.window.addChild(this.back);
    }
    move() {
        let text: string = "";
        for (let i = 0; i < this.kind; i++) {
            if (i < this.itemlist.length) {
                text += this.itemlist[i].id+"が"+this.itemlist[i].num+"個あります。\n\n";
            } else {
                text += "空き\n\n";
            }

        }
        this.window.setText(text);
    }
}