import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Ship } from "./ship";
/*
壁
*/
export class Room_aisle extends Room {
    constructor(ship:Ship,x: number, y: number, gamescene: PIXI.Container, state) {
        super(ship,1, x, y, PIXI.Loader.shared.resources.room_aisle.texture, gamescene, state);
    }
    move() {
        this.world();
        this.buttonMode = false;
        this.interactive = false;
    }
}