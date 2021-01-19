import { eventWindow } from "./eventWindow";
import { MyText } from "./myText";
import { Ship } from "./ship";
import { simpleWindow } from "./simpleWindow";

export class GameEvent {
    mode: number;
    background: eventWindow;
    texts: string[][] = [
        ["\n\nここは宇宙のど真ん中。\n小さな星に小さな宇宙船がぽつり。\n\n\n\n船員のおじさん達は今日も元気に働いている。\n\n\n\nおじさんが地球を旅立ち１億年。\n地球には、もはや彼らを知る物は誰一人いない。\n\n\n\nそしておじさん達も、自分たちが何故宇宙を漂っているのか、まだ知らない。"]
    ];
    constructor(gameScene: PIXI.Container) {
        this.background = new eventWindow();
        gameScene.addChild(this.background);
        this.initialize();
    }
    act(ship: Ship, gameScene: PIXI.Container) {
        const eventFlags: boolean[] = ship.eventFlags;
        if (!eventFlags[0]) {
            if (this.mode == 0) {
                this.background.visible = true;
                ship.scale.set(0.75);
                ship.position.set(50, 90);
                this.background.setText(this.texts[0][0]);
                this.mode = 1;
            } else {
                this.background.display();
                if (this.background.mode == 2) {
                    this.initialize();
                    eventFlags[0] = true;
                }
            }
        }
    }
    initialize() {
        this.mode = 0;
        this.background.initialize();
    }
}