import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Ship } from "./ship";
/*
壁
*/
export class Room_aisle extends Room {
    constructor(x: number, y: number, gamescene: PIXI.Container, state) {
        super(1, x, y, PIXI.Loader.shared.resources.room_aisle.texture, gamescene, state);
    }
    move(ship: Ship) {
        this.buildRoom(ship);//部屋を立ててくれる関数
        this.gatherNeedItem(ship);//必要なアイテムを自動で集めてくれる関数
    }
}