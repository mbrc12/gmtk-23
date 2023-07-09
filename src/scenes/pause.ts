import { HEIGHT, LAST_SCENE_KEY, WIDTH } from "../globals";
import { Assets } from "../assets";

const BG_COLOR = 0x101518
const FG_COLOR = 0x827094
const CREDITS_COLOR = 0xCAE2BC
const TITLE_COLOR = 0xcd6093
const FLAIR_COLOR = 0xa93b3b

export class PauseScene extends Phaser.Scene {
    constructor() {
        super("pause-scene")
    }

    preload() {
        this.load.bitmapFont("default", Assets.fonts.default.png, Assets.fonts.default.xml)
    }
    
    create() {
        this.input.once("pointerdown", () => {
            const lastScene = this.registry.get(LAST_SCENE_KEY) as string
            this.scene.resume(lastScene)
            this.scene.stop()
        })

        const bg = this.add.rectangle(0, 0, WIDTH, HEIGHT, BG_COLOR, 0.95)
        bg.setOrigin(0, 0)
        bg.depth = 0
        
        const flair = this.add.bitmapText(0, 0, "default", "infection is hard work ... rest for now", 20)
        flair.setTint(FLAIR_COLOR)
        flair.setOrigin(0.5, 0.5)
        flair.setPosition(WIDTH/2, 2 * HEIGHT/5)
        flair.depth = 1

        const text = this.add.bitmapText(0, 0, "default", "click to resume", 20)
        text.setTint(FG_COLOR)
        text.setOrigin(0.5, 0.5)
        text.setPosition(WIDTH/2, 4 * HEIGHT/5)
        text.depth = 1
    }
}
