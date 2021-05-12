import * as PIXI from "pixi.js";
import { Button } from "./button";
import { MyText } from "./myText";
import { BackWindow } from "./backWindow";
/*
戻るボタンがついたウィンドウ
*/
export class RoomWindow extends BackWindow {
    exButton: Button;// 拡張ボタン
    exWindow: BackWindow;//拡張ウィンドウ
    constructor(x: number, y: number, z: number, scaleX: number, scaleY: number, alpha: number, visible: boolean) {
        super(x, y, 10, scaleX, scaleY, alpha, visible);
        this.exButton = new Button("拡張", 366, 48, 17, 600-82, 1, 0x55ff55, 20, 1, true);// 拡張ボタン生成
        this.exWindow = new BackWindow(0, 0, 0, 1, 1, 1, false);//拡張ウィンドウ生成
        //拡張ボタンがクリックされたときの処理
        this.exButton.on("pointerup", () => {
            PIXI.Loader.shared.resources.open.sound.play();
            this.exWindow.visible = true;//拡張ウィンドウを開く
        });
        this.addChild(this.exButton,this.exWindow);
    }
}