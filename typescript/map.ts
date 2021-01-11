import * as PIXI from "pixi.js";
import gsap from "gsap";
import { Button } from "./button";
import { Ship } from "./ship";
import { itemList, Room } from "./room";
import { simpleWindow } from "./simpleWindow";
import { MyText } from "./myText";
import { Item } from "./item";
import { TextWindow } from "./window";
import { Stage } from "./stage";

export class Map extends PIXI.Sprite {
    //sI groupid,x,y
    sI: number[][] = [[0xdddd33, 15, 15], [0xdddd33, 55, 15]];
    backButton: Button;//戻るボタン
    oneLayerTitleText: MyText;//マップ名テキスト
    ojisanIcon: PIXI.Sprite;//マップ選択アイコン
    map: PIXI.Sprite;//マップ
    mapCursor: PIXI.Sprite;//カーソル
    selectMapId: number;//現在選んでいるマップのID
    constructor(ship: Ship) {
        super(PIXI.Loader.shared.resources.window.texture);
        const tl = gsap.timeline();//タイムライン初期化
        this.selectMapId = 0;
        this.interactive = true;
        this.sortableChildren = true;
        this.zIndex = 100;//最前面表示
        this.alpha = 1;
        this.visible = false;
        //戻るボタン作成
        this.backButton = Room.makeBackButton(0, 0, this);
        //「クエスト一覧」テキスト作成
        this.addChild(new MyText("全体マップ", 150, 0, 1, 24, 32, 0x4545dd));
        //マップ名テキスト作成
        this.oneLayerTitleText = new MyText(Stage.stageInfo[0].name, 20, 37, 1, 24, 35, 0x333333);
        this.addChild(this.oneLayerTitleText);
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
        //マップアイコン作成
        for (let i = 0; i < this.sI.length; i++) {
            const mapIcon = new PIXI.Sprite();
            mapIcon.interactive = true;
            const backColor = new PIXI.Graphics(); // グラフィックオブジェクト（背景に半透明な四角を配置するために使用）
            backColor.beginFill(this.sI[i][0], 1); // 色、透明度を指定して描画開始
            backColor.drawCircle(this.sI[i][1], this.sI[i][2], 11);//円描画
            backColor.endFill(); // 描画完了
            mapIcon.addChild(backColor); // 背景をボタンコンテナに追加
            mapIcon.on('pointertap', () => {
                this.selectMapId = i;//選択ステージ記憶
                this.mapCursor.position.set(this.sI[this.selectMapId][1], this.sI[this.selectMapId][2]);//カーソルセット
                this.oneLayerTitleText.setText(Stage.stageInfo[i].name);//選択ステージ名更新
            });
            this.map.addChild(mapIcon);
        }
        this.mapCursor.on("pointertap", () => {
            if (ship.stageID != this.selectMapId) {
                ship.shop.setBuyingProduct(Stage.stageInfo[this.selectMapId].sellList);//店売り商品セット
                ship.quest.setQuestList(Stage.stageInfo[this.selectMapId].questList);//クエストセット
                ship.bar.setTalkList(Stage.stageInfo[this.selectMapId].barList);//小話セット
                ship.stageID = this.selectMapId;
            }
        });
    }
}