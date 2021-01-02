import * as PIXI from "pixi.js";
import { TextWindow } from "./window";
import { createButton } from "./create_button"; // ボタン生成関数をインポート
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
export abstract class Room extends PIXI.Sprite {
    window: TextWindow;
    back: PIXI.Container;
    kind: number = 10;// 倉庫のアイテムを入れられる種類
    itemlist: itemList[] = [];
    background: PIXI.Graphics;
    id: string;
    level: number = 0;
    state: string = "STOP";
    rNx: number;// 行番号
    rNy: number;// 列番号
    constructor(x: number, y: number, rNx: number, rNy: number, gamescene: PIXI.Container) {
        super();
        this.zIndex = -1;
        this.rNx = rNx;
        this.rNy = rNy;
        this.anchor.set(0.5);
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.window = new TextWindow(0, 0, 1, 1, 1);
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
    abstract move();
}