import * as PIXI from "pixi.js";
import { Ship } from "./ship";
import { Ojisan } from "./ojisan";
import { Room_warehouse } from "./room_warehouse";
import { Room } from "./room";
import { itemList } from "./room";
import gsap from "gsap";
/*
itemに持たせる機能
id
*/
interface itemInfo {
    name: string;//アイテムの名前
    sell: number;//アイテムの売値
}
export type stringInOut = 'in' | 'out' | 'reserved' | 'transporting' | 'garbage' | 'display' | 'made'|'extracted';
export class Item extends PIXI.TilingSprite {
    static itemInfo: itemInfo[] = [
        {
            name: 'バグアイテム',
            sell: 0
        }, {
            name: 'うんち',
            sell: 5
        }, {
            name: '粘土',
            sell: 5
        }, {
            name: '土器',
            sell: 50
        }, {
            name: 'レンガ',
            sell: 50
        }, {
            name: '水',
            sell: 15
        }, {
            name: 'スクラップ',
            sell: 5
        }, {
            name: '鉄板',
            sell: 50
        }, {
            name: 'ネジ',
            sell: 50
        }, {
            name: 'ドライバー',
            sell: 50
        }, {
            name: '砂',
            sell: 5
        }, {
            name: '岩',
            sell: 5
        }, {
            name: '枯れ枝',
            sell: 5
        }, {
            name: '木材',
            sell: 50
        }, {
            name: 'イス',
            sell: 50
        }, {
            name: '布切れ',
            sell: 5
        }, {
            name: '枕',
            sell: 50
        }, {
            name: 'ベッド',
            sell: 50
        }, {
            name: 'ドラム缶',
            sell: 100
        }, {
            name: '桃',
            sell: 10
        },
    ];
    num: number;
    cnt: number = 0;
    id: number = 0;
    state: stringInOut = 'in';
    max: number = 99;
    tl: TimelineMax;
    speed: number;
    rotat: number;
    static size: number = 0.6;
    constructor(x: number, y: number, id: number, num: number, state: stringInOut) {
        super(PIXI.Loader.shared.resources.item.texture, 32, 32);
        for (let i = 0; i < 200 - Item.itemInfo.length; i++)Item.itemInfo.push({
            name: "", sell: 10
        });
        this.x = x;
        this.y = y;
        this.num = num;
        this.anchor.set(0.5);
        Item.changeItem(this, id);
        this.state = state;
        this.tl = gsap.timeline();
        this.speed = Math.random() * 3 + 1;
        this.rotat = -0.5 + Math.random() * 1;
    }
    move(ship: Ship) {
        if (this.state === 'out') {
            this.y += this.speed;
            this.rotation += this.rotat;
            if (this.y >= 250) {
                this.state = 'reserved';
                let x = this.x;
                let y = this.y;
                this.rotation = 0;
                this.position.set(Math.floor(Math.random() * (ship.w - this.width)) + this.width / 2, Math.floor(Math.random() * (ship.h - this.height)) + this.height / 2);
                this.tl.from(this, { duration: 1, x: x, y: y });
                this.tl.from(this.scale, { duration: 0.2, x: 0.5, y: 0.5, ease: 'back.out(10)' });
                this.tl.call(() => this.state = 'in');
            }
        } else if (this.state === 'in') {
            if (this.cnt % 300 == 1 && ship.freeOjis.length != 0) {
                let warehouse = this.findSameItemWarehouse(ship, this.id);//同じ種類のアイテムが格納されている倉庫を探す
                if (warehouse === undefined) warehouse = this.findEmptyWarehouse(ship);//もし上記が無かった場合、空きのある倉庫を探す
                // 倉庫が見つけられた時の処理
                if (warehouse !== undefined) {
                    const oji = Room.findNearFreeOji(ship, this.x, this.y);//一番近くにいるフリーおじさんを探す
                    if (oji != undefined) {
                        this.state = 'reserved';//アイテムを予約済みにする
                        oji.state = 'transport';//おじさんを輸送状態にする
                        oji.tl
                            .clear()
                            .to(oji, { duration: Room.len(this.x, this.y, oji.x, oji.y) / oji.speed, x: this.x, y: this.y })
                            .call(this.stick, [ship, this, oji])
                            .to(oji, { duration: Room.len(this.x, this.y, warehouse.x, warehouse.y) / oji.speed, x: warehouse.x, y: warehouse.y })
                            .call(this.putItem, [warehouse, this, oji, ship]);
                    }
                }
                // if (this.cnt > 60 * 60) {
                //     this.state = 'garbage';
                // }
            }
            this.cnt++;
        } else if (this.state === 'transporting') {
            this.scale.set(Item.size);
        } else if (this.state === 'made') {
            this.state = 'reserved';
            this.tl.from(this.scale, { duration: 1, x: 0.1, y: 0.1, ease: 'back.out(10)' })
                .call(() => this.state = 'in');
        } else if (this.state === 'extracted') {
            this.cnt++;
            if (this.cnt > 60 * 20) {
                this.state = 'in';
                this.cnt = 0;
            }
        }
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
                if (ship.warehouses[i].itemlist[j].id == id && ship.warehouses[i].itemlist[j].num <= this.max - 1) {
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
        let listed = false;
        oji.state = 'free';
        //倉庫のアイテムリストからおじさんが持っているアイテムと同じものをさがして追加する
        for (let i = 0; i < warehouse.itemlist.length; i++) {
            if (warehouse.itemlist[i].id == item.id && warehouse.itemlist[i].num <= item.max - 1) {
                if (warehouse.itemlist[i].num + item.num > item.max) {//アイテムがあふれた場合
                    ship.makeItem(warehouse.x, warehouse.y, item.id, warehouse.itemlist[i].num + item.num - item.max, 'in');
                    warehouse.itemlist[i].num = item.max;
                } else {//アイテムが溢れない場合
                    warehouse.itemlist[i].num += item.num;
                }
                listed = true;
                item.state = 'garbage';
                break;
            }
        }
        //倉庫のアイテムリストにおじさんが持っているアイテムが無い場合、新しく追加
        if (!listed) {
            if (warehouse.itemlist.length < warehouse.kind) {
                warehouse.pushItemlist(item.id, item.num);
                item.state = 'garbage';
            } else {
                item.popItem(ship, oji, warehouse.x, warehouse.y, item.num);
            }
        }
        oji.tl.clear();
    }
    // アイテムを地面に落とす
    popItem(ship: Ship, oji: Ojisan, x: number, y: number, num: number) {
        this.scale.set(1);
        this.state = 'in';
        this.num = num;
        this.x = x;
        this.y = y;
        oji.removeChild(this);
        ship.addChild(this);
    }
    //アイテムを別のアイテムに変更する
    static changeItem(item: Item, id: number) {
        item.id = id;
        item.tilePosition.x = -(id * 32);
    }
    //フォーマットしたアイテムの名前を返す
    static returnItemName(id: number) {
        let name: string = Item.itemInfo[id].name;
        for (let i = name.length; i < 7; i++) {
            name += '　';
        }
        return name;
    }
}