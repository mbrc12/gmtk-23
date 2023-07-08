import { Vec2 } from "planck";
import { GameScene, KeyboardManager, Resource, StoredComponent, setupKeyboardInput } from "../helpers";
import { Assets } from "../assets";
import { Input, Scene } from "phaser";

import KeyCodes = Input.Keyboard.KeyCodes

import { HEIGHT } from "../globals";
import { HumanSpec, HumanSprite, humanSpecsUpdate, humanSpriteSystem, spawnHuman } from "../helpers/human-util";
import { MAP_BLOCK, MAP_WIDTH, MapData, generateMap } from "../helpers/map-util";
import { Progress, updateProgress } from "../helpers/progress-util";


//////


const keySpec = {
    q: KeyCodes.Q
}

type KT = typeof keySpec

type SystemSets = "default" | "ui";


export type Stats = {
    infected: number,
    current?: HumanSpec,
    selecting?: HumanSpec,
}

export type PointerData = {
    x: number,
    enabled: boolean
}

export default class MainGame extends GameScene<SystemSets> {

    pointerData!: PointerData;

    rScene: Resource<MainGame>;
    rKeys: Resource<KeyboardManager<KT>>;
    rPointer: Resource<PointerData>;
    rStats: Resource<Stats>;
    rMap: Resource<MapData>;
    rHumans: Resource<Set<HumanSpec>>;

    cSpec: StoredComponent<HumanSpec>;
    cHumanSprite: StoredComponent<HumanSprite>;
    cProgress: StoredComponent<Progress>;

    map!: MapData;
    humans: Set<HumanSpec>;

    constructor() {
        super('game', new Vec2(0, 0), "default")

        this.humans = new Set()

        this.rScene = this.registerResource<MainGame>()
        this.rKeys = this.registerResource<KeyboardManager<KT>>()
        this.rStats = this.registerResource<Stats>()
        this.rPointer = this.registerResource<PointerData>()
        this.rMap = this.registerResource<MapData>()

        this.rHumans = this.registerResource<Set<HumanSpec>>()
        this.rHumans.set(this.humans)

        this.cSpec = this.registerComponent<HumanSpec>()
        this.cHumanSprite = this.registerComponent<HumanSprite>()
        this.cProgress = this.registerComponent<Progress>()

        this.system([], [this.rKeys, this.rScene], pauseSystem, { static: true } )

        this.system([this.cProgress], [], updateProgress)
        this.system([this.cSpec, this.cHumanSprite], 
                    [this.rScene, this.rStats, this.rPointer], humanSpriteSystem)
        this.system([this.cSpec], [], humanSpecsUpdate)
    }
  
    preload() {

        this.load.audio("bgm", Assets.music.bgm)
        this.load.audio("transfer", Assets.sfx.transfer)

        this.load.image("pick", Assets.art.pick)
        this.load.image("progress", Assets.art.progress)

        this.load.image("sky-1", Assets.art.sky1)
        this.load.image("sky-2", Assets.art.sky2)
        this.load.image("road", Assets.art.road)

        this.load.image("current", Assets.art.current)

        this.load.spritesheet("legs", Assets.art.legs, { frameWidth: 16 })
        this.load.image("body", Assets.art.body)
        this.load.image("head", Assets.art.head)
        this.load.image("head-mask", Assets.art.headMask)

        this.load.image("hospital", Assets.art.hospital)

        this.load.image("building-body", Assets.art.buildingBody)
        this.load.image("building-body-2", Assets.art.buildingBody2)
        this.load.image("building-top-1", Assets.art.buildingTop1)
        this.load.image("building-top-2", Assets.art.buildingTop2)
        this.load.image("building-top-3", Assets.art.buildingTop3)
        this.load.image("building-top-4", Assets.art.buildingTop4)
        this.load.image("building-top-5", Assets.art.buildingTop5)

    }

    create() {
        super.create()
        this.sound.add("bgm").play({
            loop: true
        })

        this.rScene.set(this)
        this.rKeys.set(setupKeyboardInput(this, keySpec))

        this.rStats.set({infected: 0})

        this.rPointer.set({x: 0, enabled: true})

        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("legs", {start: 0, end: 7}),
            frameRate: 15,
            repeat: -1
        })

        this.map = generateMap(this)
        this.rMap.set(this.map)
    
        this.input.on("pointerdown", (pointer: Input.Pointer) => {
            if (pointer.rightButtonDown()) {
                spawnHuman(this)
            }
            
            const pointerData = this.rPointer.get()

            if (pointer.leftButtonDown()) {
                if (pointerData.enabled) {
                    pointerData.enabled = false
                    const stats = this.rStats.get()
                    if (stats.selecting) {
                        stats.current = stats.selecting
                        this.sound.play("transfer")
                        stats.selecting = undefined
                    }
                }
            }
        })

        this.input.on("pointerup", () => {
            const pointerData = this.rPointer.get()
            pointerData.enabled = true
        })

        this.cameras.main.setBounds(0, 0, MAP_WIDTH * MAP_BLOCK, HEIGHT)
    }

    update(time: number, delta: number): void {
        super.update(time, delta)
        this.rPointer.get().x = this.game.input.mousePointer!.x + this.cameras.main.scrollX;

        // console.log(this.rPointer.get().enabled)
        // console.log(this.rStats.get().current)
    }
}

function pauseSystem([]: [], [keys, scene]: [KeyboardManager<KT>, Scene]) {
    if (keys.q.justDown()) {
        scene.scene.pause()
        scene.scene.launch('pause-scene');
    }
}


