import * as PIXI from "pixi.js";
/*
itemに持たせる機能
id

*/
type stringInOut = 'in' | 'out';
export class Item extends PIXI.TilingSprite {
    id: number = 0;
    state: stringInOut = 'in';
    constructor(x: number, y: number, id: number, state: stringInOut) {
        super(PIXI.Loader.shared.resources.item.texture,32,32);
        this.x = x;
        this.y = y;
        this.id = id;
        this.state = state;
        this.tilePosition.x = 32;
    }
    move(width: number, height: number) {
        if (this.state === 'out') {
            this.y += 1;
            if (this.y >= 250) {
                this.state = 'in';
                this.x = Math.floor(Math.random() * (width-this.width));
                this.y = Math.floor(Math.random() * (height-this.height));
            }
        }
    }
}