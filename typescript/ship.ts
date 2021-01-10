import * as PIXI from "pixi.js";
import gsap from "gsap";
import { Room } from "./room";
import { itemList } from "./room";
import { Room_wall } from "./room_wall";
import { Room_aisle } from "./room_aisle";
import { Room_warehouse } from "./room_warehouse";
import { Room_work } from "./room_work";
import { Room_bed } from "./room_bed";
import { Ojisan } from "./ojisan";
import { Item } from "./item";
import { stringInOut } from "./item";
import { stringRoomState } from "./room";
import { Button } from "./button";
import { TextWindow } from "./window";
import { MyText } from "./myText";
import { Shop } from "./shop";
import { Quest } from "./quest";
import { Bar } from "./bar";
/*
shipに持たせる機能
船の全体像
componentsに各部屋のクラスを保存する
*/

export class Ship extends PIXI.Container {
    eventFlags: boolean[] = new Array(200);
    rooms: Room[] = new Array();//全ルームを入れる
    warehouses: Room[] = new Array();//倉庫を入れる
    ojis: Ojisan[] = new Array();//全おじさんを入れる
    freeOjis: Ojisan[] = new Array();//フリーなおじさんを入れる
    items: Item[] = new Array();//全アイテムを入れる
    rocket: PIXI.TilingSprite;//ロケット外観
    scaleUpButton: Button;//拡大を行うボタン
    scaleDownButton: Button;//縮小を行うボタン
    stopButton: Button;//時間停止ボタン
    shopButton: Button;//店ボタン
    barButton: Button;//バーボタン
    bar: Bar;//バー
    shop: Shop;//店
    questButton: Button;//クエストボタン
    quest: Quest;//クエスト一覧
    makingRoomId: number;//作る部屋
    makingRoomButton: Button;//部屋を作るボタン
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
    makableItem: boolean = true;//アイテムを生成するかどうか決定
    stop: boolean = false;//ゲームをストップするかどうか
    money: number = 10000000000000;//お金
    cnt: number = 0;
    rW: number = 8;
    rH: number = 10;
    w: number;
    h: number;
    static menu: boolean = false;
    gamescene: PIXI.Container;
    initialRoom: number[][] = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 3, 3, 3, 3, 3, 3, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 4, 0, 0, 0, 0, 4, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 2, 2, 2, 2, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    // initialRoom: number[][] = [
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 2, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    // ];
    constructor(x: number, y: number, width: number, height: number, gamescene: PIXI.Container) {
        super();
        const tl = gsap.timeline();//タイムライン初期化
        this.eventFlags.fill(false);//イベントフラグを初期化
        this.clickPosition = new PIXI.Point(0, 0);//クリック座標を初期化
        this.x = x;// 船全体のｘ座標
        this.y = y;// 船全体のｙ座標
        this.w = width;
        this.h = height;
        this.gamescene = gamescene;
        this.sortableChildren = true;
        //ロケットの外観を作成
        this.rocket = new PIXI.TilingSprite(PIXI.Loader.shared.resources.rocket.texture, 700, 800);
        this.rocket.position.set(-150, -200);
        this.rocket.zIndex = 100;
        this.rocket.interactive = true;
        this.rocket.visible = false;
        this.addChild(this.rocket);
        //拡大縮小ボタン
        this.scaleUpButton = new Button("拡大", 50, 50, this.w - 100, this.h + 50, 5, 0x0000ff, 24, 1, true);
        this.scaleDownButton = new Button("縮小", 50, 50, this.w - 50, this.h + 50, 5, 0x0000ff, 24, 1, true);
        this.scaleUpButton.on('pointertap', () => {
            let scale = this.scale.x + 0.1;
            if (scale <= 1.0) {
                this.scale.set(scale);
                this.position.set((1 - scale) * 200, (1 - scale) * 250);
            }
        });
        this.scaleDownButton.on('pointertap', () => {
            let scale = this.scale.x - 0.1;
            if (scale >= 0.3) {
                this.scale.set(scale);
                this.position.set((1 - scale) * 200, (1 - scale) * 250);
            }
        });
        gamescene.addChild(this.scaleUpButton);
        gamescene.addChild(this.scaleDownButton);
        //時間停止ボタン
        this.stopButton = new Button("一時停止", 100, 50, this.w - 200, this.h, 5, 0x333333, 24, 1, true);
        this.stopButton.on('pointertap', () => {
            this.stop = !this.stop;
        });
        gamescene.addChild(this.stopButton);
        //店作成
        this.shop = new Shop(this);
        this.shop.visible = false;
        gamescene.addChild(this.shop);
        //店ボタン
        this.shopButton = new Button("お店", 100, 50, 0, this.h, 5, 0x00ff00, 24, 1, true);
        this.shopButton.on('pointertap', () => {
            this.shop.visible = true;
        });
        gamescene.addChild(this.shopButton);
        //クエスト一覧生成
        this.quest = new Quest(this);
        this.quest.visible = false;
        gamescene.addChild(this.quest);
        //クエストボタン
        this.questButton = new Button("クエスト", 100, 50, 0, this.h + 50, 5, 0xff00ff, 24, 1, true);
        this.questButton.on('pointertap', () => {
            this.quest.visible = true;
        });
        gamescene.addChild(this.questButton);
        //バー一覧生成
        this.bar = new Bar(this);
        this.bar.visible = false;
        gamescene.addChild(this.bar);
        //バーボタン
        this.barButton = new Button("酒場", 100, 50, 100, this.h + 50, 5, 0xffff33, 24, 1, true);
        this.barButton.on('pointertap', () => {
            this.bar.visible = true;
        });
        gamescene.addChild(this.barButton);
        //クリックされたときの処理
        this.on('pointertap', (e: PIXI.InteractionEvent) => {
            let position = e.data.getLocalPosition(this);
            position.set(Math.floor(position.x / 50) * 50, Math.floor(position.y / 50) * 50);
            if (this.clickPosition.x == position.x && this.clickPosition.y == position.y) {
                this.selected = true;
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
        this.addChild(this.clickCursor);
        //部屋を作るUI　第1層
        this.makingRoomButton = new Button("部屋作成", 100, 50, this.w - 100, this.h, 5, 0x000000, 24, 1, true);//ルーム作成ボタン
        this.makingRoomOneLayerWindow = new TextWindow(0, 0, 1, 1, 1, 0.8, false);//ルーム作成第１ウィンドウ
        this.makingRoomOneLayerWindow.zIndex = 10;
        this.makingRoomOneLayerBack = Room.makeBackButton(0, 0, this.makingRoomOneLayerWindow);//第1層戻るボタン作成
        this.makingRoomOneLayerBack.on('click', () => {//第1層戻るボタンの処理
            Room.changeVisual(this.makingRoomTwoLayerWindows, false);
        })
        gamescene.addChild(this.makingRoomOneLayerWindow);//ルーム作成第1ウィンドウを登録
        this.makingRoomButton.on('click', () => {//ルーム作成ボタンの挙動
            PIXI.Loader.shared.resources.open.sound.play();
            this.makingRoomOneLayerWindow.visible = true;
        });
        gamescene.addChild(this.makingRoomButton);//ルーム作成ボタンを登録
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
                gamescene.addChild(Button.makeSpeech("部屋を立てる場所を選んでください。", 0x333333, 5, 400, 32, 0, 200, 1, 22, 0.8));
                //選ぶ処理
                for (let j = 0; j < this.rooms.length; j++) {//全ての部屋をタッチできなくする
                    this.rooms[j].interactive = false;
                }
                this.interactive = true;//船をタッチできるようにする
                this.clickCursor.visible = true;//カーソル表示
                this.makingRoomId = i + 2;//作る部屋IDを保存
            });
            this.makingRoomTwoLayerWindows[i].addChild(makingButton);
        }
        // 船の部屋生成
        for (let i = 0; i < this.rH; i++) {
            for (let j = 0; j < this.rW; j++) {
                let room = Ship.makeRoom(j * 50 + 25, i * 50 + 25, this.initialRoom[i][j], gamescene, 'free');
                this.addChild(room);
                this.rooms.push(room);
            }
        }
        // おじさん生成
        for (let i = 0; i < 100; i++) {
            let oji = new Ojisan(Math.random() * width, Math.random() * height);
            this.addChild(oji);
            this.ojis.push(oji);
        }
        //this.scale.set(0.8, 0.8);
    }
    move(app: PIXI.Application) {
        //ルーム作成で部屋を作る場所を選ぶ時の処理
        if (this.selected) {
            this.removeChild(this.rooms[(this.clickPosition.y / 50) * this.rW + (this.clickPosition.x / 50)]);
            this.rooms[(this.clickPosition.y / 50) * this.rW + (this.clickPosition.x / 50)] = Ship.makeRoom(this.clickPosition.x + 25, this.clickPosition.y + 25, this.makingRoomId, this.gamescene, 'build');//部屋作成
            this.addChild(this.rooms[(this.clickPosition.y / 50) * this.rW + (this.clickPosition.x / 50)]);
            this.selected = false;
            this.interactive = false;
            this.clickCursor.visible = false;
            for (let j = 0; j < this.rooms.length; j++) {//全ての部屋をタッチできるようにする
                this.rooms[j].interactive = true;
            }
        }
        //テキスト更新
        for (let i = 0; i < this.makingRoomTwoLayerWindows.length; i++) {//第2層テキスト更新
            if (this.makingRoomTwoLayerWindows[i].visible) {
                const itemlist: itemList[] = Room.roomInfo[i + 2].need;//itemList[]型がくる
                //必要素材の必要数を表示するテキストを設定
                let needItemText = "必要素材\n";
                for (let j = 0; j < itemlist.length; j++) {
                    needItemText += "　 " + Item.itemInfo[itemlist[j].id].name + "×" + itemlist[j].num + "(" + Room.countItemNum(this, itemlist[j].id, true) + ")\n";
                }
                this.makingRoomTwoLayerWindows[i].setText(needItemText);
            }
        }
        //フリーなおじさんリストを作成する
        this.freeOjis = [];
        for (let i = 0; i < this.ojis.length; i++) {
            if (this.ojis[i].state === 'free') {
                this.freeOjis.push(this.ojis[i]);
            }
        }
        //倉庫リストを作成する
        this.warehouses = [];
        for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id === 2) {
                this.warehouses.push(this.rooms[i]);
            }
        }
        // アイテムを生成する
        if (this.cnt % 20 == 0 && this.makableItem) {
            Ship.makeItem(this, this.w, -100, Math.floor(Math.random() * 2) + 1, 1, 'out');
        }
        if (this.cnt == 0) {
            // this.makeItem(this, this.w, -100, 1, 105, 'out');
            // this.makeItem(this, this.w, -100, 1, 3, 'out');
            // this.makeItem(this, this.w, -100, 2, 3, 'out');
            // this.makeItem(this, this.w, -100, 2, 4, 'out');
            // this.makeItem(this, this.w, -100, 2, 5, 'out');
            // this.makeItem(this, this.w, -100, 5, 6, 'out');
        }
        //this.scale.set(0.5 + this.cnt % 500 / 1000, 0.5 + this.cnt % 500 / 1000);
        // this.x = Math.sin(this.cnt / 300) * 20 + 20;
        // this.y = Math.cos(this.cnt / 300) * 20 + 20;
        if (!this.stop) {
            //お店の動作を行う
            this.shop.display(this);
            //クエストの動作を行う
            this.quest.display(this);
            //酒場の動作を行う
            this.bar.display(this);
            // アイテムの動作を行う
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].move(this);
                if (this.items[i].state === 'garbage') {
                    this.items[i].parent.removeChild(this.items[i]);
                    this.items.splice(i, 1);
                    i--;
                }
            }
            // ステージの動作を行う
            for (let i = 0; i < this.rooms.length; i++) {
                this.rooms[i].move(this);
            }
            // おじさんの動作を行う
            for (let i = 0; i < this.ojis.length; i++) {
                this.ojis[i].move(this);
                if (this.ojis[i].hp <= 0) {
                    this.ojis[i].parent.removeChild(this.ojis[i]);
                    this.ojis.splice(i, 1);
                    i--;
                }
            }
        }
        //デバッグ用
        if (this.cnt % 60 == 0) {
            let cX = app.renderer.plugins.interaction.mouse.global.x;
            let cY = app.renderer.plugins.interaction.mouse.global.y;
            if (cX > 0 && cY > 0) {
                for (let i = 0; i < this.freeOjis.length; i++) {
                    if (this.freeOjis[i].state === 'free') {
                        this.freeOjis[i].tl.clear();
                        this.freeOjis[i].tl.to(this.freeOjis[i], { duration: 1, x: cX, y: cY + 32 });
                    }
                }
            }
        }
        this.cnt++;
    }
    static makeItem(ship: Ship, x: number, y: number, id: number, num: number, state: stringInOut) {
        const item = new Item(x, y, id, num, state);
        if (item.num > item.max) item.num = item.max;
        ship.addChild(item);
        ship.items.push(item);
    }
    static makeRoom(x: number, y: number, id: number, gamescene: PIXI.Container, state: stringRoomState) {
        let room: Room;
        switch (id) {
            case 0: {
                room = new Room_wall(x, y, gamescene, state); break;
            }
            case 1: {
                room = new Room_aisle(x, y, gamescene, state); break;
            }
            case 2: {
                room = new Room_warehouse(x, y, gamescene, state); break;
            }
            case 3: {
                room = new Room_bed(x, y, gamescene, state); break;
            }
            case 4: {
                room = new Room_work(x, y, gamescene, state); break;
            }
        }
        return room;
    }
}