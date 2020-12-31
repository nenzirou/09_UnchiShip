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
    id: number = 0;
    level: number = 0;
    state: string = "STOP";
    constructor(x: number, y: number) {
        super();
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
    }
}