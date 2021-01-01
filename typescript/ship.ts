import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Room_wall } from "./room_wall";
import { Room_aisle } from "./room_aisle";
import { Room_warehouse } from "./room_warehouse";
import { Ojisan } from "./ojisan";
import { Item } from "./item";
/*
shipに持たせる機能
船の全体像
componentsに各部屋のクラスを保存する
*/
export class Ship extends PIXI.Container {
    rooms: Room[] = new Array();
    ojis: Ojisan[] = new Array();
    freeOjis: Ojisan[] = new Array();
    items: Item[] = new Array();
    cnt: number = 0;
    w: number;
    h: number;
    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.x = x;// 船全体のｘ座標
        this.y = y;// 船全体のｙ座標
        this.w = width;
        this.h = height;
        this.sortableChildren = true;
        // 船の部屋生成
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 8; j++) {
                let room: Room;
                if (j == 4 && (i == 1 || i == 10)) {
                    room = new Room_warehouse(50 * j, 50 * i, j, i);
                } else {
                    room = new Room_aisle(50 * j, 50 * i, j, i);
                }
                this.addChild(room);
                this.rooms.push(room);
            }
        }
        // おじさん生成
        for (let i = 0; i < 50; i++) {
            let oji = new Ojisan(Math.random() * width, Math.random() * height);
            this.addChild(oji);
            this.ojis.push(oji);
        }
        this.scale.set(0.8, 0.8);
    }
    move() {
        //フリーなおじさんリストを作成する
        for (let i = 0; i < this.ojis.length; i++) {
            if (this.ojis[i].state === 'free') {
                this.freeOjis.push(this.ojis[i]);
            }
        }
        // アイテムを生成する
        if (this.cnt % 60 == 0) {
            let item = new Item(this.w, -100, 0, 'out');
            this.addChild(item);
            this.items.push(item);
        }
        //this.scale.set(0.5 + this.cnt % 100 / 200, 0.5 + this.cnt % 100 / 200);
        this.x = Math.sin(this.cnt / 300) * 20 + 20;
        this.y = Math.cos(this.cnt / 300) * 20 + 20;
        // アイテムの動作を行う
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].move(this);
        }
        // おじさんの動作を行う
        for (let i = 0; i < this.ojis.length; i++) {
            this.ojis[i].move(this);
        }
        this.freeOjis = [];
        this.cnt++;
    }
}