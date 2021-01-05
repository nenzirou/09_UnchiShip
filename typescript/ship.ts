import * as PIXI from "pixi.js";
import gsap from "gsap";
import { Room } from "./room";
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
import { MyText } from "./text";
/*
shipに持たせる機能
船の全体像
componentsに各部屋のクラスを保存する
*/

export class Ship extends PIXI.Container {
    rooms: Room[] = new Array();//全ルームを入れる
    static warehouses: Room[] = new Array();//倉庫を入れる
    ojis: Ojisan[] = new Array();//全おじさんを入れる
    freeOjis: Ojisan[] = new Array();//フリーなおじさんを入れる
    items: Item[] = new Array();//全アイテムを入れる
    rocket: PIXI.TilingSprite;//ロケット外観
    scaleButton: Button;//拡大縮小を行うボタン
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
    enlargement: boolean = false;//拡大しているかどうか
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
        this.scaleButton = new Button("拡大縮小", 100, 50, this.w - 100, this.h + 50, 0, 0x0000ff, 24, 1);//ルーム作成ボタン
        this.scaleButton.on('click', () => {
            if (this.enlargement) {
                tl.to(this.scale, { duration: 0.2, x: 1, y: 1 })
                    .to(this.rocket, { duration: 0.2, alpha: 0 })
                    .call(() => { this.rocket.visible = false; this.rocket.alpha = 1;});
            } else {
                tl.call(() => { this.rocket.visible = true; })
                    .to(this.scale, { duration: 0.2, x: 0.5, y: 0.5 })
                    .from(this.rocket, { duration: 0.2, alpha: 0 });
            }
            this.enlargement = !this.enlargement;
        });
        gamescene.addChild(this.scaleButton);
        //クリックされたときの処理
        this.on('click', (e: PIXI.InteractionEvent) => {
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
        this.makingRoomButton = new Button("部屋作成", 100, 50, this.w - 100, this.h, 0, 0x000000, 24, 1);//ルーム作成ボタン
        this.makingRoomOneLayerWindow = new TextWindow(0, 0, 1, 1, 1, 0.8, false);//ルーム作成第１ウィンドウ
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
        let text = '作成する部屋を選択';
        this.makingRoomOneLayerWindow.setText(text);
        let roomNameText = new MyText(80, 70, 1, 32, 50, 0x333333);
        this.makingRoomOneLayerWindow.addChild(roomNameText);
        roomNameText.setText('倉庫\nベッド\n作業場\n倉庫\nベッド\n作業場\n倉庫\nベッド\n作業場\n倉庫\n');
        //部屋の画像集
        let texture = [
            PIXI.Loader.shared.resources.room_warehouse.texture, PIXI.Loader.shared.resources.room_bed.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
        ];
        //作成アイテムアイコンの挙動
        for (let i = 0; i < 3; i++) {
            //第１層ウィンドウに配置するルームアイコン
            let displayRoom = new PIXI.TilingSprite(texture[i], 50, 50);
            displayRoom.position.set(20 + Math.floor(i / 10) * 180, 50 * (i % 10) + 64);
            displayRoom.interactive = true;
            displayRoom.buttonMode = true;
            this.makingRoomOneLayerWindow.addChild(displayRoom);
            this.makingRoomOneLayerItems.push(displayRoom);
            //第2層ウィンドウの設定
            let itemWindow = new TextWindow(0, 0, 1, 1, 1, 1, false);
            this.makingRoomOneLayerWindow.addChild(itemWindow);
            this.makingRoomTwoLayerWindows.push(itemWindow);
            let itemlist = Room.roomMakeList[i + 2];//[[],[]]型がくる
            //第2層アイテムの設定
            for (let j = 0; j < itemlist.length; j++) {
                this.makingRoomTwoLayerItems.push(Room.makeDisplayItem(32 + 16, (j + 2) * 32 + 16, itemlist[j][0], this.makingRoomTwoLayerWindows[i], true));
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
            let makingButton = new Button("作成", 100, 50, 32, 400, 2, 0x333333, 32, 1);
            makingButton.on("pointerup", () => {
                PIXI.Loader.shared.resources.open.sound.play();
                //ウィンドウを閉じる処理
                this.makingRoomOneLayerWindow.visible = false;
                Room.changeVisual(this.makingRoomTwoLayerWindows, false);
                gamescene.addChild(Button.makeSpeech("部屋を立てる場所を選んでください。", 5, 400, 32, 0, 200, 1, 22, 0.8));
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
                let itemlist = Room.roomMakeList[i + 2];//[[],[]]型がくる
                //必要素材の必要数を表示するテキストを設定
                let needItemText = "必要素材\n";
                for (let j = 0; j < itemlist.length; j++) {
                    needItemText += "　 " + Item.itemList[itemlist[j][0]] + "×" + itemlist[j][1] + "(" + Room.countItemNum(Ship.warehouses, itemlist[j][0]) + ")\n";
                }
                this.makingRoomTwoLayerWindows[i].setText(needItemText);
            }
        }
        //フリーなおじさんリストを作成する
        for (let i = 0; i < this.ojis.length; i++) {
            if (this.ojis[i].state === 'free') {
                this.freeOjis.push(this.ojis[i]);
            }
        }
        //倉庫リストを作成する
        for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id === 2) {
                Ship.warehouses.push(this.rooms[i]);
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
        this.x = Math.sin(this.cnt / 300) * 20 + 20;
        this.y = Math.cos(this.cnt / 300) * 20 + 20;
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
        this.freeOjis = [];
        Ship.warehouses = [];
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