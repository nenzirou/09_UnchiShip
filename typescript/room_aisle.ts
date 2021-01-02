import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Ship } from "./ship";
/*
壁
*/
export class Room_aisle extends Room {
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super(x, y, rNx, rNy,PIXI.Loader.shared.resources.room_aisle.texture, gamescene);
        this.id = "aisle";
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
    }
    move(ship:Ship) {

    }
}