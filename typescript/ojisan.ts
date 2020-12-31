import * as PIXI from "pixi.js";
/*
おじさんに持たせる機能
id:おじさんの識別子

*/
export class Ojisan extends PIXI.Sprite {
    background: PIXI.Graphics;
    id: number = 0;
    hp: number = 100;
    satiety: number = 100;
    destiny: number = 0;
    level: number = 0;
    state: string = "STOP";
    constructor(x: number, y: number) {
        super();
        this.x = x;// おじさんのｘ座標
        this.y = y;// おじさんのｙ座標
    }
}