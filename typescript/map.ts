import * as PIXI from "pixi.js";
import gsap from "gsap";
import { Ship } from "./ship";
import { itemList, Room } from "./room";
import { MyText } from "./myText";
import { Item } from "./item";
import { Stage } from "./stage";
import { BackWindow } from "./backWindow";

export class Map extends BackWindow {
    //sI color,x,y
    sI: number[][] = [[0xdddd33, 15, 15], [0xdddd33, 55, 15], [0xdddd33, 92, 51], [0xdddd33, 47, 82], [0xdddd33, 103, 103]];
    ojisanIcon: PIXI.Sprite;//マップ選択アイコン
    map: PIXI.Sprite;//マップ
    mapCursor: PIXI.Sprite;//カーソル
    currentCursor: PIXI.Sprite;//現在位置のカーソル
    selectMapId: number;//現在選んでいるマップのID
    sellingItems: Item[] = [];//売っているアイテムのアイコン
    distanceText: MyText;//消費燃料表示テキスト
    constructor(ship: Ship) {
        super(0,0,1,1,1,1,false);
        const tl = gsap.timeline();//タイムライン初期化
        this.selectMapId = 0;
        this.interactive = true;
        this.sortableChildren = true;
        this.zIndex = 100;//最前面表示
        this.alpha = 1;
        this.visible = false;
        //「クエスト一覧」テキスト作成
        this.addChild(new MyText("全体マップ", 150, 0, 1, 24, 32, 0x4545dd));
        this.setContentText(Stage.stageInfo[0].name);//初期マップ名表示
        //売ってるアイテムアイコン作成
        for (let i = 0; i < 10; i++) {
            this.sellingItems.push(Room.makeDisplayItem(35 * (i + 1), 80, 1, this, false));
            this.addChild(this.sellingItems[i]);
        }
        //燃費テキスト
        this.distanceText = new MyText("", 20, 100, 1, 24, 35, 0x333333);
        this.addChild(this.distanceText);
        //全体マップ作成
        this.map = new PIXI.Sprite(PIXI.Loader.shared.resources["map"].texture);
        this.map.sortableChildren = true;
        this.map.position.set(20, 200);
        this.map.scale.set(0.9, 0.9);
        this.addChild(this.map);
        //マップカーソル作成
        this.mapCursor = new PIXI.Sprite(PIXI.Loader.shared.resources["cursor"].texture);
        this.mapCursor.zIndex = 5;
        this.mapCursor.anchor.set(0.5);
        this.mapCursor.position.set(15, 15);
        this.mapCursor.interactive = true;
        this.map.addChild(this.mapCursor);
        tl.from(this.mapCursor, { duration: 2, rotation: Math.PI * 2, repeat: -1, ease: "none" });
        //現在地カーソル作成
        this.currentCursor = new PIXI.Sprite(PIXI.Loader.shared.resources["cursor2"].texture);
        this.currentCursor.zIndex = 4;
        this.currentCursor.anchor.set(0.5);
        this.currentCursor.scale.set(0.7);
        this.map.addChild(this.currentCursor);

        //マップアイコン作成
        for (let i = 0; i < this.sI.length; i++) {
            const mapIcon = new PIXI.Sprite();
            mapIcon.interactive = true;
            const backColor = new PIXI.Graphics(); // グラフィックオブジェクト（背景に半透明な四角を配置するために使用）
            backColor.beginFill(this.sI[i][0], 1); // 色、透明度を指定して描画開始
            backColor.drawCircle(this.sI[i][1], this.sI[i][2], 12);//円描画
            backColor.endFill(); // 描画完了
            mapIcon.addChild(backColor); // 背景をボタンコンテナに追加
            mapIcon.on('pointertap', () => {
                this.selectMapId = i;//選択ステージ記憶
                gsap.core.Tween.to(this.mapCursor.position, { duration: 0.2, x: this.sI[this.selectMapId][1], y: this.sI[this.selectMapId][2] });
                this.updateDisplay(ship.stageID, i, ship.fuel,ship.going);
            });
            this.map.addChild(mapIcon);
        }
        this.mapCursor.on("pointertap", () => {
            const distance = Map.getDistanceOfMapToMap(ship.stageID, this.selectMapId);
            if (distance != -1 && !ship.going&&ship.fuel>0) {//マップが繋がっている時,燃料がある時
                PIXI.Loader.shared.resources.letsGo.sound.play();//掛け声
                this.visible = false;
                this.distanceText.setText("");
                ship.shop.setBuyingProduct(Stage.stageInfo[this.selectMapId].sellList);//店売り商品セット
                ship.quest.setQuestList(Stage.stageInfo[this.selectMapId].questList);//クエストセット
                ship.bar.setTalkList(Stage.stageInfo[this.selectMapId].barList);//小話セット
                ship.distStageID = this.selectMapId;//目的地設定
                ship.goalPosition = distance;//目的地までの距離設定
                ship.going = true;//出発！
            }
        });
        this.updateDisplay(0, 0, ship.fuel,ship.going);
    }
    display(ship: Ship) {
        if (this.visible) {
            this.currentCursor.position.set(this.sI[ship.stageID][1] + (this.sI[ship.distStageID][1] - this.sI[ship.stageID][1]) * ship.mapPosition / ship.goalPosition, this.sI[ship.stageID][2] - 5);
        }
    }
    //マップが繋がっていればマップ同士の距離を返す。繋がってなければ-1を返す
    static getDistanceOfMapToMap(mapID1: number, mapID2: number) {
        const linkList = Stage.stageInfo[mapID1].linkList;
        for (let i = 0; i < linkList.length; i++) {
            if (linkList[i][0] == mapID2) return linkList[i][1];
        }
        return -1;
    }
    updateDisplay(currentStageID: number, selectStageID: number, fuel: number,going:boolean) {
        this.setContentText(Stage.stageInfo[selectStageID].name);//選択ステージ名更新
        const distance = Map.getDistanceOfMapToMap(currentStageID, selectStageID);
        const resultFuel = fuel - distance;
        if (distance != -1&&!going) this.distanceText.setText("燃料:" + fuel + " >> " + resultFuel);
        else this.distanceText.setText("");
        const sellingList = Stage.stageInfo[this.selectMapId].sellList;
        for (let i = 0; i < 10; i++) {//店売りアイテムアイコン更新
            if (i < sellingList.length) Item.changeItem(this.sellingItems[i], sellingList[i][0]);
            else Item.changeItem(this.sellingItems[i], 0);
        }
    }
}