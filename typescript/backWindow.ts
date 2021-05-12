import * as PIXI from "pixi.js";
import { TextWindow } from "./textWindow";
import { Button} from "./button";
import { MyText } from "./myText";
/*
戻るボタンがついたウィンドウ
*/
export class BackWindow extends TextWindow {
    backButton: Button;// 戻るボタン
    titleText: MyText;// タイトル名
    constructor(x: number, y: number, z: number, scaleX: number, scaleY: number, alpha: number, visible: boolean) {
        super(x,y,10,scaleX,scaleY,alpha,visible);
        this.backButton = new Button("戻る", 64, 32, x, y, 2, 0x555555, 20, 1, true);// 戻るボタン生成
        this.backButton.on("pointerup", () => {// 戻るをタップした時の動作
            this.visible = false;// ウィンドウ表示をオフ
            PIXI.Loader.shared.resources.close.sound.play();// 効果音再生
        })
        this.titleText = new MyText("",65, 0, 0, 30, 32, 0x333333);//タイトルテキスト作成
        this.addChild(this.backButton,this.titleText);//タイトルテキスト表示
    }
    //タイトルテキストを変更する関数
    setTitleText(text: string) {
        this.titleText.text = text;
    }
}