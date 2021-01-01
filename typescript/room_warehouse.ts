import * as PIXI from "pixi.js";
import { Room } from "./room";
/*
倉庫
*/

export class Room_warehouse extends Room {
    constructor(x: number, y: number, rNx: number, rNy: number) {
        super(x, y, rNx, rNy);
        this.id = "warehouse";
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.texture = PIXI.Loader.shared.resources.room_wall.texture;
    }
}