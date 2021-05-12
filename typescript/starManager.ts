import * as PIXI from "pixi.js";
import { Ship } from "./ship";
import { Star } from "./star";
/*
星を管理する
*/
export class starManager {
    stars: Star[] = [];
    constructor(gamescene: PIXI.Container) {
        for (let i = 0; i < 100; i++) {
            this.stars.push(new Star(Math.random() * 400, Math.random() * 500, -1));
            gamescene.addChild(this.stars[i]);
        }
    }
    move(ship: Ship) {
        if (ship.going) {
            for (let i = 0; i < this.stars.length; i++) {
                this.stars[i].y += this.stars[i].speed;
                if (this.stars[i].y > 600) {
                    this.stars[i].y = -5;
                    this.stars[i].initialize();
                }
            }
        }
    }
}