import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Room_wall } from "./room_wall";
import { Room_aisle } from "./room_aisle";
import { Room_warehouse } from "./room_warehouse";
import { Room_work } from "./room_work";
import { Room_bed } from "./room_bed";
import { Ojisan } from "./ojisan";
import { Item } from "./item";
import { Button } from "./button";
/*
shipに持たせる機能
船の全体像
componentsに各部屋のクラスを保存する
*/
export class Ship extends PIXI.Container {
    rooms: Room[] = new Array();
    warehouses: Room[] = new Array();
    ojis: Ojisan[] = new Array();
    freeOjis: Ojisan[] = new Array();
    items: Item[] = new Array();
    cnt: number = 0;
    w: number;
    h: number;
    static menu: boolean = false;
    gamescene: PIXI.Container;
    initialRoom: number[][] = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 3, 3, 3, 3, 3, 3, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 4, 4, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 2, 2, 2, 2, 2, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    constructor(x: number, y: number, width: number, height: number, gamescene: PIXI.Container) {
        super();
        this.x = x;// 船全体のｘ座標
        this.y = y;// 船全体のｙ座標
        this.w = width;
        this.h = height;
        this.gamescene = gamescene;
        this.sortableChildren = true;
        // 船の部屋生成
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 8; j++) {
                let room: Room;
                switch (this.initialRoom[i][j]) {
                    case 0: {
                        room = new Room_wall(j * 50 + 25, i * 50 + 25, j, i, gamescene); break;
                    }
                    case 1: {
                        room = new Room_aisle(j * 50 + 25, i * 50 + 25, j, i, gamescene); break;
                    }
                    case 2: {
                        room = new Room_warehouse(j * 50 + 25, i * 50 + 25, j, i, gamescene); break;
                    }
                    case 3: {
                        room = new Room_bed(j * 50 + 25, i * 50 + 25, j, i, gamescene); break;
                    }
                    case 4: {
                        room = new Room_work(j * 50 + 25, i * 50 + 25, j, i, gamescene); break;
                    }
                }
                this.addChild(room);
                this.rooms.push(room);
            }
        }
        // おじさん生成
        for (let i = 0; i < 100; i++) {
            let oji = new Ojisan(Math.random() * width, Math.random() * height);
            this.addChild(oji);
            this.ojis.push(oji);
        }
        //this.scale.set(0.8, 0.8);
        // let buntton = new Button("a", 50, 50, 0, 0, 0, 0x444444);
        // buntton.on("pointertap", () => {
        //     console.log("a");
        // });
        // this.addChild(buntton);
    }
    move(app: PIXI.Application) {
        //フリーなおじさんリストを作成する
        for (let i = 0; i < this.ojis.length; i++) {
            if (this.ojis[i].state === 'free') {
                this.freeOjis.push(this.ojis[i]);
            }
        }
        //倉庫リストを作成する
        for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id === 'warehouse') {
                this.warehouses.push(this.rooms[i]);
            }
        }
        // アイテムを生成する
        if (this.cnt % 100 == 0) {
            this.makeItem(this, this.w, -100, Math.floor(Math.random() * 5) + 1, 12, 'out');
        }
        if (this.cnt == 0) {
            this.makeItem(this, this.w, -100, 1, 105, 'out');
            this.makeItem(this, this.w, -100, 1, 3, 'out');
            this.makeItem(this, this.w, -100, 2, 3, 'out');
            this.makeItem(this, this.w, -100, 2, 4, 'out');
            this.makeItem(this, this.w, -100, 2, 5, 'out');
            this.makeItem(this, this.w, -100, 5, 6, 'out');
        }
        //this.scale.set(0.5 + this.cnt % 500 / 1000, 0.5 + this.cnt % 500 / 1000);
        //this.x = Math.sin(this.cnt / 300) * 20 + 20;
        //this.y = Math.cos(this.cnt / 300) * 20 + 20;
        // アイテムの動作を行う
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].move(this);
            if (this.items[i].state === 'garbage') {
                this.items[i].parent.removeChild(this.items[i]);
                this.items.splice(i, 1);
                i--;
            }
        }
        // ステージの動作を行う
        for (let i = 0; i < this.rooms.length; i++) {
            this.rooms[i].move(this);
        }
        // おじさんの動作を行う
        for (let i = 0; i < this.ojis.length; i++) {
            this.ojis[i].move(this);
            if (this.ojis[i].hp <= 0) {
                this.ojis[i].parent.removeChild(this.ojis[i]);
                this.ojis.splice(i, 1);
                i--;
            }
        }
        //デバッグ用
        if (this.cnt % 60 == 0) {
            let cX = app.renderer.plugins.interaction.mouse.global.x;
            let cY = app.renderer.plugins.interaction.mouse.global.y;
            if (cX > 0 && cY > 0) {
                for (let i = 0; i < this.freeOjis.length; i++) {
                    if (this.freeOjis[i].state === 'free') {
                        this.freeOjis[i].tl.clear();
                        this.freeOjis[i].tl.to(this.freeOjis[i], { duration: 1, x: cX, y: cY });
                    }
                }
            }
        }
        this.freeOjis = [];
        this.warehouses = [];
        this.cnt++;
    }
    makeItem(ship: Ship, x: number, y: number, id: number, num: number, state) {
        let item = new Item(x, y, id, num, state);
        if (item.num > item.max) item.num = item.max;
        ship.addChild(item);
        ship.items.push(item);
    }
}