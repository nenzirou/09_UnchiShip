import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Button } from "./button";
import { Ship } from "./ship";
/*
働く場所
*/
export class Room_work extends Room {
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super(x, y, rNx, rNy, PIXI.Loader.shared.resources.room_work.texture, gamescene);
        this.id = "work";
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
    move(ship: Ship) {

    }
}