import * as PIXI from "pixi.js";
import { TextWindow } from "./window";
import { Ship } from "./ship";
import { Ojisan } from "./ojisan";
import { Item } from "./item";
import { MyText } from "./text";
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
type stringRoomState = 'free' | 'using' | 'gathering' | 'preparation';
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

    makingItem: number = 0;
    makeCnt: number = 0;
    loop: boolean = true;
    kind: number = 4;// 倉庫のアイテムを入れられる種類
    itemlist: itemList[] = [];//この部屋に格納されているアイテムリスト
    needItems: number[] = [];//欲しいものリスト
    id: number;
    level: number = 0;
    state: stringRoomState = "free";
    rNx: number;// 行番号
    rNy: number;// 列番号
    cnt: number = 0;// タイムカウント
    ojiID: number[] = [];//この部屋にいるおじさんのIDリスト
    ojiMax: number = 4;// おじさんを入れられる最大数
    constructor(id: number, x: number, y: number, texture: PIXI.Texture, gamescene: PIXI.Container) {
        super(texture, 50, 50);
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
    pushItemlist(id: number, num: number) {
        let tmp: itemList = { id: id, num: num };
        this.itemlist.push(tmp);
    }
    static len(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) + 1;
    }
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
        let warehouse: Room = Room.findItemFromWarehouse(ship, id);
        if (warehouse === undefined) return false;
        let oji = Room.findNearFreeOji(ship, room.x, room.y);
        if (oji === undefined) return false;
        oji.state = 'transport';
        let ojiToWarehouse = Room.len(oji.x, oji.y, warehouse.x, warehouse.y);
        let warehouseToRoom = Room.len(room.x, room.y, warehouse.x, warehouse.y);
        oji.tl
            .to(oji, { duration: ojiToWarehouse / oji.speed, x: warehouse.x, y: warehouse.y })
            .call(() => {
                let tmp = Room.judgeHavingItem(warehouse.itemlist, id, 1);
                if (tmp != -1) {//おじさんが倉庫にたどり着いた時にアイテムが格納されている場合
                    warehouse.itemlist[tmp].num--;
                    Room.stickItemToOji(oji, id);
                    PIXI.Loader.shared.resources.open.sound.play();
                } else {
                    Room.freeOji(oji);
                }
            })
            .to(oji, { duration: warehouseToRoom / oji.speed, x: room.x, y: room.y })
            .call(() => {
                let tmp = Room.judgeHavingItem(room.itemlist, id, 1);
                if (tmp != -1) {
                    room.itemlist[tmp].num++;
                } else {
                    room.pushItemlist(id, 1);
                }
                for (let i = 0; i < room.needItems.length; i++) {
                    if (room.needItems[i] == id) {//欲しいものリストから取り除く
                        room.needItems.splice(i, 1);
                    }
                }
                Room.freeOji(oji);
            });
        return true;
    }
    //倉庫から指定したアイテムを探す
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
    static changeVisual(obj: PIXI.TilingSprite[], visual: boolean) {
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
    static makeBackButton(x: number, y: number, closeWindow: TextWindow) {
        let button = new Button("戻る", 50, 30, x, y, 2, 0xcccccc, 20, 1);
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
    abstract move(ship: Ship);
}