import { HEIGHT, MAIN_SCENE, WIDTH } from "../globals";
import { Assets } from "../assets";

const BG_COLOR = 0x101518
const FG_COLOR = 0x7894A5
const CREDITS_COLOR = 0xCAE2BC
const TITLE_COLOR = 0xEF8275

export class InitScene extends Phaser.Scene {
    constructor() {
        super("init-scene")
    }

    preload() {
        this.load.bitmapFont("default", Assets.fonts.default.png, Assets.fonts.default.xml)
    }
    
    create() {
        this.input.once("pointerdown", () => {
            this.input.mouse?.requestPointerLock()
            this.scene.launch(MAIN_SCENE)
            this.scene.stop()
        })

        const bg = this.add.rectangle(0, 0, WIDTH, HEIGHT, BG_COLOR, 0.95)
        bg.setOrigin(0, 0)
        bg.depth = 0

        
        const title = this.add.bitmapText(0, 0, "default", "The Hills", 50)
        title.setTint(TITLE_COLOR)
        title.setOrigin(0.5, 0.5)
        title.setPosition(WIDTH/2, HEIGHT * 2 / 5)
        title.depth = 1

        const text = this.add.bitmapText(0, 0, "default", "click here to start", 20)
        text.setTint(FG_COLOR)
        text.setOrigin(0.5, 0.5)
        text.setPosition(WIDTH/2, HEIGHT * 3 / 5)
        text.depth = 1

        const credits = this.add.bitmapText(0, 0, "default", "-- a game by subwave --", 20)
        credits.setTint(CREDITS_COLOR)
        credits.setOrigin(0.5, 0.5)
        credits.setPosition(WIDTH/2, 4 * HEIGHT / 5)
        credits.depth = 1
    }
}
