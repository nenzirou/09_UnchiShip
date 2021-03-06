import * as PIXI from "pixi.js";
import gsap from "gsap";
import { Room } from "./room";
import { itemList } from "./room";
import { Room_wall } from "./room_wall";
import { Room_aisle } from "./room_aisle";
import { Room_warehouse } from "./room_warehouse";
import { Room_work } from "./room_work";
import { Room_bed } from "./room_bed";
import { Room_engine } from "./room_engine";
import { Ojisan } from "./ojisan";
import { Item } from "./item";
import { stringInOut } from "./item";
import { stringRoomState } from "./room";
import { Button } from "./button";
import { TextWindow } from "./textWindow";
import { MyText } from "./myText";
import { Shop } from "./shop";
import { Quest } from "./quest";
import { Bar } from "./bar";
import { Map } from "./map";
import { BuildRoom } from "./buildRoom";
import { Stage } from "./stage";
import { simpleWindow } from "./simpleWindow";
import { starManager } from "./starManager";
/*
shipに持たせる機能
船の全体像
*/

export class Ship extends PIXI.Container {
    //デバッグ用変数
    makableItem: boolean = true;//アイテムを生成するかどうか決定
    ojiNum: number = 15;//おじさんの初期生成数
    event: boolean = false;//イベントを発生させるかどうか

    eventFlags: boolean[] = new Array(200);//イベントフラグ
    gamescene: PIXI.Container;
    rooms: Room[] = new Array();//全ルームを入れる
    warehouses: Room[] = new Array();//倉庫を入れる
    ojis: Ojisan[] = new Array();//全おじさんを入れる
    freeOjis: Ojisan[] = new Array();//フリーなおじさんを入れる
    items: Item[] = new Array();//全アイテムを入れる
    rocket: PIXI.TilingSprite;//ロケット外観
    bgm: PIXI.sound.Sound;//BGM
    stop: boolean = false;//ゲームをストップするかどうか
    going: boolean;//進行中かどうか
    money: number;//お金
    speed: number;//スピード
    maxFuel: number;//燃料タンク
    fuel: number;//燃料
    consamption: number;//燃費
    ship: PIXI.TilingSprite;//ロケットの外装
    cnt: number = 0;
    rW: number = 8;
    rH: number = 10;
    w: number;
    h: number;
    starManager: starManager;//星を管理
    //メニューバー関係の変数
    menu: PIXI.Sprite;//メニューバー
    menuHider: simpleWindow;//メニューバーを隠す
    fuelText: MyText;//燃料表示テキスト
    ojiText: MyText;//おじさん人数表示テキスト
    calText: MyText;//総カロリー表示テキスト
    distanceDisplay: simpleWindow;//距離を表示する
    distanceCursor: PIXI.Sprite;//距離を表示するカーソル
    scaleUpButton: Button;//拡大を行うボタン
    scaleDownButton: Button;//縮小を行うボタン
    goalScale: number;//目標の大きさを保持する
    stopButton: Button;//時間停止ボタン
    shopButton: Button;//店ボタン
    barButton: Button;//バーボタン
    mapButton: Button;//マップボタン
    questButton: Button;//クエストボタン
    makingRoomButton: Button;//部屋を作るボタン
    shop: Shop;//店
    bar: Bar;//バー
    map: Map;//マップ
    distStageID: number;//目的地のステージID
    stageID: number;//現在位置しているステージID
    mapPosition: number;//マップ間のどの位置にいるか
    goalPosition: number;//目的地までの距離
    quest: Quest;//クエスト一覧
    buildRoom: BuildRoom;//部屋作成

    initialRoom: number[][] = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 4, 4, 4, 4, 1, 1],
        [1, 1, 2, 3, 4, 5, 1, 1],
        [1, 1, 2, 2, 2, 2, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
    ];
    constructor(x: number, y: number, width: number, height: number, gamescene: PIXI.Container) {
        super();
        const tl = gsap.timeline();//タイムライン初期化
        this.money = 1000000;
        this.speed = 10;
        this.maxFuel = 1000;
        this.fuel = this.maxFuel;
        this.stageID = 0;//ステージ０に停泊
        this.distStageID = 0;//目的地のステージID
        this.goalPosition = 1;
        this.mapPosition = 0;
        this.going = false;//進行中フラグを初期化
        this.eventFlags.fill(false);//イベントフラグを初期化
        this.bgm = PIXI.Loader.shared.resources.bgm1.sound;
        //if (document.visibilityState === 'visible') this.bgm.play();
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
        this.starManager = new starManager(gamescene);
        //ロケットの外観を作成
        this.rocket = new PIXI.TilingSprite(PIXI.Loader.shared.resources.rocket.texture, 700, 800);
        this.rocket.position.set(-150, -200);
        this.rocket.zIndex = 100;
        this.rocket.interactive = true;
        this.rocket.visible = false;
        this.ship = new PIXI.TilingSprite(PIXI.Loader.shared.resources.ship.texture, 500, 600);
        this.ship.position.set(-50, -99);
        this.addChild(this.rocket, this.ship);
        //メニューバー
        this.menu = new PIXI.Sprite(PIXI.Loader.shared.resources.menu.texture);
        this.menu.position.set(0, this.h);
        this.menu.sortableChildren = true;
        this.menuHider = new simpleWindow(400, 100, 0, 0, 100, 0x333333, 0.8, false);
        this.menuHider.interactive = true;
        //表示テキスト
        this.fuelText = new MyText("FUEL", 0, 0, 0, 15, 25, 0x333333);
        this.ojiText = new MyText("OJIs", 7, 16, 0, 15, 25, 0x333333);
        this.calText = new MyText("CAL", 8, 32, 0, 15, 25, 0x333333);
        this.distanceDisplay = new simpleWindow(150, 20, 148, 2, 5, 0x333377, 1, true);
        this.distanceCursor = new PIXI.Sprite(PIXI.Loader.shared.resources.cursor2.texture);
        this.distanceCursor.scale.set(0.6);
        this.distanceDisplay.addChild(this.distanceCursor);
        //拡大縮小ボタン
        this.scaleUpButton = new Button("拡大", 50, 50, this.w - 100, 50, 5, 0xff0000, 24, 1, true);
        this.scaleDownButton = new Button("縮小", 50, 50, this.w - 50, 50, 5, 0x0000ff, 24, 1, true);
        this.goalScale = 1.0;
        this.scaleUpButton.on('pointertap', () => {
            const scale = this.goalScale + 0.25;
            if (scale <= 1.0) {
                this.goalScale += 0.25;
                gsap.core.Tween.to(this.scale, { duration: 0.3, x: scale, y: scale })
                gsap.core.Tween.to(this.position, { duration: 0.3, x: (1 - scale) * 200, y: (1 - scale) * 250 });
            }
        });
        this.scaleDownButton.on('pointertap', () => {
            const scale = this.goalScale - 0.25;
            if (scale >= 0.25) {
                this.goalScale -= 0.25;
                gsap.core.Tween.to(this.scale, { duration: 0.3, x: scale, y: scale })
                gsap.core.Tween.to(this.position, { duration: 0.3, x: (1 - scale) * 200, y: (1 - scale) * 250 });
            }
        });
        //時間停止ボタン
        this.stopButton = new Button("停止", 52, 50, this.w - 152, 50, 5, 0x333333, 24, 1, true);
        this.stopButton.on('pointertap', () => {
            this.stop = !this.stop;
        });

        //店作成
        this.shop = new Shop(this);
        this.shop.setBuyingProduct(Stage.stageInfo[this.stageID].sellList);
        this.shop.visible = false;
        //店ボタン
        this.shopButton = new Button("お店", 62, 50, 0, 50, 5, 0x00ff00, 24, 1, true);
        this.shopButton.on('pointertap', () => {
            if (!this.going) {
                PIXI.Loader.shared.resources.shopButton.sound.play();
                this.shop.visible = true;
            } else {
                PIXI.Loader.shared.resources.nSelect.sound.play();
            }
        });
        //クエスト一覧生成
        this.quest = new Quest(this);
        this.quest.setQuestList(Stage.stageInfo[this.stageID].questList);
        this.quest.visible = false;
        //クエストボタン
        this.questButton = new Button("依頼", 62, 50, 62, 50, 5, 0xff00ff, 24, 1, true);
        this.questButton.on('pointertap', () => {
            if (!this.going) {
                PIXI.Loader.shared.resources.questButton.sound.play();
                this.quest.visible = true;
            } else {
                PIXI.Loader.shared.resources.nSelect.sound.play();
            }
        });
        //バー一覧生成
        this.bar = new Bar(this);
        this.bar.setTalkList(Stage.stageInfo[this.stageID].barList);
        this.bar.visible = false;
        //バーボタン
        this.barButton = new Button("酒場", 62, 50, 124, 50, 5, 0xffff33, 24, 1, true);
        this.barButton.on('pointertap', () => {
            if (!this.going) {
                PIXI.Loader.shared.resources.barButton.sound.play();
                this.bar.visible = true;
            } else {
                PIXI.Loader.shared.resources.nSelect.sound.play();
            }
        });
        //マップ作製
        this.map = new Map(this);
        //マップボタン
        this.mapButton = new Button("地図", 62, 50, 186, 50, 5, 0xdddddd, 24, 1, true);
        this.mapButton.on('pointertap', () => {
            PIXI.Loader.shared.resources.mapButton.sound.play();
            this.map.visible = true;
        });
        //ルーム作成
        this.buildRoom = new BuildRoom(this);
        //ルーム作成ボタン
        this.makingRoomButton = new Button("建設", 100, 50, this.w - 100, 0, 5, 0x000000, 24, 1, true);
        this.makingRoomButton.on('pointertap', () => {//ルーム作成ボタンの挙動
            PIXI.Loader.shared.resources.open.sound.play();
            this.buildRoom.visible = true;
        });
        // 船の部屋生成
        for (let i = 0; i < this.rH; i++) {
            for (let j = 0; j < this.rW; j++) {
                let room = this.makeRoom(j * 50 + 25, i * 50 + 25, this.initialRoom[i][j], gamescene, 'free');
                this.addChild(room);
                this.rooms.push(room);
            }
        }
        // おじさん生成
        for (let i = 0; i < this.ojiNum; i++) {
            let oji = new Ojisan(Math.random() * width, Math.random() * height);
            this.addChild(oji);
            this.ojis.push(oji);
        }
        gamescene.addChild(this.menu, this.shop, this.quest, this.bar, this.map, this.buildRoom);
        this.menu.addChild(this.menuHider, this.fuelText, this.ojiText, this.calText, this.distanceDisplay, this.scaleUpButton, this.scaleDownButton, this.stopButton, this.shopButton, this.questButton, this.barButton, this.mapButton, this.makingRoomButton);
    }


    //ループ処理
    move(app: PIXI.Application) {
        if (!this.stop) {
            //フリーなおじさんリストを作成する
            this.freeOjis = this.ojis.filter((v) => v.state === 'free');
            //倉庫リストを作成する
            this.warehouses = this.rooms.filter((v) => v.state === 'free' && v.id === 2);
            this.maxFuel = this.rooms.filter((v) => v.id === 5).length * 500;
            if (this.fuel > this.maxFuel) this.fuel = this.maxFuel;
            //ステータステキストの更新を行う
            this.fuelText.setText("FUEL:" + this.fuel + "/" + this.maxFuel);
            this.ojiText.setText("OJIs:" + this.ojis.length);
            this.calText.setText("CAL:" + 0);
            this.distanceCursor.position.set(this.mapPosition / this.goalPosition * 130, 0);
            //お店の動作を行う
            this.shop.display(this);
            //クエストの動作を行う
            this.quest.display(this);
            //酒場の動作を行う
            this.bar.display(this);
            //マップの動作を行う
            this.map.display(this);
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
            //星の動作を行う
            this.starManager.move(this);
            // ステージの動作を行う
            for (let i = 0; i < this.rooms.length; i++) {
                this.rooms[i].move();
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
            //航海中の処理
            if (this.going) {
                // アイテムを生成する
                if (this.cnt % 100 == 0 && this.makableItem) {
                    const dropItemList = Stage.stageInfo[this.distStageID].dropItemList;
                    let p = 0;
                    const rand = Math.random();
                    for (let i = 0; i < dropItemList.length; i++) {
                        p += dropItemList[i][1];
                        if (p >= rand) {
                            if (dropItemList[i][0] === 0) break;
                            this.makeItem(Math.random() * 1500 - 500, -800, dropItemList[i][0], 1, 'out');
                            break;
                        }
                    }
                }
                if (this.cnt % 30 == 0) {
                    this.mapPosition++;
                    this.fuel--;
                    if (this.goalPosition == this.mapPosition) {
                        PIXI.Loader.shared.resources.complete.sound.play();
                        this.gamescene.addChild(Button.makeSpeech("目的地に到着した！", 0xff3333, 2, 400, 25, 0, 200, 10, 25, 0.9));
                        this.going = false;
                        this.mapPosition = 0;
                        this.goalPosition = 1;
                        this.stageID = this.distStageID;
                    }
                }
            }
            //デバッグ用
            if (this.cnt % 600 == 0) {
                for (let i = 0; i < 6; i++) {
                    this.makeItem(0, 0, i + 1, 1, "out");
                }
                const cX = app.renderer.plugins.interaction.mouse.global.x;
                const cY = app.renderer.plugins.interaction.mouse.global.y;
                if (cX > 0 && cY > 0 && cY < 500) {
                    for (let i = 0; i < this.freeOjis.length; i++) {
                        if (this.freeOjis[i].state === 'free') {
                            //this.freeOjis[i].tl.clear();
                            //this.freeOjis[i].tl.to(this.freeOjis[i], { duration: 1, x: cX, y: cY - 32 });
                        }
                    }
                }
            }
        }
        this.cnt++;
    }

    //アイテムを生成する
    makeItem(x: number, y: number, id: number, num: number, state: stringInOut) {
        const item = new Item(x, y, id, num, state);
        if (item.num > item.max) item.num = item.max;
        this.addChild(item);
        this.items.push(item);
        return item;
    }
    //部屋を生成する
    makeRoom(x: number, y: number, id: number, gamescene: PIXI.Container, state: stringRoomState) {
        let room: Room;
        switch (id) {
            case 0: {
                room = new Room_wall(this, x, y, gamescene, state); break;
            }
            case 1: {
                room = new Room_aisle(this, x, y, gamescene, state); break;
            }
            case 2: {
                room = new Room_warehouse(this, x, y, gamescene, state); break;
            }
            case 3: {
                room = new Room_bed(this, x, y, gamescene, state); break;
            }
            case 4: {
                room = new Room_work(this, x, y, gamescene, state); break;
            }
            case 5: {
                room = new Room_engine(this, x, y, gamescene, state); break;
            }
        }
        return room;
    }
    //idとstateから部屋を探す
    findRoom(id: number, state: stringRoomState) {
        for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id === id && this.rooms[i].state === state) {
                return this.rooms[i];
            }
        }
    }
    //全倉庫にある指定したアイテムの個数を調べる
    countItemNum(id: number, inItemCount: boolean) {
        let sum = 0;
        //倉庫の中のアイテム
        for (let i = 0; i < this.warehouses.length; i++) {
            for (let j = 0; j < this.warehouses[i].itemlist.length; j++) {
                if (this.warehouses[i].itemlist[j].id == id) {
                    sum += this.warehouses[i].itemlist[j].num;
                }
            }
        }
        //船の中のアイテム
        if (inItemCount) {
            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i];
                if (item.id === id && item.state !== 'garbage' && item.state !== 'out' && item.state !== 'display') sum += item.num;
            }
        }
        return sum;
    }
}