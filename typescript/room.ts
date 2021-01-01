import * as PIXI from "pixi.js";
/*
roomに持たせる機能
各部屋の基本的機能を詰め込む
部屋ID
部屋レベル
個体リスト
アイテムリスト
状態変数
位置
*/
export class Room extends PIXI.Sprite {
    background: PIXI.Graphics;
    id: string;
    level: number = 0;
    state: string = "STOP";
    rNx: number;
    rNy: number;
    constructor(x: number, y: number, rNx: number, rNy: number) {
        super();
        this.zIndex = -1;
        this.rNx = rNx;
        this.rNy = rNy;
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
    }
}