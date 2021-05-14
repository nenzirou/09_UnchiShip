import * as PIXI from "pixi.js";
import { Button } from "./button";
import { MyText } from "./myText";
import { BackWindow } from "./backWindow";
import { Item } from "./item";
/*
戻るボタンがついたウィンドウ
*/
export class RoomWindow extends BackWindow {
    exButton: Button;// 拡張メニューボタン
    exWindow: BackWindow;//拡張ウィンドウ
    exButtons: Button[] = [];//拡張開始ボタン
    exTitles: MyText[] = [];//拡張タイトル
    exItemIcon: Item[] = [];//拡張に必要なアイテムアイコン
    exItemName: MyText[] = [];//拡張に必要なアイテムの名前
    constructor(x: number, y: number, z: number, scaleX: number, scaleY: number, alpha: number, visible: boolean) {
        super(x, y, 10, scaleX, scaleY, alpha, visible);
        this.exButton = new Button("拡張", 366, 48, 17, 600 - 82, 1, 0x55ff55, 28, 1, true);// 拡張ボタン生成
        this.exWindow = new BackWindow(0, 0, 0, 1, 1, 1, false);//拡張ウィンドウ生成
        //拡張ボタンがクリックされたときの処理
        this.exButton.on("pointerup", () => {
            PIXI.Loader.shared.resources.open.sound.play();
            this.exWindow.visible = true;//拡張ウィンドウを開く
        });
        for (let i = 0; i < 3; i++) {
            this.exTitles.push(new MyText("タイトル", 32, 128 * i + 33, 1, 30, 32, 0x333333));
            this.exButtons.push(new Button("拡張", 80, 40, 300, 128 * i + 33+16, 10, 0x3333dd, 32, 1, true));
            this.exItemIcon.push(new Item(32+16, 128 * i + 33 + 32 + 16, 1, 1, 'display'));
            this.exItemName.push(new MyText("名前(0)×10", 64, 128 * i + 33 + 32, 1, 30, 32, 0x333333));
            this.exWindow.addChild(this.exTitles[i], this.exButtons[i], this.exItemIcon[i], this.exItemName[i]);
        }
        this.addChild(this.exButton, this.exWindow);
    }
}