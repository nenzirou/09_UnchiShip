import * as PIXI from "pixi.js";
import { Button } from "./button";
import { Ship } from "./ship";
import { Room } from "./room";
import { simpleWindow } from "./simpleWindow";
import { MyText } from "./myText";
import { Item } from "./item";
/*
店
*/
export class Shop extends PIXI.Sprite {
    backButton: Button;//戻るボタン
    moneyText: MyText;//お金表示
    buyingList: number[][];//商品のリスト
    buyingButton: Button;//購入切替ボタン
    buyingWindow: simpleWindow;//購入ウィンドウ
    productTexts: MyText[] = [];//商品のテキスト
    buyingProductButtons: Button[] = [];//商品を購入するボタン
    sellingButton: Button;//売却切替ボタン
    constructor(ship: Ship) {
        super(PIXI.Loader.shared.resources.window.texture);
        this.zIndex = 100;//最前面表示
        this.alpha = 0.8;
        //戻るボタン作成
        this.backButton = Room.makeBackButton(0, 0, this);
        //お金表示テキスト作成
        this.moneyText = new MyText(200, 0, 0, 24, 24, 0x333333);
        this.addChild(this.moneyText);
        //購入部品設定
        this.buyingWindow = new simpleWindow(360, 500, 20, 32, 0, 0x999999, 0.6, true);//購入ウィンドウ
        this.addChild(this.buyingWindow);
        for (let i = 0; i < 10; i++) {
            const productText = new MyText(0, 35 * i, 0, 32, 32, 0x333333);
            this.buyingWindow.addChild(productText);
            this.productTexts.push(productText);
            const buyingButton = new Button("購入", 55, 32, 300, 35 * i, 0, 0x993333, 24, 1);
            buyingButton.on('pointertap', () => {
                if (ship.money >= this.buyingList[i][1]) {
                    PIXI.Loader.shared.resources.shop.sound.play();
                    Ship.makeItem(ship, 200, 200, this.buyingList[i][0], 1, 'made');
                    ship.money -= this.buyingList[i][1];
                } else {
                    PIXI.Loader.shared.resources.nSelect.sound.play();
                }
            });
            this.buyingWindow.addChild(buyingButton);
            this.buyingProductButtons.push(buyingButton);
        }
        this.setProduct([[6, 100], [2, 200], [3, 300]]);
        //購入、売却切替ボタン
        this.buyingButton = new Button("購入", 180, 50, 20, 520, 0, 0xdd3333, 24, 1);
        this.buyingButton.on("pointertap", () => { this.buyingWindow.visible = true; });
        this.addChild(this.buyingButton);
        this.sellingButton = new Button("売却", 180, 50, 200, 520, 0, 0x3333dd, 24, 1);
        this.buyingButton.on("pointertap", () => { this.buyingWindow.visible = false; });
        this.addChild(this.sellingButton);
    }
    setProduct(item: number[][]) {
        this.buyingList = item;
        for (let i = 0; i < this.buyingProductButtons.length; i++) {
            if (i >= this.buyingList.length) {
                this.buyingProductButtons[i].visible = false;
            }
        }
    }
    display(ship: Ship) {
        if (this.buyingWindow.visible) {
            //お金表示更新
            this.moneyText.setText('所持金:'+ship.money);
            //商品情報更新
            for (let i = 0; i < 10; i++) {
                let text: string;
                if (i < this.buyingList.length) {//商品情報設定
                    const id = this.buyingList[i][0];
                    text = Item.itemInfo[id].name + '(' + Room.countItemNum(Ship.warehouses, id) + ')' + this.buyingList[i][1] + 'G';
                } else {
                    text = '';
                }
                this.productTexts[i].setText(text);
            }
        }
    }
}