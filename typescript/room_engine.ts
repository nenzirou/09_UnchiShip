import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Ship } from "./ship";
/*
エンジンルーム
*/
export class Room_engine extends Room {
    constructor(x: number, y: number, gamescene: PIXI.Container, state) {
        super(5, x, y, PIXI.Loader.shared.resources.room_engine.texture, gamescene, state);
    }
    move(ship: Ship) {
        this.buildRoom(ship);//部屋を立ててくれる関数
        this.gatherNeedItem(ship);//必要なアイテムを自動で集めてくれる関数
    }
}