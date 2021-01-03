import * as PIXI from "pixi.js";
import { TextWindow } from "./window";
import { Ship } from "./ship";
import { Ojisan } from "./ojisan";
import { Item } from "./item";
import { MyText } from "./text";
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
interface itemList {
    id: number;
    num: number;
}
type stringRoomState = 'free' | 'using' | 'gathering' | 'preparation';
export abstract class Room extends PIXI.TilingSprite {
    window: TextWindow;//テキストウィンドウ
    stateText: MyText;//状態を表示するテキストウィンドウ
    back: PIXI.Container;//ウィンドウの戻るボタン
    kind: number = 4;// 倉庫のアイテムを入れられる種類
    itemlist: itemList[] = [];//この部屋に格納されているアイテムリスト
    id: string;
    level: number = 0;
    state: stringRoomState = "free";
    rNx: number;// 行番号
    rNy: number;// 列番号
    cnt: number = 0;// タイムカウント
    ojiID: number[] = [];//この部屋にいるおじさんのIDリスト
    ojiMax: number = 4;// おじさんを入れられる最大数
    constructor(x: number, y: number, rNx: number, rNy: number, texture: PIXI.Texture, gamescene: PIXI.Container) {
        super(texture, 50, 50);
        this.zIndex = -1;
        this.rNx = rNx;
        this.rNy = rNy;
        this.anchor.set(0.5);
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.window = new TextWindow(0, 0, 1, 1, 1, 0.8);
        this.window.visible = false;
        this.interactive = true;
        this.buttonMode = true;
        gamescene.addChild(this.window);
    }
    pushItemlist(id: number) {
        let tmp: itemList = { id: id, num: 1 };
        this.itemlist.push(tmp);
    }
    invisibleMenu() {
        PIXI.Loader.shared.resources.hit.sound.play();
        this.parent.parent.visible = false;
    }
    visibleMenu() {
        this.window.visible = true;
    }
    static len(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
    static stickItemToOji(oji: Ojisan, id: number) {
        let item = new Item(0, 0, id, 'transporting');
        item.scale.set(Item.size);
        oji.addChild(item);
        oji.childs.push(item);
    }
    static exsistItem(room: Room, id: number) {
        for (let i = 0; i < room.itemlist.length; i++) {
            if (room.itemlist[i].id == id && room.itemlist[i].num > 0) return room.itemlist[i];
        }
    }
    static freeOji(oji: Ojisan) {
        oji.tl.clear();
        oji.state = 'free';
        oji.visible = true;
        for (let i = 0; i < oji.childs.length; i++) {
            oji.removeChild(oji.childs[i]);
        }
        oji.childs = [];
    }
    static findNearFreeOji(ship: Ship, x, y) {
        if (ship.freeOjis.length == 0) return;
        let min = 1000000;
        let oji: Ojisan;
        let id: number = 0;
        for (let i = 0; i < ship.freeOjis.length; i++) {
            let l = Room.len(x, y, ship.freeOjis[i].x, ship.freeOjis[i].y);
            if (l < min) {
                min = l;
                oji = ship.freeOjis[i];
                id = i;
            }
        }
        ship.freeOjis.splice(id, 1);
        return oji;
    }
    gatherItem(ship: Ship, id: number) {
        if (ship.freeOjis.length == 0) return false;
        let warehouse: Room = Room.findItemFromWarehouse(ship, id);
        if (warehouse === undefined) return false;
        let oji = Room.findNearFreeOji(ship, this.x, this.y);
        oji.state = 'transport';
        let ojiToWarehouse = Room.len(oji.x, oji.y, warehouse.x, warehouse.y);
        let warehouseToRoom = Room.len(this.x, this.y, warehouse.x, warehouse.y);
        oji.tl
            .to(oji, { duration: ojiToWarehouse / oji.speed, x: warehouse.x, y: warehouse.y })
            .call(() => {
                let itemlist: itemList = Room.exsistItem(warehouse, id);
                if (itemlist !== undefined) {
                    itemlist.num--;
                    Room.stickItemToOji(oji, id);
                    PIXI.Loader.shared.resources.open.sound.play();
                } else {
                    Room.freeOji(oji);
                }
            })
            .to(oji, { duration: warehouseToRoom / oji.speed, x: this.x, y: this.y })
            .call(() => {
                this.pushItemlist(id);
                Room.freeOji(oji);
            });
        return true;
    }
    static findItemFromWarehouse(ship: Ship, id: number) {
        let warehouse: Room;
        for (let i = 0; i < ship.warehouses.length; i++) {
            for (let j = 0; j < ship.warehouses[i].itemlist.length; j++) {
                if (ship.warehouses[i].itemlist[j].id == id && ship.warehouses[i].itemlist[i].num > 0) {
                    warehouse = ship.warehouses[i];
                    break;
                }
            }
            if (warehouse !== undefined) break;
        }
        return warehouse;
    }
    static findRoom(ship: Ship, id: string, state: stringRoomState) {
        for (let i = 0; i < ship.rooms.length; i++) {
            if (ship.rooms[i].id === id && ship.rooms[i].state === state) {
                return ship.rooms[i];
            }
        }
    }
    static removeOjiFromRoom(oji: Ojisan, room: Room) {
        for (let i = 0; i < room.ojiID.length; i++) {
            if (room.ojiID[i] == oji.id) {
                room.ojiID.splice(i, 1);
            }
        }
    }
    static changeVisual(obj: PIXI.TilingSprite[], visual: boolean) {
        for (let i = 0; i < obj.length; i++) {
            obj[i].visible = visual;
        }
    }
    static judgeHavingItem(list: itemList[], id: number, num: number) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id && list[i].num >= num) {
                return true;
            }
        }
        return false;
    }
    static findOjisan(ojis: Ojisan[], id: number) {
        for (let i = 0; i < ojis.length; i++) {
            if (ojis[i].id == id) return ojis[i];
        }
    }
    //部屋の全てのおじさんをフリーにする
    static allFreeOji(allOjis: Ojisan[], ojiID: number[]) {
        for (let i = 0; i < ojiID.length; i++) {
            let oji = Room.findOjisan(allOjis, ojiID[i]);
            Room.freeOji(oji);
        }
    }
    abstract move(ship: Ship);
}