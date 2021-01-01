import * as PIXI from "pixi.js";
import { Ship } from "./ship";
import { Ojisan } from "./ojisan";
import { Room_warehouse } from "./room_warehouse";
import { Room } from "./room";
/*
itemに持たせる機能
id

*/
type stringInOut = 'in' | 'out' | 'transport' | 'garbage';
export class Item extends PIXI.TilingSprite {
    cnt: number = 0;
    id: number = 0;
    state: stringInOut = 'in';
    constructor(x: number, y: number, id: number, state: stringInOut) {
        super(PIXI.Loader.shared.resources.item.texture, 32, 32);
        this.x = x;
        this.y = y;
        this.anchor.set(0.5);
        this.id = id;
        this.tilePosition.x = id * 32;
        this.state = state;
    }
    move(ship: Ship) {
        if (this.state === 'out') {
            this.y += 70;
            if (this.y >= 250) {
                this.state = 'in';
                this.cnt = 0;
                this.x = Math.floor(Math.random() * (ship.w - this.width));
                this.y = Math.floor(Math.random() * (ship.h - this.height));
            }
        } else if (this.state === 'in') {
            if (this.cnt % 300 == 1 && ship.freeOjis.length != 0) {
                let warehouse = this.findSameItemWarehouse(ship, this.id);
                if (warehouse === undefined) warehouse = this.findEmptyWarehouse(ship);
                // 倉庫が見つけられた時の処理
                if (warehouse !== undefined) {
                    //一番近くにいるフリーおじさんを探し、そのおじさんに倉庫までアイテムを運ばせる
                    let min: number = this.len(ship.freeOjis[0].x, ship.freeOjis[0].y);
                    let ojiN: number = 0;
                    for (let i = 1; i < ship.freeOjis.length; i++) {
                        let len = this.len(ship.freeOjis[i].x, ship.freeOjis[i].y);
                        if (min > len) {
                            min = len;
                            ojiN = i;
                        }
                    }
                    let oji: Ojisan = ship.freeOjis[ojiN];
                    oji.state = 'transport';
                    oji.tl
                        .to(oji, { duration: /*min / (0.2 * min + 15)*/0.6, x: this.x, y: this.y })
                        .call(this.stick, [ship, this, oji])
                        .to(oji, { duration: /*this.len(warehouse.x, warehouse.y) / (0.2 * this.len(warehouse.x, warehouse.y) + 15)*/0.6, x: warehouse.x, y: warehouse.y })
                        .call(this.putItem, [warehouse, this, oji, ship]);
                    ship.freeOjis.splice(ojiN, 1);
                }
            }
        }
        this.cnt++;
    }
    //おじさんとアイテムの距離を測る
    len(x: number, y: number) {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    }
    // おじさんとアイテムをくっつける
    stick(ship: Ship, item: Item, oji: Ojisan) {
        ship.removeChild(item);
        oji.addChild(item);
        item.x = 0;
        item.y = 0;
        item.state = "transport";
        item.scale.set(0.8);
    }
    // 指定したidと同じアイテムが格納されていて且つその空きがある倉庫を探す
    findSameItemWarehouse(ship: Ship, id: number) {
        let warehouse: Room_warehouse;
        // 既に同じアイテムが倉庫に格納されていて、空きがある場合を探す
        for (let i = 0; i < ship.rooms.length; i++) {
            if (ship.rooms[i].id === 'warehouse') {// 倉庫があった場合
                for (let j = 0; j < ship.rooms[i].itemlist.length; j++) {// アイテムが格納できるかどうか調べる
                    if (ship.rooms[i].itemlist[j].id == id) {
                        warehouse = ship.rooms[i];
                        break;
                    }
                }
            }
            if (warehouse !== undefined) break;
        }
        return warehouse;
    }
    // 空きのある倉庫を探す
    findEmptyWarehouse(ship: Ship) {
        let warehouse: Room_warehouse;
        for (let i = 0; i < ship.rooms.length; i++) {
            if (ship.rooms[i].id === 'warehouse' && ship.rooms[i].itemlist.length < ship.rooms[i].kind) {// 倉庫があり、空きがある場合
                warehouse = ship.rooms[i];
                break;
            }
        }
        return warehouse;
    }
    //アイテムを格納する関数
    putItem(warehouse: Room_warehouse, item: Item, oji: Ojisan, ship: Ship) {
        let ok = false;
        for (let i = 0; i < warehouse.itemlist.length; i++) {
            if (warehouse.itemlist[i].id == item.id) {
                warehouse.itemlist[i].num++;
                ok = true;
                item.removeItem();
                oji.state = 'free';
                break;
            }
        }
        if (!ok) {
            if (warehouse.itemlist.length < warehouse.kind) {
                warehouse.pushItemlist(item.id);
                item.removeItem();
                oji.state = 'free';
            } else {
                item.popItem(ship, oji);
            }
        }
    }
    // アイテムの削除
    removeItem() {
        this.parent.removeChild(this);
        this.state = 'garbage';
    }
    // アイテムを地面に落とす
    popItem(ship: Ship, oji: Ojisan) {
        this.scale.set(1);
        this.state = 'in';
        this.x = Math.floor(Math.random() * ship.w);
        this.y = Math.floor(Math.random() * ship.h);
        oji.removeChild(this);
        ship.addChild(this);
        oji.state = 'free';
    }
}