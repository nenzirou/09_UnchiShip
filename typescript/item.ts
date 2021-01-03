import * as PIXI from "pixi.js";
import { Ship } from "./ship";
import { Ojisan } from "./ojisan";
import { Room_warehouse } from "./room_warehouse";
import { Room } from "./room";
import gsap from "gsap";
/*
itemに持たせる機能
id
*/
type stringInOut = 'in' | 'out' | 'reserved' | 'transporting' | 'garbage' | 'display';
export class Item extends PIXI.TilingSprite {
    static itemList = { 0: '無',1:'うんち',2:'粘土' };
    cnt: number = 0;
    id: number = 0;
    state: stringInOut = 'in';
    max: number = 99;
    tl: TimelineMax;
    explanation: string;
    static size: number = 0.6;
    constructor(x: number, y: number, id: number, state: stringInOut) {
        super(PIXI.Loader.shared.resources.item.texture, 32, 32);
        this.x = x;
        this.y = y;
        this.anchor.set(0.5);
        Item.changeItem(this, id);
        this.state = state;
        this.tl = gsap.timeline();
    }
    move(ship: Ship) {
        if (this.state === 'out') {
            this.y += 70;
            if (this.y >= 250) {
                this.state = 'in';
                this.cnt = 0;
                this.x = Math.floor(Math.random() * (ship.w - this.width)) + this.width / 2;
                this.y = Math.floor(Math.random() * (ship.h - this.height)) + this.height / 2;
                this.tl.from(this.scale, { duration: 0.2, x: 0.1, y: 0.1, ease: 'back.out(10)' });
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
                    ship.freeOjis.splice(ojiN, 1);
                    this.state = 'reserved';
                    oji.state = 'transport';
                    oji.tl.clear();
                    oji.tl
                        .to(oji, { duration: min / oji.speed, x: this.x, y: this.y })
                        .call(this.stick, [ship, this, oji])
                        .to(oji, { duration: this.len(warehouse.x, warehouse.y) / oji.speed, x: warehouse.x, y: warehouse.y })
                        .call(this.putItem, [warehouse, this, oji, ship]);
                }
            }
        } else if (this.state === 'transporting') {
            this.scale.set(Item.size);
        }
        if (this.cnt > 60 * 60 && this.state === 'in') {
            this.state = 'garbage';
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
        item.state = "transporting";
        item.scale.set(Item.size);
    }
    // 指定したidと同じアイテムが格納されていて且つその空きがある倉庫を探す
    findSameItemWarehouse(ship: Ship, id: number) {
        let warehouse: Room;
        // 既に同じアイテムが倉庫に格納されていて、空きがある場合を探す
        for (let i = 0; i < ship.warehouses.length; i++) {
            for (let j = 0; j < ship.warehouses[i].itemlist.length; j++) {// アイテムが格納できるかどうか調べる
                if (ship.warehouses[i].itemlist[j].id == id && ship.warehouses[i].itemlist[j].num <= this.max) {
                    warehouse = ship.warehouses[i];
                    break;
                }
            }
            if (warehouse !== undefined) break;
        }
        return warehouse;
    }
    // 空きのある倉庫を探す
    findEmptyWarehouse(ship: Ship) {
        let warehouse: Room;
        for (let i = 0; i < ship.warehouses.length; i++) {
            if (ship.warehouses[i].itemlist.length < ship.warehouses[i].kind) {// 倉庫があり、空きがある場合
                warehouse = ship.warehouses[i];
                break;
            }
        }
        return warehouse;
    }
    //アイテムを格納する関数
    putItem(warehouse: Room_warehouse, item: Item, oji: Ojisan, ship: Ship) {
        let ok = false;
        oji.state = 'free';
        for (let i = 0; i < warehouse.itemlist.length; i++) {
            if (warehouse.itemlist[i].id == item.id && warehouse.itemlist[i].num <= item.max) {
                warehouse.itemlist[i].num++;
                ok = true;
                item.removeItem();
                break;
            }
        }
        if (!ok) {
            if (warehouse.itemlist.length < warehouse.kind) {
                warehouse.pushItemlist(item.id);
                item.removeItem();
            } else {
                item.popItem(ship, oji);
            }
        }
        oji.tl.clear();
        PIXI.Loader.shared.resources.close.sound.play();
    }
    // アイテムの削除
    removeItem() {
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
    }
    //idからアイテムのスプライトを返す
    static makeItem(x:number,y:number,id:number) {
        return new Item(x, y, id, 'display');
    }
    //アイテムを別のアイテムに変更する
    static changeItem(item: Item, id: number) {
        item.id = id;
        item.explanation = Item.itemList[id];
        item.tilePosition.x = -(id % 16 * 32);
        item.tilePosition.y = Math.floor(id / 16) * 32;
    }
    //フォーマットしたアイテムの名前を返す
    static returnItemName(id: number) {
        let name = Item.itemList[id];
        for (let i = name.length; i < 7; i++){
            name += '　';
        }
        return name;
    }
}