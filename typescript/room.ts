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
interface makeItemInfo {
    id: number;
    need: itemList[];
    num: number;
}
interface roomInfo {
    name: string,//部屋の名前
    need: itemList[],//必要なアイテムリスト
    exFunc: any[][],//拡張時に実行される種類　０HP　１収容アイテム種類増加　２作成アイテム拡張　３おじさん拡張 解放されるレベル
    time: number,//作成にかかる時間
    texture: string//部屋のテクスチャネーム
}
export type stringRoomState = 'free' | 'using' | 'gathering' | 'preparation' | 'build' | 'ex';
export abstract class Room extends PIXI.TilingSprite {
    static roomInfo: roomInfo[] = [
        {
            name: '壁',
            need: [],
            exFunc: [],
            time: 0,
            texture: "room_wall"
        }, {
            name: '通路',
            need: [],
            exFunc: [],
            time: 0,
            texture: "room_aisle"
        }, {
            name: '倉庫',
            need: [{ id: 7, num: 3 }, { id: 8, num: 2 }],
            exFunc: [[0, "装甲拡張", [{ id: 7, num: 2 }], 1], [1, "容量拡張1", [{ id: 7, num: 1 }], 1], [1, "容量拡張2", [{ id: 7, num: 2 }], 2]],
            time: 0,
            texture: "room_warehouse"
        }, {
            name: 'ベッド',
            need: [{ id: 16, num: 1 }, { id: 17, num: 1 }],
            exFunc: [],
            time: 0,
            texture: "room_bed"
        }, {
            name: '作業場',
            need: [{ id: 6, num: 5 }],
            exFunc: [[4, "スロット拡張", [{ id: 7, num: 2 }], 1]],
            time: 0,
            texture: "room_work"
        }, {
            name: 'エンジン',
            need: [{ id: 18, num: 1 }, { id: 19, num: 1 }],
            exFunc: [],
            time: 0,
            texture: "room_engine"
        }
    ];
    ship: Ship;//船
    oneLayerWindow: RoomWindow;//第１層バックウィンドウ
    oneLayerItems: Item[] = [];//第１層のアイテムアイコン
    twoLayerWindows: BackWindow[] = [];//第２層のバックウィンドウ
    twoLayerItems: Item[] = [];//第２層のアイテムアイコン
    build: boolean;//建てられたかどうか
    ex: boolean;//拡張しているかどうか
    makingItem: number[] = [];//作っているアイテムのID
    funcInfo: number = 0;//拡張する機能のID
    makeCnt: number = 0;//アイテムを作るときに使うカウント
    loop: boolean = false;//アイテムをループで作るかどうか
    kind: number = 4;// 倉庫のアイテムを入れられる種類
    itemlist: itemList[] = [];//この部屋に格納されているアイテムリスト
    makableItems: makeItemInfo[] = [];//作成できるアイテムのrecipe
    needItems: number[] = [];//欲しいものリスト
    makingItemIcons: Item[] = [];//作成リストのアイテムアイコン
    makingItemSlots: PIXI.Graphics[] = [];//アイテムスロット
    loopSwitch: Button;//ループボタン
    defaultTexture: PIXI.Texture;
    id: number;//部屋ID
    HPLevel: number;//体力のレベル
    kindLevel: number;//収容レベル
    itemLevel: number;//アイテムレベル
    ojiLevel: number;//おじさん収容力レベル
    slotLevel: number;//スロットレベル
    state: stringRoomState;
    rNx: number;// 行番号
    rNy: number;// 列番号
    cnt: number = 0;// タイムカウント
    ojiID: number[] = [];//この部屋にいるおじさんのIDリスト
    ojiMax: number = 4;// おじさんを入れられる最大数
    constructor(ship: Ship, id: number, x: number, y: number, texture: PIXI.Texture, gamescene: PIXI.Container, state: stringRoomState) {
        super(texture, 50, 50);
        this.ship = ship;
        //部屋がクリックされたときの処理
        this.on("pointerup", () => {
            PIXI.Loader.shared.resources.open.sound.play();
            this.oneLayerWindow.visible = true;
        });
        this.defaultTexture = texture;
        this.state = state;
        this.HPLevel = 1;
        this.kindLevel = 1;
        this.itemLevel = 1;
        this.ojiLevel = 1;
        this.slotLevel = 1;
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
    //指定したアイテムリストの中にアイテムがあるかどうかをしらべる
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
        if (ship.freeOjis.length == 0) return false;//フリーおじさんがいない場合終了
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
            if (item === undefined) return false;//地面にも落ちてなかった場合終了
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
                ship.makeItem(room.x, room.y, id, 1, 'in');
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
    //部屋からおじさんを出す
    static removeOjiFromRoom(oji: Ojisan, room: Room) {
        const index = room.ojiID.indexOf(oji.id);
        if (index !== -1) room.ojiID.splice(index, 1);
    }
    //部屋の全てのおじさんをフリーにする
    static freeAllOji(allOjis: Ojisan[], ojiID: number[]) {
        for (let i = 0; i < ojiID.length; i++) {
            const oji = Room.findOjisan(allOjis, ojiID[i]);
            Room.freeOji(oji);
        }
    }
    //おじさんのリストから指定したIDのおじさんを探す
    static findOjisan(ojis: Ojisan[], id: number) {
        return ojis.find((v) => v.id == id);
    }
    //Itemの強化するのに必要なアイテムリストから、Roomに必要なアイテムリストに変換する
    static listOfItemToNeedList(itemList: itemList[]) {
        const needList: number[] = [];
        for (let i = 0; i < itemList.length; i++) {
            for (let j = 0; j < itemList[i].num; j++) {//必要個数分だけリストに追加する
                needList.push(itemList[i].id);
            }
        }
        return needList;
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
        if (!this.build) {
            //建築予約された場合
            if (this.state === 'build') {
                this.texture = PIXI.Loader.shared.resources.room_building.texture;//建築テクスチャを表示
                this.state = 'gathering';//アイテム収集
                this.needItems = Room.listOfItemToNeedList(Room.roomInfo[this.id].need);//必要リストに素材を追加
            }
            //建築に必要な素材が集まった場合
            if (this.needItems.length == 0 && this.state === 'gathering') {
                //アイテムがRoomの倉庫に揃っているかどうかを判定する
                const needItemlist: itemList[] = Room.roomInfo[this.id].need;//必要素材リストを取得
                //部屋の倉庫に部屋を作るためのアイテムが揃っていた場合
                if (Room.judgeFullList(needItemlist, this.itemlist)) {
                    const oji = Room.findNearFreeOji(ship, this.x, this.y);//近くのフリーおじさんを見つける
                    //おじさんがいた場合工事を開始する
                    if (oji !== undefined) this.koujiOji(oji, needItemlist);
                }
            }
            //建築
            if (this.state === 'using') {
                this.buildOji(ship, "が完成した！");
            }
        }
    }
    //準備から建設に至るまでの処理
    koujiOji(oji: Ojisan, needItemlist: itemList[]) {
        this.state = 'preparation';
        oji.state = 'working';
        oji.tl
            .to(oji, { duration: Room.len(oji.x, oji.y, this.x, this.y) / oji.speed + 0.01, x: this.x, y: this.y })//部屋に向かう
            .call(() => {//部屋を作成する処理
                PIXI.Loader.shared.resources.building.sound.play();//工事の音を再生
                oji.visible = false;//おじさんを非表示
                this.ojiID.push(oji.id);//おじさんを部屋に格納
                this.state = 'using';
                this.consumeItem(this.itemlist, needItemlist);//アイテムリストから必要アイテムを削除
                this.makeCnt = 60 * 10;//部屋完成にかかる時間
            });
    }
    //建設中から建設完了に至るまでの処理
    buildOji(ship: Ship, text: String) {
        if (this.makeCnt % 60 == 0) {
            this.tilePosition.x = (this.tilePosition.x + 50) % 150;
            if (this.tilePosition.x == 0) this.tilePosition.x += 50;
        }
        this.makeCnt--;
        if (this.makeCnt <= 0) {
            this.texture = this.defaultTexture;
            this.tilePosition.x = 0;
            this.state = 'free';
            Room.freeAllOji(ship.ojis, this.ojiID);
            this.ojiID = [];
            this.build = true;
            //拡張の場合の処理
            if (this.ex) {
                const exKind = this.funcInfo[0];//拡張の種類を取得
                //レベルを上げる
                switch (exKind) {
                    case 0:
                        this.HPLevel++;
                        break;
                    case 1:
                        this.kindLevel++;
                        break;
                    case 2:
                        this.itemLevel++;
                        break;
                    case 3:
                        this.ojiLevel++;
                        break;
                    case 4:
                        this.slotLevel++;
                        this.makeItemSlot();
                        break;
                }
                this.ex = false;
            }
            PIXI.Loader.shared.resources.complete.sound.play();
            ship.addChild(Button.makeSpeech(Room.roomInfo[this.id].name + text, 0xdd3333, 3, 400, 25, 0, 200, 1, 20, 0.8));
        }
    }
    //部屋の機能を拡張する
    exRoom(ship: Ship) {
        if (this.build && this.ex) {
            //拡張予約された場合
            if (this.state === 'ex') {
                this.texture = PIXI.Loader.shared.resources.room_building.texture;//建築テクスチャを表示
                this.state = 'gathering';//アイテム収集
                this.needItems = Room.listOfItemToNeedList(this.funcInfo[2]);//必要リストに素材を追加
                this.makeCnt = 0;//メイクカウントリセット
            }
            if (this.needItems.length == 0 && this.state === 'gathering') {
                //アイテムがRoomの倉庫に揃っているかどうかを判定する
                const needItemlist: itemList[] = this.funcInfo[2];//必要素材リストを取得
                //部屋の倉庫に部屋を作るためのアイテムが揃っていた場合
                if (Room.judgeFullList(needItemlist, this.itemlist)) {
                    const oji = Room.findNearFreeOji(ship, this.x, this.y);//近くのフリーおじさんを見つける
                    //おじさんがいた場合工事を開始する
                    if (oji !== undefined) this.koujiOji(oji, needItemlist);
                }
            }
            if (this.state == 'using') {
                this.buildOji(ship, "を拡張した！");
            }
        }
    }
    //リストのアイテムをアイテムリストから消費する formが元のアイテムリスト
    consumeItem(formItemList: itemList[], otherItemList: itemList[]) {
        for (let i = 0; i < otherItemList.length; i++) {
            const item = formItemList.find((v) => v.id === otherItemList[i].id);
            item.num -= otherItemList[i].num;
            if (item.num < 0) item.num = 0;
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
    //ウィンドウの表示非表示を一括で操作する
    static changeVisual(obj: TextWindow[], visual: boolean) {
        for (let i = 0; i < obj.length; i++) {
            obj[i].visible = visual;
        }
    }
    //拡張開始する
    startEx(info) {
        if (this.state === 'free') {
            this.state = 'ex';//アイテム収集開始
            this.funcInfo = info;//拡張するID
            this.cnt = 0;
            this.ex = true;//拡張中
            this.oneLayerWindow.exWindow.visible = false;
            this.oneLayerWindow.visible = false;
        }
    }
    //拡張メニューを更新する
    updateEx(ship: Ship) {
        if (this.oneLayerWindow.exWindow.visible) {
            let exfunc = Room.roomInfo[this.id].exFunc.slice();
            //現在表示する拡張を抽出する
            for (let i = 0; i < exfunc.length; i++) {
                let judge = false;
                switch (exfunc[i][0]) {
                    case 0:
                        if (exfunc[i][3] != this.HPLevel) judge = true;
                        break;
                    case 1:
                        if (exfunc[i][3] != this.kindLevel) judge = true;
                        break;
                    case 2:
                        if (exfunc[i][3] != this.itemLevel) judge = true;
                        break;
                    case 3:
                        if (exfunc[i][3] != this.ojiLevel) judge = true;
                        break;
                }
                if (judge) {
                    exfunc.splice(i, 1);
                    i--;
                }
            }
            //拡張機能の表示
            for (let i = 0; i < exfunc.length; i++) {
                this.oneLayerWindow.exTitles[i].text = exfunc[i][1];
                const item = exfunc[i][2][0];
                Item.changeItem(this.oneLayerWindow.exItemIcon[i], item.id);
                this.oneLayerWindow.exItemName[i].text = Item.itemInfo[item.id].name + "(" + ship.countItemNum(item.id, true) + ")×" + item.num;
                this.oneLayerWindow.exButtons[i].visible = true;
                this.oneLayerWindow.exButtons[i].removeListener("pointerup");
                this.oneLayerWindow.exButtons[i].on("pointerup", () => {
                    if (this.state === 'free') this.startEx(exfunc[i]);
                });
            }
            //拡張機能の非表示
            for (let i = exfunc.length; i < 3; i++) {
                this.oneLayerWindow.exTitles[i].text = "";
                Item.changeItem(this.oneLayerWindow.exItemIcon[i], 0);
                this.oneLayerWindow.exItemName[i].text = "";
                this.oneLayerWindow.exButtons[i].visible = false;

            }
        }
    }
    //アイテムを作成してくれる関数
    makeItem(ship: Ship) {
        if (this.makingItem.length != 0) {
            //アイテムが揃ったらアイテム作成開始
            if (this.needItems.length == 0 && this.state === 'gathering') {
                const result = this.makableItems.find((v) => v.id === this.makingItem[0]);
                if (Room.judgeFullList(result.need, this.itemlist)) {//欲しいアイテムがRoomのItemListに揃っている場合
                    let oji = Room.findNearFreeOji(ship, this.x, this.y);//近くのフリーおじさんを見つける
                    if (oji !== undefined) {//フリーおじさんがいた場合
                        this.state = 'preparation';
                        oji.state = 'working';
                        oji.tl
                            .to(oji, { duration: Room.len(oji.x, oji.y, this.x, this.y) / oji.speed + 0.01, x: this.x, y: this.y })
                            .call(() => {
                                if (this.state === 'preparation') {
                                    oji.visible = false;
                                    this.ojiID.push(oji.id);
                                    this.state = 'using'
                                    this.itemlist = [];
                                    this.makeCnt = 60 * 10;
                                } else {
                                    oji.state = 'free';
                                }
                            });
                    }
                }
            } else if (this.state === 'using') {
                if (this.makeCnt % 60 == 0) {
                    this.tilePosition.x = (this.tilePosition.x + 50) % 150;
                    if (this.tilePosition.x == 0) this.tilePosition.x += 50;
                }
                if (this.makeCnt <= 0) {
                    this.tilePosition.x = 0;
                    this.state = 'free';
                    Room.freeAllOji(ship.ojis, this.ojiID);
                    this.ojiID = [];
                    ship.makeItem(this.x, this.y, this.makingItem[0], 1, 'made');
                    if (this.loop) {
                        this.makingItem.push(this.makingItem[0]);
                    }
                    this.makingItem.splice(0, 1);
                    if (!this.loop) this.updateMakingItemIcon();
                }
                this.makeCnt--;
            }
        }
    }
    //アイテム作成を開始する関数
    startMakeItem() {
        if (this.state === 'free' && this.makingItem.length > 0) {
            this.state = 'gathering';//アイテム収集開始
            const item = this.makableItems.find((v) => v.id === this.makingItem[0]);
            this.needItems = Room.listOfItemToNeedList(item.need);//必要リストに素材を追加
            this.cnt = 0;
            this.updateMakingItemIcon();
        }
    }
    //作成中のアイテムアイコンを更新する関数
    updateMakingItemIcon() {
        for (let i = 0; i < this.makingItemIcons.length; i++) {
            this.makingItemIcons[i].destroy();
        }
        this.makingItemIcons = [];
        for (let i = 0; i < this.makingItem.length; i++) {
            this.makingItemIcons.push(this.ship.makeItem(33 + 32 * i, 500, this.makingItem[i], 1, 'display'));
            this.makingItemIcons[i].zIndex = 5;//最前面表示
            this.makingItemIcons[i].interactive = true;
            this.makingItemIcons[i].buttonMode = true;
            this.makingItemIcons[i].on("pointertap", () => {
                this.stopMakeItem(i);
            });
            this.oneLayerWindow.addChild(this.makingItemIcons[i]);
        }
    }
    //アイテムスロットを作成する
    makeItemSlot() {
        for (let i = 0; i < this.makingItemSlots.length; i++) {
            this.makingItemSlots[i].destroy();
        }
        if (this.loopSwitch !== undefined) this.loopSwitch.destroy();
        this.makingItemSlots = [];
        //アイテムスロット生成
        for (let i = 0; i < this.slotLevel; i++) {
            const backColor = new PIXI.Graphics(); // グラフィックオブジェクト（背景に半透明な四角を配置するために使用）
            backColor.beginFill(0xcccccc, 1); // 色、透明度を指定して描画開始
            backColor.drawRect(0, 0, 32, 32); // 位置(0,0)を左上にして、width,heghtの四角形を描画
            backColor.endFill(); // 描画完了
            backColor.lineStyle(1, 0xff3333);
            backColor.drawRect(0, 0, 32, 32);
            backColor.position.set(18 + 32 * i, 484);
            this.makingItemSlots.push(backColor);
            this.oneLayerWindow.addChild(backColor);
        }
        //ループスイッチ生成
        this.loopSwitch = new Button("単", 32, 32, 400 - 17 - 32, 484, 10, 0x3333ff, 22, 1, true);
        if (this.loop) {
            this.loopSwitch.buttonText.text = "繰";
        } else {
            this.loopSwitch.buttonText.text = "単";
        }
        this.loopSwitch.on("pointertap", () => {
            if (this.loop) {
                this.loop = false;
            } else {
                this.loop = true;
            }
            if (this.loop) {
                this.loopSwitch.buttonText.text = "繰";
            } else {
                this.loopSwitch.buttonText.text = "単";
            }
        })
        this.oneLayerWindow.addChild(this.loopSwitch);
    }
    //アイテム収集中とおじさん招集中のみキャンセル可能
    stopMakeItem(order: number) {
        if (order == 0) {
            if (this.state === 'gathering' || this.state === 'preparation') {
                this.needItems = [];
                this.extractItem();
                this.makingItem.splice(order, 1);
                this.state = 'free';
            }
        } else {
            this.makingItem.splice(order, 1);
        }
        this.updateMakingItemIcon();
    }
    //部屋のアイテムを全て吐き出す
    extractItem() {
        for (let i = 0; i < this.itemlist.length; i++) {
            this.ship.makeItem(this.x, this.y, this.itemlist[i].id, this.itemlist[i].num, 'in');
        }
        this.itemlist = [];
    }
    //ステータステキストを更新する
    updateStatusText() {
        if (this.oneLayerWindow.visible) {
            let text = "";
            switch (this.state) {
                case 'free':
                    text = "";
                    break;
                case 'gathering':
                    text = "アイテム収集中";
                    break;
                case 'preparation':
                    text = "おじさん招集中";
                    break;
                case 'build':
                    text = "建設中";
                    break;
                case 'using':
                    text = "使用中";
                    break;
                case 'ex':
                    text = "拡張中";
                    break;
            }
            this.oneLayerWindow.setFooterText(text);
        }

    }
    //部屋が従う法則
    world() {
        this.updateStatusText();//状態表示を更新する関数
        this.buildRoom(this.ship);//部屋を立ててくれる関数
        this.gatherNeedItem(this.ship);//必要なアイテムを自動で集めてくれる関数
        this.exRoom(this.ship);//部屋を拡張してくれる関数
        this.updateEx(this.ship);//拡張機能の表示を更新してくれる関数
        this.makeItem(this.ship);//アイテムを作成してくれる関数
        this.startMakeItem();//アイテム作成を開始する関数
        this.cnt++;//カウントアップ
    }
    //抽象メソッド
    abstract move();
}