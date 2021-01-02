import * as PIXI from "pixi.js";
import { Room } from "./room";
/*
壁
*/
export class Room_aisle extends Room {
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super(x, y, rNx, rNy, gamescene);
        this.id = "aisle";
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.texture = PIXI.Loader.shared.resources.room_aisle.texture;
        this.alpha = Math.random();
    }
    move() {

    }
}