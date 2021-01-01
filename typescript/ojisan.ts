import gsap from "gsap";
import * as PIXI from "pixi.js";
import { Ship } from "./ship";
/*
おじさんに持たせる機能
id:おじさんの識別子
hp:体力
satiety:満腹度
destiny:便意
fatigue:疲労度
*/
export class Ojisan extends PIXI.Sprite {
    background: PIXI.Graphics;
    id: number = 0;
    hp: number = 100;
    satiety: number = 100;
    destiny: number = 0;
    fatigue: number = 0;
    level: number = 0;
    state: string = "STOP";
    cnt: number = 0;
    nextCnt: number = 0;
    tl: TimelineLite;
    constructor(x: number, y: number) {
        super();
        this.anchor.set(0.5);
        this.x = x;// おじさんのｘ座標
        this.y = y;// おじさんのｙ座標
        this.texture = PIXI.Loader.shared.resources.oji.texture;
        this.tl = gsap.timeline();
        this.alpha = 0.8;
    }
    move(ship: Ship, bg: PIXI.Graphics) {
        if (this.x < this.width / 2) this.x = this.width / 2;
        if (this.y < this.height / 2) this.y = this.height / 2;
        if (this.x > bg.width - this.width / 2) this.x = bg.width - this.width / 2;
        if (this.y > bg.height - this.height / 2) this.y = bg.height - this.height / 2;
        if (this.cnt % 300 == this.nextCnt) {
            this.tl.to(this, { during: 2, x: this.x + Math.floor(Math.random() * 30) - 15, y: this.y + Math.floor(Math.random() * 30) - 15});
            this.nextCnt = Math.floor(Math.random() * 150+150);
        }
        this.cnt++;
    }
}