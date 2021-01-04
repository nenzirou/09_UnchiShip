import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Ship } from "./ship";
/*
壁
*/
export class Room_aisle extends Room {
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super(1, x, y, PIXI.Loader.shared.resources.room_aisle.texture, gamescene);
    }
    move(ship: Ship) {

    }
}