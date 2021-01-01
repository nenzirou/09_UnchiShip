import * as PIXI from "pixi.js";
import { Room } from "./room";
/*
倉庫
*/
export class Room_warehouse extends Room {
    constructor(x: number, y: number) {
        super(x, y);
        this.id = 12;
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.texture = PIXI.Loader.shared.resources.room_wall.texture;
    }
}