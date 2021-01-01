import * as PIXI from "pixi.js";
import gsap from "gsap";
import { Ship } from "./ship";
import { Ojisan } from "./ojisan";
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
        this.state = state;
        this.tilePosition.x = 32;
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
            if (this.cnt % 600 == 1 && ship.freeOjis.length != 0) {
                //一番近くにいるフリーおじさんを探し、そのおじさんに倉庫までアイテムを運ばせる
                let min: number = this.len(ship.freeOjis[0]);
                let ojiN: number = 0;
                for (let i = 1; i < ship.freeOjis.length; i++) {
                    let len = this.len(ship.freeOjis[i]);
                    if (min > len) {
                        min = len;
                        ojiN = i;
                    }
                }
                let oji: Ojisan = ship.freeOjis[ojiN];
                oji.state = 'transport';
                oji.tl
                    .to(oji, { duration: min / (0.2 * min + 15), x: this.x, y: this.y })
                    .call(this.stick, [ship, this, oji]);
                oji.tl.to(oji, { duration: 1, x: 0, y: 0 });
                ship.freeOjis.splice(ojiN, 1);
            }
        }
        this.cnt++;
    }
    //おじさんとアイテムの距離を測る
    len(oji: Ojisan) {
        return Math.sqrt(Math.pow(oji.x - this.x, 2) + Math.pow(oji.y - this.y, 2));
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
}