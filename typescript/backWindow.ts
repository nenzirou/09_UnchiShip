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
    footerText: MyText;//状態名
    constructor(x: number, y: number, z: number, scaleX: number, scaleY: number, alpha: number, visible: boolean) {
        super(x,y,10,scaleX,scaleY,alpha,visible);
        this.backButton = new Button("戻る", 64, 32, x, y, 2, 0x555555, 20, 1, true);// 戻るボタン生成
        this.backButton.on("pointerup", () => {// 戻るをタップした時の動作
            this.visible = false;// ウィンドウ表示をオフ
            PIXI.Loader.shared.resources.close.sound.play();// 効果音再生
        })
        this.titleText = new MyText("", 65, 0, 0, 30, 32, 0xdddddd);//タイトルテキスト作成
        this.footerText = new MyText("",17, 600-32, 0, 30, 32, 0xdddddd);//ステータステキスト作成
        this.addChild(this.backButton,this.titleText,this.footerText);//タイトルテキスト表示
    }
    //タイトルテキストを変更する関数
    setTitleText(text: string) {
        this.titleText.text = text;
    }
    //ステータステキストを変更する関数
    setFooterText(text: string) {
        this.footerText.text = text;
    }
}