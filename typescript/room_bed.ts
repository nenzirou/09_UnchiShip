import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Ship } from "./ship";
/*
ベッドルーム
*/
export class Room_bed extends Room {
    constructor(ship:Ship,x: number, y: number, gamescene: PIXI.Container, state) {
        super(ship,3, x, y, PIXI.Loader.shared.resources.room_bed.texture, gamescene, state);
    }
    move() {
        this.world();
        if (this.build) {
            if (this.ojiID.length < this.ojiMax) {
                this.state = 'free';
            }
            // アニメーション
            this.tilePosition.y = -this.ojiID.length * 50;
            if (this.cnt % 60 == 0) {
                this.tilePosition.x = (this.tilePosition.x + 50) % 100;
            }
        }
    }
}