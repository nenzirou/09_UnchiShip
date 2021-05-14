import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Ship } from "./ship";
/*
エンジンルーム
*/
export class Room_engine extends Room {
    constructor(ship:Ship,x: number, y: number, gamescene: PIXI.Container, state) {
        super(ship,5, x, y, PIXI.Loader.shared.resources.room_engine.texture, gamescene, state);
    }
    move() {
        this.world();
    }
}