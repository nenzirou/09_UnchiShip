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

    }
}