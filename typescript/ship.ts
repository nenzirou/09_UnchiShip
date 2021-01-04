import * as PIXI from "pixi.js";
import { Room } from "./room";
import { Room_wall } from "./room_wall";
import { Room_aisle } from "./room_aisle";
import { Room_warehouse } from "./room_warehouse";
import { Room_work } from "./room_work";
import { Room_bed } from "./room_bed";
import { Ojisan } from "./ojisan";
import { Item } from "./item";
import { stringInOut } from "./item";
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
    makingRoomButton: Button;//部屋を作るボタン
    makingRoomIcons: PIXI.TilingSprite[]=[];//部屋を作るウィンドウに配置する部屋スプライト
    makingRoomWindow: TextWindow;//部屋を作るウィンドウ
    makingRoomWindowTwo: TextWindow[]=[];//部屋を作る第２層ウィンドウ
    makingRoomTwoLayerItems: Item[]=[];//部屋を作る第２層ウィンドウに配置するアイテムアイコン
    cnt: number = 0;
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
    constructor(x: number, y: number, width: number, height: number, gamescene: PIXI.Container) {
        super();
        this.x = x;// 船全体のｘ座標
        this.y = y;// 船全体のｙ座標
        this.w = width;
        this.h = height;
        this.gamescene = gamescene;
        this.sortableChildren = true;

        //部屋を作るUI
        this.makingRoomButton = new Button("部屋作成", 100, 50, this.w - 100, this.h, 0, 0x000000);//ルーム作成ボタン
        this.makingRoomWindow = new TextWindow(0, 0, 1, 1, 1, 0.8);//ルーム作成第１ウィンドウ
        let makingRoomBack = new Button("戻る", 50, 30, 0, 0, 2, 0xcccccc);//戻るボタン
        makingRoomBack.on("pointerup", () => {//戻るボタンの挙動
            PIXI.Loader.shared.resources.close.sound.play();
            this.makingRoomWindow.visible = false;
        })
        this.makingRoomWindow.addChild(makingRoomBack);
        gamescene.addChild(this.makingRoomWindow);
        this.makingRoomWindow.visible = false;
        this.makingRoomButton.on('pointerup', () => {//ルーム作成ボタンの挙動
            this.makingRoomWindow.visible = true;
        });
        gamescene.addChild(this.makingRoomButton);
        //部屋の画像をウィンドウに登録
        let texture = [
            PIXI.Loader.shared.resources.room_warehouse.texture, PIXI.Loader.shared.resources.room_bed.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
            , PIXI.Loader.shared.resources.room_work.texture, PIXI.Loader.shared.resources.room_work.texture
        ];
        for (let i = 0; i < texture.length; i++) {//部屋のスプライト集設定

        }
        //ルーム作成ウィンドウのテキスト１
        let text = '作成する部屋を選択';
        this.makingRoomWindow.setText(text);
        let roomNameText = new MyText(80, 70, 1, 32, 50, 0x333333);
        this.makingRoomWindow.addChild(roomNameText);
        roomNameText.setText('倉庫\nベッド\n作業場\n倉庫\nベッド\n作業場\n倉庫\nベッド\n作業場\n倉庫\n');
        //必要アイテム
        for (let i = 0; i < 4; i++) {
            this.makingRoomTwoLayerItems.push(Item.makeItem(32 + 16, (i + 2) * 32 + 16, 0));
            this.makingRoomTwoLayerItems[i].zIndex = 100;
            this.makingRoomWindow.addChild(this.makingRoomTwoLayerItems[i]);
        }
        //作成ルームアイコンの挙動
        for (let i = 0; i < 3; i++) {
            //第１ウィンドウに配置するルームアイコン
            let displayRoom = new PIXI.TilingSprite(texture[i], 50, 50);
            displayRoom.position.set(20 + Math.floor(i / 10) * 180, 50 * (i % 10) + 64);
            displayRoom.interactive = true;
            displayRoom.buttonMode = true;
            this.makingRoomWindow.addChild(displayRoom);
            this.makingRoomIcons.push(displayRoom);
            //入れ子作成ウィンドウ
            let itemWindow = new TextWindow(0, 0, 1, 1, 1, 1);
            itemWindow.visible = false;
            this.makingRoomWindow.addChild(itemWindow);
            this.makingRoomWindowTwo.push(itemWindow);
            let itemlist = Room.roomMakeList[i+2];//[[],[]]型がくる
            //必要素材のスプライト 透明なアイテムスプライト４つを第１層ウィンドウに共有しておいておく　強化ウィンドウを開くと、その４つが素材として表示される
            displayRoom.on("pointerup", () => {
                //第二層ウィンドウ表示
                PIXI.Loader.shared.resources.open.sound.play();
                this.makingRoomWindowTwo[i].visible = true;
                for (let j = 0; j < itemlist.length; j++) {
                    Item.changeItem(this.makingRoomTwoLayerItems[j], itemlist[j][0]);
                    this.makingRoomTwoLayerItems[j].visible = true;
                }
            });
            //戻るボタンの挙動
            let back = new Button("戻る", 50, 30, 50, 0, 2, 0xcccccc);
            back.on("pointerup", () => {
                PIXI.Loader.shared.resources.close.sound.play();
                this.makingRoomWindowTwo[i].visible = false;
                for (let i = 0; i < this.makingRoomTwoLayerItems.length; i++) {
                    Item.changeItem(this.makingRoomTwoLayerItems[i], 0);
                }
            });
            this.makingRoomWindowTwo[i].addChild(back);
            //作成ボタンの挙動
            let making = new Button("作成", 100, 50, this.makingRoomWindow.width / 2, 400, 2, 0x333333);
            making.on("pointertap", () => {
                // if (this.state === 'free') {
                //     PIXI.Loader.shared.resources.close.sound.play();
                //     this.makingRoomWindowTwo[i].visible = false;//第２層のウィンドウを閉じる
                //     for (let j = 0; j < this.makingRoomTwoLayerItems.length; j++) {
                //         Item.changeItem(this.makingRoomTwoLayerItems[j], 0);
                //     }
                //     this.make(this.oneLayerItems[i].id);
                // }
            });
            this.makingRoomWindowTwo[i].addChild(making);
        }
        // 船の部屋生成
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 8; j++) {
                let room: Room;
                switch (this.initialRoom[i][j]) {
                    case 0: {
                        room = new Room_wall(j * 50 + 25, i * 50 + 25, j, i, gamescene); break;
                    }
                    case 1: {
                        room = new Room_aisle(j * 50 + 25, i * 50 + 25, j, i, gamescene); break;
                    }
                    case 2: {
                        room = new Room_warehouse(j * 50 + 25, i * 50 + 25, j, i, gamescene); break;
                    }
                    case 3: {
                        room = new Room_bed(j * 50 + 25, i * 50 + 25, j, i, gamescene); break;
                    }
                    case 4: {
                        room = new Room_work(j * 50 + 25, i * 50 + 25, j, i, gamescene); break;
                    }
                }
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
        // let buntton = new Button("a", 50, 50, 0, 0, 0, 0x444444);
        // buntton.on("pointertap", () => {
        //     console.log("a");
        // });
        // this.addChild(buntton);
    }
    move(app: PIXI.Application) {

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
        if (this.cnt % 20 == 30) {
            this.makeItem(this, this.w, -100, Math.floor(Math.random() * 2) + 1, 1, 'out');
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
        //this.x = Math.sin(this.cnt / 300) * 20 + 20;
        //this.y = Math.cos(this.cnt / 300) * 20 + 20;
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
            console.log(Room.countItemNum(Ship.warehouses, 1));
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
    makeItem(ship: Ship, x: number, y: number, id: number, num: number, state: stringInOut) {
        let item = new Item(x, y, id, num, state);
        if (item.num > item.max) item.num = item.max;
        ship.addChild(item);
        ship.items.push(item);
    }
}