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
    //購入タブ
    buyingMax: number = 10;//購入商品の最大種類
    buyingList: number[][];//商品のリスト
    buyingButton: Button;//購入切替ボタン
    buyingWindow: simpleWindow;//購入ウィンドウ
    buyingProductIcons: Item[] = [];//商品のアイコン
    buyingProductText: MyText;//商品のテキスト
    buyingProductMoneyText: MyText;//商品の値段のテキスト
    buyingProductButtons: Button[] = [];//商品を購入するボタン
    //売却タブ
    sellingMax: number = 13;//売却商品の最大種類
    sellingList: number[][];//商品のリスト
    sellingButton: Button;//売却切替ボタン
    sellingWindow: simpleWindow;//売却ウィンドウ
    sellingProductIcons: Item[] = [];//商品のアイコン
    sellingProductText: MyText;//商品のテキスト
    sellingProductMoneyText: MyText;//商品の値段のテキスト
    sellingProductButtons: Button[] = [];//商品を売却するボタン
    sellingProductSum: number[] = [];//売れる商品の所持数
    sellingProductFirstId: number;//売る商品リストの最初のID
    constructor(ship: Ship) {
        super(PIXI.Loader.shared.resources.window.texture);
        this.interactive = true;
        this.zIndex = 100;//最前面表示
        this.alpha = 0.8;
        //戻るボタン作成
        this.backButton = Room.makeBackButton(0, 0, this);
        //所持金表示テキスト作成
        this.moneyText = new MyText("", 100, 5, 0, 20, 32, 0xdddd33);
        this.addChild(this.moneyText);
        //                                      購入部品設定                                        //
        this.buyingWindow = new simpleWindow(360, 500, 20, 32, 0, 0xdd9999, 0.6, true);//購入ウィンドウ
        this.addChild(this.buyingWindow);
        //商品の名前と所持数を表示するテキスト
        const buyingProductText = new MyText("", 32, 5, 0, 20, 35, 0x333333);
        this.buyingWindow.addChild(buyingProductText);
        this.buyingProductText = buyingProductText;
        //商品の値段を表示するテキスト
        const buyingProductMoneyText = new MyText("", 200, 5, 0, 20, 35, 0xdddd33);
        buyingProductMoneyText.style.align = 'right';
        this.buyingWindow.addChild(buyingProductMoneyText);
        this.buyingProductMoneyText = buyingProductMoneyText;
        for (let i = 0; i < this.buyingMax; i++) {
            //商品のアイコン
            const item = new Item(16, i * 35 + 16, 0, 1, 'display');
            this.buyingWindow.addChild(item);
            this.buyingProductIcons.push(item);
            //商品を購入するボタン
            const buyingButton = new Button("購入", 55, 32, 300, 35 * i, 0, 0x993333, 24, 1, true);
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
        this.setBuyingProduct([[1, 40], [2, 9999999], [3, 300], [4, 100], [5, 200], [6, 300], [7, 100], [8, 200], [9, 300]]);
        //                                      売却部品設定                                        //
        this.sellingWindow = new simpleWindow(360, 500, 20, 32, 0, 0x9999dd, 0.6, true);//売却ウィンドウ
        this.sellingWindow.visible = false;
        this.addChild(this.sellingWindow);
        //商品の名前と所持数を表示するテキスト
        const sellingProductText = new MyText("", 32, 5, 0, 20, 35, 0x333333);
        this.sellingWindow.addChild(sellingProductText);
        this.sellingProductText = sellingProductText;
        //商品の値段を表示するテキスト
        const sellingProductMoneyText = new MyText("", 200, 5, 0, 20, 35, 0xdddd33);
        sellingProductMoneyText.style.align = 'right';
        this.sellingWindow.addChild(sellingProductMoneyText);
        this.sellingProductMoneyText = sellingProductMoneyText;
        //商品リストを上下させるボタン
        const upButton = new Button("↑", 175, 32, 0, 455, 0, 0x333333, 24, 1, true);
        upButton.on("pointertap", () => {
            this.sellingProductFirstId--;
            if (this.sellingProductFirstId <= 0) this.sellingProductFirstId = 1;
            this.setSellingProduct(this.sellingProductFirstId);
        });
        this.sellingWindow.addChild(upButton);
        const downButton = new Button("↓", 175, 32, 185, 455, 0, 0x333333, 24, 1, true);
        downButton.on("pointertap", () => {
            this.sellingProductFirstId++;
            if (this.sellingProductFirstId >= Item.itemInfo.length - this.sellingMax) this.sellingProductFirstId = Item.itemInfo.length - this.sellingMax;
            this.setSellingProduct(this.sellingProductFirstId);
        });
        this.sellingWindow.addChild(downButton);
        for (let i = 0; i < this.sellingMax; i++) {
            //商品のアイコン
            const item = new Item(16, i * 35 + 16, 0, 1, 'display');
            this.sellingWindow.addChild(item);
            this.sellingProductIcons.push(item);
            //商品を購入するボタン
            const sellingButton = new Button("売却", 55, 32, 300, 35 * i, 0, 0x333399, 24, 1, true);
            sellingButton.on('pointertap', () => {
                if (this.sellingProductSum[i] > 0) {
                    PIXI.Loader.shared.resources.shop.sound.play();
                    ship.money += this.sellingList[i][1];
                    const warehouse = Room.findItemFromWarehouse(ship, this.sellingList[i][0]);
                    //倉庫のアイテムリストから指定したアイテムを一つ減らす
                    for (let j = 0; j < warehouse.itemlist.length; j++) {
                        if (warehouse.itemlist[j].id == item.id) {
                            warehouse.itemlist[j].num--;
                            break;
                        }
                    }
                } else {
                    PIXI.Loader.shared.resources.nSelect.sound.play();
                }
            });
            this.sellingWindow.addChild(sellingButton);
            this.sellingProductButtons.push(sellingButton);
        }
        this.sellingProductFirstId = 1;
        this.setSellingProduct(1);
        //購入、売却切替ボタン
        this.buyingButton = new Button("購入", 180, 50, 20, 520, 0, 0xdd3333, 24, 1, true);
        this.buyingButton.on("pointertap", () => { this.buyingWindow.visible = true; this.sellingWindow.visible = false; });
        this.addChild(this.buyingButton);
        this.sellingButton = new Button("売却", 180, 50, 200, 520, 0, 0x3333dd, 24, 1, true);
        this.sellingButton.on("pointertap", () => { this.buyingWindow.visible = false; this.sellingWindow.visible = true; });
        this.addChild(this.sellingButton);
    }
    //購入できる商品をアップデートする
    setBuyingProduct(item: number[][]) {
        this.buyingList = item;
        for (let i = 0; i < this.buyingMax; i++) {
            if (i >= this.buyingList.length) {
                this.buyingProductButtons[i].visible = false;
                Item.changeItem(this.buyingProductIcons[i], 0);
            } else Item.changeItem(this.buyingProductIcons[i], item[i][0]);
        }
    }
    //売却できる商品を切り替える
    setSellingProduct(firstId: number) {
        this.sellingList = [];
        for (let i = 0; i < this.sellingMax; i++) {
            this.sellingList.push([i + firstId, Item.itemInfo[i + firstId].sell]);
            Item.changeItem(this.sellingProductIcons[i], i + firstId);
        }
    }
    display(ship: Ship) {
        //お金表示更新
        this.moneyText.setText('所持金:' + ship.money + 'G');
        //購入ウィンドウのテキスト更新
        if (this.buyingWindow.visible) {
            //商品情報更新
            let productName: string = '';
            let productMoney: string = '';
            for (let i = 0; i < this.buyingMax; i++) {
                if (i < this.buyingList.length) {//商品情報設定
                    const id = this.buyingList[i][0];
                    productName += Item.itemInfo[id].name + '(' + Room.countItemNum(ship, id, true) + ')\n';
                    productMoney += this.buyingList[i][1] + 'G\n';
                } else {
                    break;
                }
            }
            this.buyingProductText.setText(productName);
            this.buyingProductMoneyText.setText(productMoney);
        }
        //売却ウィンドウのテキスト更新
        if (this.sellingWindow.visible) {
            let productName: string = '';
            let productMoney: string = '';
            this.sellingProductSum = [];
            for (let i = 0; i < this.sellingMax; i++) {
                const id = this.sellingList[i][0];
                const sum = Room.countItemNum(ship, id, false);
                this.sellingProductSum.push(sum);
                productName += Item.itemInfo[id].name + '(' + sum + ')\n';
                productMoney += this.sellingList[i][1] + 'G\n';
            }
            this.sellingProductText.setText(productName);
            this.sellingProductMoneyText.setText(productMoney);
        }
    }
}