import * as PIXI from "pixi.js";
/*
星
*/
export class Star extends PIXI.TilingSprite {
    speed: number;
    constructor(x: number, y: number, z: number) {
        super(PIXI.Loader.shared.resources.star.texture, 5, 5);
        this.x = x;// ｘ座標
        this.y = y;// ｙ座標
        this.zIndex = z;//ｚ座標
        this.initialize();
    }
    initialize() {
        this.scale.set(Math.random() * 0.5 + 0.1);
        this.alpha = Math.random() * 0.5 + 0.5;//透明度
        this.tilePosition.x = Math.floor(Math.random() * 20) * 5;
        this.speed = Math.random() * 3 + 0.1;
    }
}