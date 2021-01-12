import * as PIXI from "pixi.js";
import gsap from "gsap";
import { Button } from "./button";
import { Ship } from "./ship";
import { itemList, Room } from "./room";
import { simpleWindow } from "./simpleWindow";
import { MyText } from "./myText";
import { Item } from "./item";
import { TextWindow } from "./window";
import { Stage } from "./stage";

export class BuildRoom extends PIXI.Sprite {
    makingRoomId: number;//作る部屋
    makingRoomOneLayerWindow: TextWindow;//第1層ウィンドウ
    makingRoomOneLayerBack: PIXI.Container;//第１層ウィンドウの戻るボタン
    makingRoomOneLayerItems: PIXI.TilingSprite[] = [];//第1層ウィンドウに配置する部屋スプライト
    makingRoomTwoLayerWindows: TextWindow[] = [];//部屋を作る第２層ウィンドウ
    makingRoomTwoLayerBacks: PIXI.Container[] = [];//第１層ウィンドウの戻るボタン
    makingRoomTwoLayerItems: Item[] = [];//部屋を作る第２層ウィンドウのアイテムアイコン
    makingRoomSelect: boolean;//部屋を作る場所を選択する処理に入ったかどうか
    clickPosition: PIXI.Point;//クリックされた座標
    clickCursor: PIXI.Graphics;//部屋選択のカーソル
    selected: boolean;//決定されたかどうか
    constructor(ship: Ship) {
        super();
        const tl = gsap.timeline();//タイムライン初期化
        this.clickPosition = new PIXI.Point(0, 0);//クリック座標を初期化
        //クリックされたときの処理
        ship.on('pointertap', (e: PIXI.InteractionEvent) => {
            const position = e.data.getLocalPosition(this);
            position.set(Math.floor(position.x / 50) * 50, Math.floor(position.y / 50) * 50);
            if (this.clickPosition.x == position.x && this.clickPosition.y == position.y) {
                if (ship.rooms[Math.floor(position.y / 50) * ship.rW + Math.floor(position.x / 50)].id == 1) {
                    this.selected = true;
                } else {
                    PIXI.Loader.shared.resources.nSelect.sound.play();
                    ship.gamescene.addChild(Button.makeSpeech("通路にしか部屋は立てられません。", 0x333333, 1.5, 400, 25, 0, 200, 5, 25, 0.9));
                }
            } else {
                this.clickPosition = position;
                tl.to(this.clickCursor, { duration: 0.05, x: this.clickPosition.x, y: this.clickPosition.y });
            }
        })
        //カーソル生成
        this.clickCursor = new PIXI.Graphics();
        this.clickCursor.lineStyle(2, 0xcc0000);
        this.clickCursor.drawRoundedRect(0, 0, 50, 50, 10);
        this.clickCursor.zIndex = 100;
        this.clickCursor.visible = false;
        ship.addChild(this.clickCursor);
        //部屋を作るUI　第1層
        this.makingRoomOneLayerWindow = new TextWindow(0, 0, 1, 1, 1, 0.8, false);//ルーム作成第１ウィンドウ
        this.makingRoomOneLayerWindow.zIndex = 10;
        this.makingRoomOneLayerBack = Room.makeBackButton(0, 0, this.makingRoomOneLayerWindow);//第1層戻るボタン作成
        this.makingRoomOneLayerBack.on('click', () => {//第1層戻るボタンの処理
            Room.changeVisual(this.makingRoomTwoLayerWindows, false);
        })
        ship.gamescene.addChild(this.makingRoomOneLayerWindow);//ルーム作成第1ウィンドウを登録
        //第1層ウィンドウ内のテキスト設定
        this.makingRoomOneLayerWindow.setText('作成する部屋を選択');
        let roomNameText = new MyText("", 80, 70, 1, 32, 50, 0x333333);
        this.makingRoomOneLayerWindow.addChild(roomNameText);
        roomNameText.setText('倉庫\nベッド\n作業場\n倉庫\nベッド\n作業場\n倉庫\nベッド\n作業場\n倉庫\n');
        //作成アイテムアイコンの挙動
        for (let i = 0; i < 3; i++) {
            //第１層ウィンドウに配置するルームアイコン
            const displayRoom: PIXI.TilingSprite = new PIXI.TilingSprite(PIXI.Loader.shared.resources[Room.roomInfo[i + 2].texture].texture, 50, 50);
            displayRoom.position.set(20 + Math.floor(i / 10) * 180, 50 * (i % 10) + 64);
            displayRoom.interactive = true;
            displayRoom.buttonMode = true;
            this.makingRoomOneLayerWindow.addChild(displayRoom);
            this.makingRoomOneLayerItems.push(displayRoom);
            //第2層ウィンドウの設定
            const itemWindow: TextWindow = new TextWindow(0, 0, 1, 1, 1, 1, false);
            this.makingRoomOneLayerWindow.addChild(itemWindow);
            this.makingRoomTwoLayerWindows.push(itemWindow);
            const itemlist: itemList[] = Room.roomInfo[i + 2].need;//itemList[]型がくる
            //第2層アイテムの設定
            for (let j = 0; j < itemlist.length; j++) {
                this.makingRoomTwoLayerItems.push(Room.makeDisplayItem(32 + 16, (j + 2) * 32 + 16, itemlist[j].id, this.makingRoomTwoLayerWindows[i], true));
            }
            //第1層アイテムの挙動
            this.makingRoomOneLayerItems[i].on("pointerup", () => {
                //第2層ウィンドウ表示
                PIXI.Loader.shared.resources.open.sound.play();
                this.makingRoomTwoLayerWindows[i].visible = true;
            });
            //第２層戻るボタンの設定
            this.makingRoomTwoLayerBacks.push(Room.makeBackButton(50, 0, this.makingRoomTwoLayerWindows[i]));
            //作成ボタンの挙動
            const makingButton = new Button("作成", 100, 50, 32, 400, 2, 0x333333, 32, 1, true);
            makingButton.on("pointerup", () => {
                PIXI.Loader.shared.resources.open.sound.play();
                //ウィンドウを閉じる処理
                this.makingRoomOneLayerWindow.visible = false;
                Room.changeVisual(this.makingRoomTwoLayerWindows, false);
                ship.gamescene.addChild(Button.makeSpeech("部屋を立てる場所を選んでください。", 0x333333, 5, 400, 32, 0, 200, 1, 22, 0.8));
                //選ぶ処理
                for (let j = 0; j < ship.rooms.length; j++) {//全ての部屋をタッチできなくする
                    ship.rooms[j].interactive = false;
                }
                ship.interactive = true;//船をタッチできるようにする
                this.clickCursor.visible = true;//カーソル表示
                this.makingRoomId = i + 2;//作る部屋IDを保存
            });
            this.makingRoomTwoLayerWindows[i].addChild(makingButton);
        }
    }
    display(ship: Ship) {
        //ルーム作成で部屋を作る場所を選ぶ時の処理
        if (this.selected) {
            this.removeChild(ship.rooms[(this.clickPosition.y / 50) * ship.rW + (this.clickPosition.x / 50)]);
            ship.rooms[(this.clickPosition.y / 50) * ship.rW + (this.clickPosition.x / 50)] = Ship.makeRoom(this.clickPosition.x + 25, this.clickPosition.y + 25, this.makingRoomId, ship.gamescene, 'build');//部屋作成
            ship.addChild(ship.rooms[(this.clickPosition.y / 50) * ship.rW + (this.clickPosition.x / 50)]);
            this.selected = false;
            ship.interactive = false;
            this.clickCursor.visible = false;
            for (let j = 0; j < ship.rooms.length; j++) {//全ての部屋をタッチできるようにする
                ship.rooms[j].interactive = true;
            }
            this.clickPosition.set(0, 0);
        }
        if (this.makingRoomOneLayerWindow.visible) {
            //テキスト更新
            for (let i = 0; i < this.makingRoomTwoLayerWindows.length; i++) {//第2層テキスト更新
                if (this.makingRoomTwoLayerWindows[i].visible) {
                    const itemlist: itemList[] = Room.roomInfo[i + 2].need;//itemList[]型がくる
                    //必要素材の必要数を表示するテキストを設定
                    let needItemText = "必要素材\n";
                    for (let j = 0; j < itemlist.length; j++) {
                        needItemText += "　 " + Item.itemInfo[itemlist[j].id].name + "×" + itemlist[j].num + "(" + Room.countItemNum(ship, itemlist[j].id, true) + ")\n";
                    }
                    this.makingRoomTwoLayerWindows[i].setText(needItemText);
                }
            }
        }
    }
}