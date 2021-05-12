import * as PIXI from "pixi.js";
import { TextWindow } from "./textWindow";
import { Ship } from "./ship";
import { Ojisan } from "./ojisan";
import { Item } from "./item";
import { MyText } from "./myText";
import { Button } from "./button";
import { BackWindow } from "./backWindow";
import { RoomWindow } from "./roomWindow";

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
export interface itemList {
    id: number;
    num: number;
}
interface roomInfo {
    name: string,//部屋の名前
    need: itemList[],//必要なアイテムリスト
    time: number,//作成にかかる時間
    texture: string//部屋のテクスチャネーム
}
export type stringRoomState = 'free' | 'using' | 'gathering' | 'preparation' | 'build' | 'build_gathering' | 'build_preparation' | 'build_using';
export abstract class Room extends PIXI.TilingSprite {
    static roomInfo: roomInfo[] = [
        {
            name: '壁',
            need: [],
            time: 0,
            texture: "room_wall"
        }, {
            name: '通路',
            need: [],
            time: 0,
            texture: "room_aisle"
        }, {
            name: '倉庫',
            need: [{ id: 7, num: 3 }, { id: 8, num: 2 }],
            time: 0,
            texture: "room_warehouse"
        }, {
            name: 'ベッド',
            need: [{ id: 16, num: 1 }, { id: 17, num: 1 }],
            time: 0,
            texture: "room_bed"
        }, {
            name: '作業場',
            need: [{ id: 6, num: 5 }],
            time: 0,
            texture: "room_work"
        }, {
            name: 'エンジン',
            need: [{ id: 18, num: 1 }, { id: 19, num: 1 }],
            time: 0,
            texture: "room_engine"
        }
    ];
    oneLayerWindow: RoomWindow;//第１層バックウィンドウ
    oneLayerItems: Item[] = [];//第１層のアイテムアイコン
    twoLayerWindows: BackWindow[] = [];//第２層のバックウィンドウ
    twoLayerItems: Item[] = [];//第２層のアイテムアイコン
    build: boolean;//建てられたかどうか
    makingItem: number = 0;//作っているアイテムのID
    makeCnt: number = 0;//アイテムを作るときに使うカウント
    loop: boolean = true;//アイテムをループで作るかどうか
    kind: number = 4;// 倉庫のアイテムを入れられる種類
    itemlist: itemList[] = [];//この部屋に格納されているアイテムリスト
    needItems: number[] = [];//欲しいものリスト
    defaultTexture: PIXI.Texture;
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
        //部屋がクリックされたときの処理
        this.on("pointerup", () => {
            PIXI.Loader.shared.resources.open.sound.play();
            this.oneLayerWindow.visible = true;
        });
        this.defaultTexture = texture;
        this.state = state;
        this.level = 1;
        if (this.state === 'build') this.build = false;
        else this.build = true;
        this.id = id;//部屋のID
        this.anchor.set(0.5);//ローカル座標の始点を真ん中にする
        this.x = x;// 部屋のｘ座標
        this.y = y;// 部屋のｙ座標
        this.zIndex = -1;//部屋のｚ座標
        this.oneLayerWindow = new RoomWindow(0, 0, 1, 1, 1, 1, false);//ウィンドウ生成
        this.oneLayerWindow.setTitleText(Room.roomInfo[id].name);//タイトルテキスト表示
        this.oneLayerWindow.exWindow.setTitleText(Room.roomInfo[id].name + "拡張");//拡張タイトルテキスト表示
        gamescene.addChild(this.oneLayerWindow);//ウィンドウを子にする
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
        if (ship.freeOjis.length == 0) return false;//フリーおじさんがいない場合
        const warehouse: Room = Room.findItemFromWarehouse(ship, id);//倉庫から指定したアイテムを探す
        let mode = 0;
        let item: Item;
        if (warehouse === undefined) {//アイテムを持っている倉庫が無かった場合
            for (let i = 0; i < ship.items.length; i++) {
                if (ship.items[i].id == id && ship.items[i].state === 'in') {//欲しいアイテムが地面に落ちていた場合
                    ship.items[i].state = "reserved";//アイテムを予約
                    item = ship.items[i];//アイテム情報を取得
                    mode = 1;//モード変更
                    break;
                }
            }
            if (item === undefined) return false;//地面にも落ちてなかった場合
        };
        const oji = Room.findNearFreeOji(ship, room.x, room.y);//一番近くのフリーおじさんを探す
        oji.state = 'transport';//おじさんの状態を輸送状態に変更
        if (mode == 0) {//倉庫からアイテムを持ってくる場合
            oji.tl
                .to(oji, { duration: Room.len(oji.x, oji.y, warehouse.x, warehouse.y) / oji.speed, x: warehouse.x, y: warehouse.y })//倉庫に向かう
                .call(() => {//おじさんが倉庫からアイテムを取りだす処理
                    const tmp = Room.judgeHavingItem(warehouse.itemlist, id, 1);
                    if (tmp != -1) {//おじさんが倉庫にたどり着いた時にアイテムが格納されている場合
                        PIXI.Loader.shared.resources.open.sound.play();
                        warehouse.itemlist[tmp].num--;
                        Room.stickItemToOji(oji, id);
                    } else {//おじさんがたどり着いた頃にはもう必要なアイテムは倉庫になかった場合
                        Room.freeOji(oji);
                    }
                })
                .to(oji, { duration: Room.len(room.x, room.y, warehouse.x, warehouse.y) / oji.speed, x: room.x, y: room.y })//対称の部屋に向かう
        } else {//地面のアイテムを持ってくる場合
            oji.tl
                .to(oji, { duration: Room.len(oji.x, oji.y, item.x, item.y) / oji.speed, x: item.x, y: item.y })//アイテムに向かう
                .call(() => {//おじさんが倉庫からアイテムを取りだす処理
                    if (item.state === 'reserved') {
                        Room.stickItemToOji(oji, id);//アイテムをおじさんにくっつける
                        item.state = 'garbage';//アイテムを破棄
                    } else {//おじさんがたどり着いた頃にはもう必要なアイテムはなかった場合
                        Room.freeOji(oji);//おじさんを解放
                    }
                })
                .to(oji, { duration: Room.len(room.x, room.y, item.x, item.y) / oji.speed, x: room.x, y: room.y })//対称の部屋に向かう
        }
        oji.tl.call(() => {//持ってきたアイテムを格納する処理
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
        for (let i = 0; i < ship.warehouses.length; i++) {//倉庫全部調べる
            if (Room.judgeHavingItem(ship.warehouses[i].itemlist, id, 1) != -1) {
                tmp = i;
                break;
            }
        }
        return ship.warehouses[tmp];
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
    static listOfItemToNeedList(itemList: itemList[]) {
        let needList: number[] = [];
        for (let i = 0; i < itemList.length; i++) {
            for (let j = 0; j < itemList[i].num; j++) {//必要個数分だけリストに追加する
                needList.push(itemList[i].id);
            }
        }
        return needList;
    }
    //全倉庫にある指定したアイテムの個数を調べる
    static countItemNum(ship: Ship, id: number, inItemCount: boolean) {
        let sum = 0;
        //倉庫の中のアイテム
        for (let i = 0; i < ship.warehouses.length; i++) {
            for (let j = 0; j < ship.warehouses[i].itemlist.length; j++) {
                if (ship.warehouses[i].itemlist[j].id == id) {
                    sum += ship.warehouses[i].itemlist[j].num;
                }
            }
        }
        //船の中のアイテム
        if (inItemCount) {
            for (let i = 0; i < ship.items.length; i++) {
                const item = ship.items[i];
                if (item.id === id && item.state !== 'garbage' && item.state !== 'out') sum += item.num;
            }
        }
        return sum;
    }
    //表示専用のアイテムを作成する
    static makeDisplayItem(x: number, y: number, id: number, parent: PIXI.Sprite, intaractive: boolean) {
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
        this.cnt++;
        if (this.state === 'build') {
            this.texture = PIXI.Loader.shared.resources.room_building.texture;
            this.state = 'build_gathering';
            this.interactive = false;
            this.cnt = 0;
            this.needItems = Room.listOfItemToNeedList(Room.roomInfo[this.id].need);//必要リストに素材を追加
        }
        if (this.makingItem == 0 && this.needItems.length == 0 && this.state === 'build_gathering') {
            //アイテムがRoomの倉庫に揃っているかどうかを調べる
            const needItemlist: itemList[] = Room.roomInfo[this.id].need;//型がくる
            let judge: boolean = true;
            for (let i = 0; i < needItemlist.length; i++) {
                if (Room.judgeHavingItem(this.itemlist, needItemlist[i].id, needItemlist[i].num) == -1) judge = false;
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
                            PIXI.Loader.shared.resources.building.sound.play();
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
                this.texture = this.defaultTexture;
                this.tilePosition.x = 0;
                this.state = 'free';
                Room.allFreeOji(ship.ojis, this.ojiID);
                this.ojiID = [];
                this.interactive = true;
                this.build = true;
                PIXI.Loader.shared.resources.complete.sound.play();
                ship.addChild(Button.makeSpeech(Room.roomInfo[this.id].name + "が完成した！", 0xdd3333, 3, 400, 25, 0, 200, 1, 20, 0.8));
            }
            this.makeCnt--;
        }
    }
    //必要リストに載っているアイテムを集める
    gatherNeedItem(ship: Ship) {
        //必要素材リストに載っているアイテムを集める
        if (this.cnt % 300 == 1) {
            for (let i = 0; i < this.needItems.length; i++) {
                Room.gatherItem(ship, this, this.needItems[i]);
            }
        }
    }
    //リストにあるアイテムが全てあるかどうかを調べる
    static judgeFullList(needItemList: itemList[], curItemList: itemList[]) {
        let judge: boolean = true;
        for (let i = 0; i < needItemList.length; i++) {
            if (Room.judgeHavingItem(curItemList, needItemList[i].id, needItemList[i].num) == -1) judge = false;
        }
        return judge;
    }
    abstract move(ship: Ship);
}