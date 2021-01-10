import gsap from "gsap";
import * as PIXI from "pixi.js";
import { Ship } from "./ship";
import { Room } from "./room";
import { Button } from "./button";
/*
おじさんに持たせる機能
id:おじさんの識別子
hp:体力
satiety:満腹度
destiny:便意
fatigue:疲労度
*/
type stringOjiState = 'free' | 'transport' | 'moving' | 'sleeping' | 'working';
export class Ojisan extends PIXI.TilingSprite {
    background: PIXI.Graphics;
    static ID = 0;
    id: number = 0;
    hp: number = 100;
    satiety: number = 100;
    destiny: number = 0;
    fatigue: number = Math.round(100 * Math.random());
    level: number = 0;
    state: stringOjiState = "free";
    cnt: number = 0;
    nextCnt: number = 0;
    tl: TimelineMax;
    childs: PIXI.TilingSprite[] = [];
    room: Room;
    speed: number = 200;
    constructor(x: number, y: number) {
        super(PIXI.Loader.shared.resources.oji.texture, 20, 32);
        this.anchor.set(0.5);
        this.x = x;// おじさんのｘ座標
        this.y = y;// おじさんのｙ座標
        Ojisan.ID++;
        this.id = Ojisan.ID;
        this.tl = gsap.timeline();
        this.alpha = 0.8;
        this.zIndex = 1;
        this.interactive = true;
        this.buttonMode = true;
        this.interactiveChildren = false;
        this.on("pointerdown", () => {
            //Button.makeTouchSpeech('hp:' + this.hp + '\n疲労:' + this.fatigue + '\nid:' + this.id + '\n状態' + this.state, 130, 150, 0, 0, 1, 32, 0.8, this);
            this.addChild(Button.makeSpeech('hp:' + this.hp + '\n疲労:' + this.fatigue + '\nid:' + this.id + '\n状態' + this.state, 0x333333, 5, 130, 150, 0, 0, 1, 32, 0.8));
        })
    }
    move(ship: Ship) {
        // 船の境界設定
        if (this.x < this.width / 2) this.x = this.width / 2;
        if (this.y < this.height / 2) this.y = this.height / 2;
        if (this.x > ship.w - this.width / 2) this.x = ship.w - this.width / 2;
        if (this.y > ship.h - this.height / 2) this.y = ship.h - this.height / 2;
        // ケツのアニメーション
        if (this.cnt % (this.fatigue + 3) == 0) {
            this.tilePosition.x += 20;
            this.tilePosition.x = this.tilePosition.x % 60;
        }
        // 停止状態の動き
        if (this.state === 'free') {
            // 自由移動
            if (this.cnt % 300 == this.nextCnt) {
                this.tl.to(this, { duration: 0.5, x: this.x + Math.round(Math.random() * 30) - 15, y: this.y + Math.round(Math.random() * 30) - 15 });
                this.nextCnt = Math.floor(Math.random() * 150 + 150);
            }
            // 疲労蓄積
            if (this.cnt % 300 == 299) {
                this.fatigue++;
                if (this.fatigue > 100) this.fatigue = 100;
                if (this.fatigue == 100) {
                    this.hp--;
                }
            }
            // 就寝
            if (this.fatigue > 90) {
                let bed: Room = Room.findRoom(ship, 3, 'free');
                if (bed !== undefined) {
                    let ojiToBed = Room.len(this.x, this.y, bed.x, bed.y);
                    this.state = 'moving';
                    this.tl
                        .to(this, { duration: ojiToBed / this.speed, x: bed.x, y: bed.y })
                        .call(() => {
                            if (bed.ojiID.length < bed.ojiMax) {
                                this.visible = false;
                                this.state = 'sleeping';
                                this.room = bed;
                                bed.ojiID.push(this.id);
                            } else {
                                bed.state = 'using';
                                Room.freeOji(this);
                            }
                        })
                }
            }
        } else if (this.state === 'sleeping') {
            if (this.cnt % 20 == 0) {
                this.fatigue--;
            }
            if (this.fatigue < 0) {
                this.fatigue = 0;
                Room.freeOji(this);
                Room.removeOjiFromRoom(this, this.room);
                this.room = null;
            }
        }
        this.cnt++;
    }
}