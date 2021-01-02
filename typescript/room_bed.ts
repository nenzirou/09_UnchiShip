import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Ship } from "./ship";
/*
ベッドルーム
*/
export class Room_bed extends Room {
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super(x, y, rNx, rNy,PIXI.Loader.shared.resources.room_bed.texture, gamescene);
        this.id = "bed";
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
    }
    move(ship: Ship) {
        if(this.cnt%100==0)this.gatherItem(ship, 2);
        this.cnt++;
    }
}