import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Room_wall } from "./room_wall";
import { Room_aisle } from "./room_aisle";
import { Ojisan } from "./ojisan";
/*
shipに持たせる機能
船の全体像
componentsに各部屋のクラスを保存する
*/
export class Ship extends PIXI.Container {
    background: PIXI.Graphics;
    rooms: Room[][] = new Array();
    ojis: Ojisan[] = new Array();
    cnt: number = 0;
    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.x = x;// 船全体のｘ座標
        this.y = y;// 船全体のｙ座標
        this.width = width;
        this.height = height;
        this.background = new PIXI.Graphics(); // 船の背景となるオブジェクト
        this.background.beginFill(0xdddddd); // 色指定
        this.background.drawRect(0, 0, width, height); // 位置(0,0)を左上にして、width,heghtの四角形を描画
        this.background.endFill(); // 描画完了
        this.addChild(this.background); // 背景を船に適用
        for (let i = 0; i < 12; i++) {
            this.rooms[i] = new Array();
            for (let j = 0; j < 8; j++) {
                let room = new Room_aisle(50 * j, 50 * i);
                this.background.addChild(room);
                this.rooms[i].push(room);
            }
        }
        for (let i = 0; i < 2; i++) {
            let oji = new Ojisan(Math.random() * width, Math.random() * height);
            this.addChild(oji);
            this.ojis.push(oji);
        }
        this.scale.set(0.8, 0.8);
    }
    move() {
        this.cnt++;
        //this.scale.set(0.5 + this.cnt % 100 / 200, 0.5 + this.cnt % 100 / 200);
        this.x = Math.sin(this.cnt / 300) * 20 + 20;
        this.y = Math.cos(this.cnt / 300) * 20 + 20;
        for (let i = 0; i < this.ojis.length; i++) {
            this.ojis[i].move(this,this.background);
        }
    }
}