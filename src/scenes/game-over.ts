import { HEIGHT, MAIN_SCENE, WIDTH } from "../globals";
import { Assets } from "../assets";
import MainGame from "./game";

const BG_COLOR = 0x101518
const FG_COLOR = 0x827094
const CREDITS_COLOR = 0xCAE2BC
const TITLE_COLOR = 0xcd6093
const FLAIR_COLOR = 0xa93b3b

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super("game-over-scene")
    }

    preload() {
        this.load.bitmapFont("default", Assets.fonts.default.png, Assets.fonts.default.xml)

        this.load.audio("game-over", Assets.music.gameOver)
    }
    
    create() {
        this.sound.play("game-over")

        // this.input.once("pointerdown", () => {
        //     const mainScene = this.scene.get(MAIN_SCENE)
        //     mainScene.scene.restart({})
        //     this.scene.stop(this)
        // })

        const bg = this.add.rectangle(0, 0, WIDTH, HEIGHT, BG_COLOR, 0.95)
        bg.setOrigin(0, 0)
        bg.depth = 0
        
        const flair = this.add.bitmapText(0, 0, "default", "Game over!", 30)
        flair.setTint(TITLE_COLOR)
        flair.setOrigin(0.5, 0.5)
        flair.setPosition(WIDTH/2, 2 * HEIGHT/5)
        flair.depth = 1

        const reason = this.add.bitmapText(0, 0, "default", this.registry.get("reason"), 20)
        reason.setTint(FLAIR_COLOR)
        reason.setOrigin(0.5, 0.5)
        reason.setPosition(WIDTH/2, 3.5 * HEIGHT/5)
        reason.depth = 1

        const refresh = this.add.bitmapText(0, 0, "default", "refresh to continue", 10)
        refresh.setTint(FG_COLOR)
        refresh.setOrigin(0.5, 0.5)
        refresh.setPosition(WIDTH/2, 4.5 * HEIGHT/5)
        refresh.depth = 1
    }
}
