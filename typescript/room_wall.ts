import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Ship } from "./ship";
/*
壁
*/
export class Room_wall extends Room {
    constructor(x: number, y: number, gamescene: PIXI.Container) {
        super(0, x, y, PIXI.Loader.shared.resources.room_wall.texture, gamescene);
    }
    move(ship: Ship) {

    }
}