import * as PIXI from "pixi.js";
import { TextWindow } from "./window";
import { Ship } from "./ship";
import { Ojisan } from "./ojisan";
import { Item } from "./item";
import { MyText } from "./myText";
import { Button } from "./button";

/*
roomに持たせる機能
各部屋の基本的機能を詰め込む
部屋ID
部屋レベル
個体リスト
アイテムリスト
状態変数
位置
*/
interface itemList {
    id: number;
    num: number;
}
export type stringRoomState = 'free' | 'using' | 'gathering' | 'preparation' | 'build' | 'build_gathering' | 'build_preparation' | 'build_using';
export abstract class Room extends PIXI.TilingSprite {
    static roomList = { 0: '壁', 1: '通路', 2: '倉庫', 3: 'ベッド', 4: '作業場' };
    static roomMakeList = { /*倉庫*/2: [[1, 1], [2, 1]], /*ベッド*/3: [[3, 1], [4, 3]], /*作業場*/4: [[4, 2], [5, 2]] };
    oneLayerWindow: TextWindow;//第１層ウィンドウ
    oneLayerBack: PIXI.Container;//第１層ウィンドウの戻るボタン
    oneLayerItems: Item[] = [];//第１層のアイテムアイコン
    stateText: MyText;//状態を表示するテキストウィンドウ
    twoLayerWindows: TextWindow[] = [];//第２層のウィンドウ
    twoLayerBacks: PIXI.Container[] = [];//第２層ウィンドウの戻るボタン
    twoLayerItems: Item[] = [];//第２層のアイテムアイコン
    build: boolean;//建てられたかどうか
    makingItem: number = 0;
    makeCnt: number = 0;
    loop: boolean = true;
    kind: number = 4;// 倉庫のアイテムを入れられる種類
    itemlist: itemList[] = [];//この部屋に格納されているアイテムリスト
    needItems: number[] = [];//欲しいものリスト
    defoltTexture: PIXI.Texture;
    id: number;
    level: number = 0;
    state: stringRoomState;
    rNx: number;// 行番号
    rNy: number;// 列番号
    cnt: number = 0;// タイムカウント
    ojiID: number[] = [];//この部屋にいるおじさんのIDリスト
    ojiMax: number = 4;// おじさんを入れられる最大数
    constructor(id: number, x: number, y: number, texture: PIXI.Texture, gamescene: PIXI.Container, state: stringRoomState) {
        super(texture, 50, 50);
        this.defoltTexture = texture;
        this.state = state;
        if (this.state === 'build') this.build = false;
        else this.build = true;
        this.id = id;//部屋のID
        this.anchor.set(0.5);//ローカル座標の始点を真ん中にする
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.zIndex = -1;//部屋のｚ座標
        this.oneLayerWindow = new TextWindow(0, 0, 1, 1, 1, 0.8, false);
        gamescene.addChild(this.oneLayerWindow);
        this.interactive = true;
        this.buttonMode = true;
    }
    //部屋のアイテムリストにアイテムを追加する
    pushItemlist(id: number, num: number) {
        let tmp: itemList = { id: id, num: num };
        this.itemlist.push(tmp);
    }
    //距離を測る
    static len(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) + 1;
    }
    //おじさんに指定したアイテムをくっつける
    static stickItemToOji(oji: Ojisan, id: number) {
        let item = new Item(0, 0, id, 1, 'transporting');
        item.scale.set(Item.size);
        oji.addChild(item);
        oji.childs.push(item);
    }
    //指定したおじさんをフリーにする
    static freeOji(oji: Ojisan) {
        oji.tl.clear();
        oji.state = 'free';
        oji.visible = true;
        for (let i = 0; i < oji.childs.length; i++) {
            oji.removeChild(oji.childs[i]);
        }
        oji.childs = [];
    }
    //近くのフリーなおじさんを探す
    static findNearFreeOji(ship: Ship, x: number, y: number) {
        if (ship.freeOjis.length == 0) return;
        let min = 1000000;
        let oji: Ojisan;
        let id: number = 0;
        for (let i = 0; i < ship.freeOjis.length; i++) {
            if (ship.freeOjis[i].state === 'free') {
                let l = Room.len(x, y, ship.freeOjis[i].x, ship.freeOjis[i].y);
                if (l < min) {
                    min = l;
                    oji = ship.freeOjis[i];
                    id = i;
                }
            }
        }
        ship.freeOjis.splice(id, 1);
        return oji;
    }
    //アイテムリストの中にアイテムがあるかどうかをしらべる
    static judgeHavingItem(list: itemList[], id: number, num: number) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id && list[i].num >= num) {
                return i;
            }
        }
        return -1;
    }
    //必要なアイテムを探し、集める
    static gatherItem(ship: Ship, room: Room, id: number) {
        if (ship.freeOjis.length == 0) return false;
        const warehouse: Room = Room.findItemFromWarehouse(ship, id);
        if (warehouse === undefined) return false;
        const oji = Room.findNearFreeOji(ship, room.x, room.y);
        if (oji === undefined) return false;
        oji.state = 'transport';
        oji.tl
            .to(oji, { duration: Room.len(oji.x, oji.y, warehouse.x, warehouse.y) / oji.speed, x: warehouse.x, y: warehouse.y })//倉庫に向かう
            .call(() => {//おじさんが倉庫からアイテムを取りだす処理
                let tmp = Room.judgeHavingItem(warehouse.itemlist, id, 1);
                if (tmp != -1) {//おじさんが倉庫にたどり着いた時にアイテムが格納されている場合
                    PIXI.Loader.shared.resources.open.sound.play();
                    warehouse.itemlist[tmp].num--;
                    Room.stickItemToOji(oji, id);
                } else {//おじさんがたどり着いた頃にはもう必要なアイテムは倉庫になかった場合
                    Room.freeOji(oji);
                }
            })
            .to(oji, { duration: Room.len(room.x, room.y, warehouse.x, warehouse.y) / oji.speed, x: room.x, y: room.y })//対称の部屋に向かう
            .call(() => {//持ってきたアイテムを格納する処理
                let judge = false;
                for (let i = 0; i < room.needItems.length; i++) {
                    if (room.needItems[i] == id) {//欲しいものリストに持ってきたアイテムがあったら
                        judge = true;
                        room.needItems.splice(i, 1);
                        break;
                    }
                }
                if (judge) {//欲しいものリストにアイテムが載っていた場合、格納する
                    let tmp = Room.judgeHavingItem(room.itemlist, id, 1);
                    if (tmp != -1) {
                        room.itemlist[tmp].num++;
                    } else {
                        room.pushItemlist(id, 1);
                    }
                } else {//欲しいものリストにアイテムが載っていなかった場合、アイテムはその辺に置く
                    Ship.makeItem(ship, room.x, room.y, id, 1, 'in');
                }
                Room.freeOji(oji);
            });
        return true;
    }
    //倉庫から指定したアイテムを探し、アイテムがあればそれが格納されている倉庫を返す
    static findItemFromWarehouse(ship: Ship, id: number) {
        let tmp: number;
        for (let i = 0; i < Ship.warehouses.length; i++) {//倉庫全部調べる
            if (Room.judgeHavingItem(Ship.warehouses[i].itemlist, id, 1) != -1) {
                tmp = i;
                break;
            }
        }
        return Ship.warehouses[tmp];
    }
    //idとstateから部屋を探す
    static findRoom(ship: Ship, id: number, state: stringRoomState) {
        for (let i = 0; i < ship.rooms.length; i++) {
            if (ship.rooms[i].id === id && ship.rooms[i].state === state) {
                return ship.rooms[i];
            }
        }
    }
    //部屋からおじさんを出す
    static removeOjiFromRoom(oji: Ojisan, room: Room) {
        for (let i = 0; i < room.ojiID.length; i++) {
            if (room.ojiID[i] == oji.id) {
                room.ojiID.splice(i, 1);
            }
        }
    }
    //部屋の全てのおじさんをフリーにする
    static allFreeOji(allOjis: Ojisan[], ojiID: number[]) {
        for (let i = 0; i < ojiID.length; i++) {
            let oji = Room.findOjisan(allOjis, ojiID[i]);
            Room.freeOji(oji);
        }
    }
    //スプライトの表示非表示を決定する
    static changeVisual(obj: TextWindow[], visual: boolean) {
        for (let i = 0; i < obj.length; i++) {
            obj[i].visible = visual;
        }
    }
    //idからおじさんを探す
    static findOjisan(ojis: Ojisan[], id: number) {
        for (let i = 0; i < ojis.length; i++) {
            if (ojis[i].id == id) return ojis[i];
        }
    }

    //Itemの強化するのに必要なアイテムリストから、Roomに必要なアイテムリストに変換する
    static listOfItemToNeedList(itemList: number[][]) {
        let needList: number[] = [];
        for (let i = 0; i < itemList.length; i++) {
            for (let j = 0; j < itemList[i][1]; j++) {//必要個数分だけリストに追加する
                needList.push(itemList[i][0]);
            }
        }
        return needList;
    }
    //全倉庫にある指定したアイテムの個数を調べる
    static countItemNum(warehouses: Room[], id: number) {
        let sum = 0;
        for (let i = 0; i < warehouses.length; i++) {
            for (let j = 0; j < warehouses[i].itemlist.length; j++) {
                if (warehouses[i].itemlist[j].id == id) {
                    sum += warehouses[i].itemlist[j].num;
                }
            }
        }
        return sum;
    }
    //戻るボタンを作成する
    static makeBackButton(x: number, y: number, closeWindow: PIXI.Container) {
        const button = new Button("戻る", 50, 30, x, y, 2, 0xcccccc, 20, 1);
        button.on("pointerup", () => {
            PIXI.Loader.shared.resources.close.sound.play();
            closeWindow.visible = false;
        });
        closeWindow.addChild(button);
        return button;
    }
    //表示専用のアイテムを作成する
    static makeDisplayItem(x: number, y: number, id: number, parent: TextWindow, intaractive: boolean) {
        let item = new Item(x, y, id, 1, 'display');
        if (intaractive) {
            item.interactive = true;
            item.buttonMode = true;
        }
        parent.addChild(item);
        return item;
    }
    //毎フレーム実行される 建築状態になったらアイテムを集めて建築を行う
    buildRoom(ship: Ship) {
        if (this.state === 'build') {
            this.texture = PIXI.Loader.shared.resources.room_building.texture;
            this.state = 'build_gathering';
            this.interactive = false;
            this.cnt = 0;
            this.needItems = Room.listOfItemToNeedList(Room.roomMakeList[this.id]);//必要リストに素材を追加
        }
        if (this.makingItem == 0 && this.needItems.length == 0 && this.state === 'build_gathering') {
            //アイテムがRoomの倉庫に揃っているかどうかを調べる
            const needItemlist = Room.roomMakeList[this.id];//[[],[]]型がくる
            let judge: boolean = true;
            for (let i = 0; i < needItemlist.length; i++) {
                if (Room.judgeHavingItem(this.itemlist, needItemlist[i][0], needItemlist[i][1]) == -1) judge = false;
            }
            if (judge) {//部屋の倉庫に部屋を作るためのアイテムが揃っていた場合
                //近くのフリーおじさんを見つける
                let oji = Room.findNearFreeOji(ship, this.x, this.y);
                if (oji !== undefined) {
                    this.state = 'build_preparation';
                    oji.state = 'working';
                    oji.tl
                        .to(oji, { duration: Room.len(oji.x, oji.y, this.x, this.y) / oji.speed + 0.01, x: this.x, y: this.y })//部屋に向かう
                        .call(() => {//部屋を作成する処理
                            oji.visible = false;
                            this.ojiID.push(oji.id);
                            this.state = 'build_using'
                            this.itemlist = [];
                            this.makeCnt = 60 * 10;
                        });
                }
            }
        } else if (this.state === 'build_using') {
            if (this.makeCnt % 60 == 0) {
                this.tilePosition.x = (this.tilePosition.x + 50) % 150;
                if (this.tilePosition.x == 0) this.tilePosition.x += 50;
            }
            if (this.makeCnt <= 0) {
                this.texture = this.defoltTexture;
                this.tilePosition.x = 0;
                this.state = 'free';
                Room.allFreeOji(ship.ojis, this.ojiID);
                this.ojiID = [];
                this.interactive = true;
                this.build = true;
                ship.addChild(Button.makeSpeech(Room.roomList[this.id] + "が完成した！", 3, 400, 50, 0, 200, 1, 20, 0.8));
            }
            this.makeCnt--;
        }
    }
    //必要リストに載っているアイテムを集める
    gatherNeedItem(ship: Ship) {
        //必要素材リストに載っているアイテムを集める
        if (this.cnt % 300 == 0) {
            for (let i = 0; i < this.needItems.length; i++) {
                Room.gatherItem(ship, this, this.needItems[i]);
            }
        }
    }
    //リストにあるアイテムが全てあるかどうかを調べる
    static jusgeFullList(needItemList: itemList[], curItemList: itemList[]) {
        let judge: boolean = true;
        for (let i = 0; i < needItemList.length; i++) {
            if (Room.judgeHavingItem(curItemList, needItemList[i][0], needItemList[i][1]) == -1) judge = false;
        }
        return judge;
    }
    abstract move(ship: Ship);
}