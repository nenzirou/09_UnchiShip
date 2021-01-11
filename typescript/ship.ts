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
import { Map } from "./map";
import { BuildRoom } from "./buildRoom";
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
    menu: PIXI.Sprite;//メニューバー
    scaleUpButton: Button;//拡大を行うボタン
    scaleDownButton: Button;//縮小を行うボタン
    stopButton: Button;//時間停止ボタン
    shopButton: Button;//店ボタン
    shop: Shop;//店
    barButton: Button;//バーボタン
    bar: Bar;//バー
    mapButton: Button;//マップボタン
    map: Map;//マップ
    mapPosition: number;//マップ間のどの位置にいるか
    goalPosition: number;//目的地までの距離
    questButton: Button;//クエストボタン
    quest: Quest;//クエスト一覧
    makingRoomButton: Button;//部屋を作るボタン
    buildRoom: BuildRoom;//部屋作成
    bgm: PIXI.sound.Sound;//BGM
    makableItem: boolean = true;//アイテムを生成するかどうか決定デバッグ用
    stop: boolean = false;//ゲームをストップするかどうか
    stageID: number;//現在位置しているステージID
    money: number = 10000000000000;//お金
    cnt: number = 0;
    rW: number = 8;
    rH: number = 10;
    w: number;
    h: number;
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
        this.stageID = 0;//ステージ０に停泊
        this.eventFlags.fill(false);//イベントフラグを初期化
        this.bgm = PIXI.Loader.shared.resources.bgm1.sound;
        this.bgm.play();
        PIXI.Loader.shared.resources.bgm1.sound.loop = true;
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === 'hidden') {
                this.bgm.pause();
            } else {
                this.bgm.resume();
            }
        })
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
        //メニューバー
        this.menu = new PIXI.Sprite(PIXI.Loader.shared.resources.menu.texture);
        this.menu.position.set(0, this.h);
        gamescene.addChild(this.menu);
        //拡大縮小ボタン
        this.scaleUpButton = new Button("拡大", 50, 50, this.w - 100, 50, 5, 0xff0000, 24, 1, true);
        this.scaleDownButton = new Button("縮小", 50, 50, this.w - 50, 50, 5, 0x0000ff, 24, 1, true);
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
        this.menu.addChild(this.scaleUpButton);
        this.menu.addChild(this.scaleDownButton);
        //時間停止ボタン
        this.stopButton = new Button("停止", 52, 50, this.w - 152, 50, 5, 0x333333, 24, 1, true);
        this.stopButton.on('pointertap', () => {
            this.stop = !this.stop;
        });
        this.menu.addChild(this.stopButton);
        //店作成
        this.shop = new Shop(this);
        this.shop.visible = false;
        gamescene.addChild(this.shop);
        //店ボタン
        this.shopButton = new Button("お店", 62, 50, 0, 50, 5, 0x00ff00, 24, 1, true);
        this.shopButton.on('pointertap', () => {
            PIXI.Loader.shared.resources.shopButton.sound.play();
            this.shop.visible = true;
        });
        this.menu.addChild(this.shopButton);
        //クエスト一覧生成
        this.quest = new Quest(this);
        this.quest.visible = false;
        gamescene.addChild(this.quest);
        //クエストボタン
        this.questButton = new Button("依頼", 62, 50, 62, 50, 5, 0xff00ff, 24, 1, true);
        this.questButton.on('pointertap', () => {
            PIXI.Loader.shared.resources.questButton.sound.play();
            this.quest.visible = true;
        });
        this.menu.addChild(this.questButton);
        //バー一覧生成
        this.bar = new Bar(this);
        this.bar.visible = false;
        gamescene.addChild(this.bar);
        //バーボタン
        this.barButton = new Button("酒場", 62, 50, 124, 50, 5, 0xffff33, 24, 1, true);
        this.barButton.on('pointertap', () => {
            PIXI.Loader.shared.resources.barButton.sound.play();
            this.bar.visible = true;
        });
        this.menu.addChild(this.barButton);
        //マップ作製
        this.map = new Map(this);
        gamescene.addChild(this.map);
        //マップボタン
        this.mapButton = new Button("地図", 62, 50, 186, 50, 5, 0xdddddd, 24, 1, true);
        this.mapButton.on('pointertap', () => {
            PIXI.Loader.shared.resources.mapButton.sound.play();
            this.map.visible = true;
        });
        this.menu.addChild(this.mapButton);
        //ルーム作成
        this.buildRoom = new BuildRoom(this);
        gamescene.addChild(this.buildRoom);
        //ルーム作成ボタン
        this.makingRoomButton = new Button("建設", 100, 50, this.w - 100, 0, 5, 0x000000, 24, 1, true);
        this.makingRoomButton.on('click', () => {//ルーム作成ボタンの挙動
            PIXI.Loader.shared.resources.open.sound.play();
            this.buildRoom.makingRoomOneLayerWindow.visible = true;
        });
        this.menu.addChild(this.makingRoomButton);
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


    //ループ処理
    move(app: PIXI.Application) {
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
            if (this.rooms[i].id === 2 && this.rooms[i].state === 'free') {
                this.warehouses.push(this.rooms[i]);
            }
        }
        // アイテムを生成する
        if (this.cnt % 20 == 0 && this.makableItem) {
            Ship.makeItem(this, this.w, -100, Math.floor(Math.random() * 2) + 1, 1, 'out');
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
            //部屋作成の動作を行う
            this.buildRoom.display(this);
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
                            this.freeOjis[i].tl.to(this.freeOjis[i], { duration: 1, x: cX, y: cY - 32 });
                        }
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