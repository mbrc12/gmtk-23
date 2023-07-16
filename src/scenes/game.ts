import * as bitecs from "bitecs";
import { Vec2 } from "planck";
import { GameScene, KeyboardManager, Resource, StoredComponent, setupKeyboardInput } from "../helpers";
import { Assets } from "../assets";
import { Game, GameObjects, Input, Scene } from "phaser";

import KeyCodes = Input.Keyboard.KeyCodes

import { COVID_OFFSET_X, COVID_OFFSET_Y, GAME_OVER_DELAY, HEALTH_COLOR, HEALTH_NONE, HEIGHT, HUMAN_DEPTH, PADDED, POTENCY_COLOR, POTENCY_CRIT, POTENCY_HEIGHT, POTENCY_LOW, POTENCY_WIDTH, STATUS_CLEAR_DELAY, STATUS_COLOR, STATUS_SIZE, TIPS, TRANSITION_DURATION, UI_DEPTH, WIDTH } from "../globals";
import { HumanSpec, HumanSprite, humanDoorClose, humanPositionSystem, humanRIPSystem, humanSpriteSystem, spawnHuman } from "../helpers/human-util";
import { MAP_BLOCK, MAP_WIDTH, MapData, generateMap } from "../helpers/map-util";
import { Progress, updateProgress } from "../helpers/progress-util";
import { CityInfo, generateHuman, healthSystem } from "../helpers/sim-util";
import rng from "../helpers/rng";

//////


const keySpec = {
    q: KeyCodes.Q
}

type KT = typeof keySpec

type SystemSets = "default" | "ui";


export type Stats = {
    potency: number,
    potencyWarning: boolean,
    infected: number,
    current?: HumanSpec,
    selecting?: HumanSpec,
}

export class StatusText {
    text: GameObjects.BitmapText
    timeoutId: number

    constructor(text: GameObjects.BitmapText) {
        this.text = text
        this.timeoutId = -1
    }

    message(text: string) {
        if (this.timeoutId >= 0) {
            clearTimeout(this.timeoutId)
        }
        this.text.setText(text)
        this.timeoutId = setTimeout(() => {
            this.message(rng.choice(TIPS)!)
        }, STATUS_CLEAR_DELAY)
    }
}

export type PointerData = {
    x: number,
    enabled: boolean
}

export type Time = {
    now: number
}

export type GameOver = {
    over: boolean,
    reason: string
}

export type Counters = {
    homeDist: GameObjects.BitmapText,
    infectCount: GameObjects.BitmapText,
    potency: GameObjects.BitmapText,
    hostHealth: GameObjects.BitmapText
}

export default class MainGame extends GameScene<SystemSets> {

    pointerData!: PointerData;

    rScene: Resource<MainGame>
    rKeys: Resource<KeyboardManager<KT>>
    rPointer: Resource<PointerData>
    rStats: Resource<Stats>
    rMap: Resource<MapData>
    rHumans: Resource<Set<HumanSpec>>
    rStatus: Resource<StatusText>
    rCounters: Resource<Counters>
    rCityInfo: Resource<CityInfo>
    rTime: Resource<Time>
    rGameOver: Resource<GameOver>

    cSpec: StoredComponent<HumanSpec>
    cHumanSprite: StoredComponent<HumanSprite>
    cProgress: StoredComponent<Progress>

    map!: MapData;
    humans: Set<HumanSpec>;

    constructor() {
        super('game', new Vec2(0, 0), "default")


        this.rScene = this.registerResource<MainGame>()
        this.rKeys = this.registerResource<KeyboardManager<KT>>()
        this.rTime = this.registerResource<Time>()
        this.rGameOver = this.registerResource<GameOver>()
        this.rGameOver.set({ over: false, reason: "" })

        this.rCounters = this.registerResource<Counters>()

        this.rStats = this.registerResource<Stats>()
        this.rPointer = this.registerResource<PointerData>()
        this.rMap = this.registerResource<MapData>()
        this.rStatus = this.registerResource<StatusText>()


        this.humans = new Set()
        this.rHumans = this.registerResource<Set<HumanSpec>>()
        this.rHumans.set(this.humans)

        this.rCityInfo = this.registerResource<CityInfo>()
        this.rCityInfo.set(new CityInfo())

        this.cSpec = this.registerComponent<HumanSpec>()
        this.cHumanSprite = this.registerComponent<HumanSprite>()
        this.cProgress = this.registerComponent<Progress>()

        this.system([], [this.rCityInfo, this.rScene],
            citySystem, { static: true })
        this.system([], [this.rGameOver, this.rScene], gameOverSystem, { static: true, systemSet: "ui" })
        this.system([], [this.rKeys, this.rScene], pauseSystem, { static: true, systemSet: "ui" })
        this.system([], [this.rStatus], statusSystem, { static: true, systemSet: "ui" })
        this.system([], [this.rTime, this.rScene], timeSystem, { static: true, systemSet: "ui" })
        this.system([], [this.rStats, this.rStatus, this.rGameOver], potencySystem, { static: true, systemSet: "ui" })

        this.system([this.cSpec, this.cHumanSprite],
            [this.rTime, this.rStatus, this.rStats, this.rGameOver, this.rCityInfo],
            humanPositionSystem)

        this.system([this.cSpec, this.cHumanSprite],
            [this.rScene, this.rStats, this.rPointer, this.rTime, this.rStatus],
            humanSpriteSystem)
        this.system([], [this.rStats, this.rCounters, this.rHumans], counterSystem)

        this.system([this.cSpec], [this.rScene, this.rStats], humanDoorClose)

        this.system([this.cSpec], [this.rStats, this.rCityInfo], healthSystem)

        this.system([this.cSpec, this.cHumanSprite],
            [this.rStatus, this.rStats, this.rScene, this.rGameOver, this.rCityInfo],
            humanRIPSystem)


        this.system([this.cProgress], [], updateProgress)

    }

    preload() {

        this.load.audio("bgm", Assets.music.bgm)
        this.load.audio("transfer", Assets.sfx.transfer)
        this.load.audio("door-close", Assets.sfx.doorClose)
        this.load.audio("door-close-muted", Assets.sfx.doorCloseMuted)
        this.load.audio("ripsfx", Assets.sfx.rip)
        this.load.audio("ripsfx-muted", Assets.sfx.ripMuted)


        this.load.bitmapFont("default", Assets.fonts.default.png, Assets.fonts.default.xml)

        this.load.image("pick", Assets.art.pick)
        this.load.image("progress", Assets.art.progress)

        this.load.image("sky-1", Assets.art.sky1)
        this.load.image("sky-2", Assets.art.sky2)
        this.load.image("road", Assets.art.road)

        this.load.image("current", Assets.art.current)
        this.load.image("banned", Assets.art.banned)
        this.load.image("covid", Assets.art.covid)
        this.load.image("skull", Assets.art.skull)

        this.load.spritesheet("legs", Assets.art.legs, { frameWidth: 16 })
        this.load.spritesheet("chaos", Assets.art.chaos, { frameWidth: 16 })
        this.load.spritesheet("rip", Assets.art.rip, { frameWidth: 16, frameHeight: 48 })

        this.load.image("body", Assets.art.body)
        this.load.image("head", Assets.art.head)
        this.load.image("head-mask", Assets.art.headMask)

        this.load.image("head-infected", Assets.art.headInfected)
        this.load.image("head-mask-infected", Assets.art.headMaskInfected)

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
        this.rTime.set({ now: 0 })

        this.rStats.set({ potency: 1, potencyWarning: false, infected: 0 })

        this.rPointer.set({ x: 0, enabled: true })

        this.rStatus.set(new StatusText(this.add.dynamicBitmapText(0, 0, "default", "", STATUS_SIZE)))
        this.rStatus.get().message("you are currently infecting this person. click to jump to new host")

        this.rCounters.set({
            homeDist: this.add.dynamicBitmapText(0, 0, "default", "home: -/-", STATUS_SIZE),
            infectCount: this.add.dynamicBitmapText(0, 0, "default", "infection: ", STATUS_SIZE),
            potency: this.add.dynamicBitmapText(0, 0, "default", "potency: ", STATUS_SIZE),
            hostHealth: this.add.dynamicBitmapText(0, 0, "default", "host-health: ", STATUS_SIZE)
        })

        this.rStatus.get().text.setTintFill(STATUS_COLOR)

        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("legs", { start: 0, end: 7 }),
            frameRate: 15,
            repeat: -1
        })

        this.anims.create({
            key: "chaos-anim",
            frames: this.anims.generateFrameNumbers("chaos", { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        })

        this.anims.create({
            key: "rip",
            frames: this.anims.generateFrameNumbers("rip", { start: 0, end: 9 }),
            frameRate: 15,
            // repeat: -1
        })

        this.map = generateMap(this)
        this.rMap.set(this.map)

        this.input.on("pointerdown", pointerEventCallback, this)

        this.input.on("pointerup", () => {
            const pointerData = this.rPointer.get()
            pointerData.enabled = true
        })

        // const covid = this.add.sprite(0, 0, "covid")
        // covid.setOrigin(0, 0)
        // covid.setDepth(UI_DEPTH)
        // covid.setScrollFactor(0, 0)

        // const potencyEid = bitecs.addEntity(this.ecs)
        // const potencyBar = new Progress(this, POTENCY_COLOR, POTENCY_WIDTH, POTENCY_HEIGHT, 1, 
        //                                 this.rStats.get(), "potency",
        // covid, 0, 0, 18, 4)
        // potencyBar.texture.setScrollFactor(0, 0)
        // this.cProgress.insertIn(potencyEid, potencyBar)


        this.cameras.main.setBounds(0, 0, MAP_WIDTH * MAP_BLOCK, HEIGHT)
        this.cameras.main.setRoundPixels(true)

        this.rCityInfo.get().spawnBatch(this, 1)
        this.rCityInfo.get().spawnBatch(this, 3)
    }

    update(time: number, delta: number): void {
        super.update(time, delta)
        this.rPointer.get().x = this.game.input.mousePointer!.x + this.cameras.main.scrollX;

        // this.status(" " + Math.floor(this.rPointer.get().x))

        // console.log(this.rPointer.get().enabled)
        // console.log(this.rStats.get().current)
    }

}


function pointerEventCallback(this: MainGame, pointer: Input.Pointer) {

    const pointerData = this.rPointer.get()

    if (pointer.leftButtonDown()) {
        if (pointerData.enabled) {

            pointerData.enabled = false
            const stats = this.rStats.get()

            if (stats.selecting && !stats.selecting.disabled) {
                if (stats.current) {
                    const covid = this.add.sprite(stats.current.x + COVID_OFFSET_X,
                        stats.current?.y + COVID_OFFSET_Y,
                        "covid")
                    covid.setDepth(HUMAN_DEPTH)
                    this.tweens.add({
                        targets: covid,
                        x: stats.selecting.x + COVID_OFFSET_X,
                        y: stats.selecting.y + COVID_OFFSET_Y,
                        duration: TRANSITION_DURATION,
                        ease: 'sine.inout',
                        onComplete: () => {
                            covid.setVisible(false)
                            covid.destroy()
                        }
                    })
                }

                stats.current = stats.selecting

                this.sound.play("transfer")

                this.active.set("default", false) // pause till camera moves
                this.cameras.main.stopFollow() // unfollow camera to tween

                this.tweens.add({
                    targets: this.cameras.main,
                    scrollX: stats.current.x - this.cameras.main.width / 2,
                    ease: 'sine.inout',
                    duration: TRANSITION_DURATION,
                    onComplete: () => {
                        this.active.set("default", true)
                    }
                })

                // this.rStatus.get().message("moved to a new host")

                stats.selecting = undefined
            }
        }
    }
}

function pauseSystem([]: [], [keys, scene]: [KeyboardManager<KT>, Scene]): undefined {
    if (keys.q.justDown()) {
        scene.scene.pause()
        scene.scene.launch('pause-scene');
    }
}

function citySystem([]: [], [city, scene]: [CityInfo, MainGame]): undefined {
    const notify = city.check(scene)
    if (notify !== "none") {
        let dirString = ""
        if (notify == "left") {
            dirString = "<-"
        } else {
            dirString = "->"
        }
        // status.message("some close " + notify + " (" + dirString + ")")
    }
}

function statusSystem([]: [], [status]: [StatusText]): undefined {
    status.text.setX(WIDTH - status.text.width)
    status.text.setY(HEIGHT - status.text.height)
    status.text.setOrigin(0, 0)

    status.text.setScrollFactor(0, 0)
}

function timeSystem([]: [], [time, scene]: [Time, Scene]): undefined {
    time.now = scene.time.now
}

function counterSystem([]: [], [stats, counters, humans]: [Stats, Counters, Set<HumanSpec>]): undefined {
    const current = stats.current!
    const { x, source, destination } = current
    const distOrig = Math.abs(source - destination)
    const distNow = Math.abs(destination - x)
    // console.log(distNow, distOrig)

    const homePerc = Math.round(distNow * 100 / distOrig)

    const homeDist = counters.homeDist

    homeDist.setDepth(UI_DEPTH)
    homeDist.setText(padString("distance:", PADDED) + homePerc + " %")
    homeDist.setOrigin(0, 0)
    homeDist.setScrollFactor(0, 0)
    homeDist.setY(HEIGHT - homeDist.height)

    const total = calcStatistic(humans, 0, (c, x) => {
        return (c.disabled ? x : (x + 1))
    })

    const infect = calcStatistic(humans, 0, (c, x) => {
        if (c.disabled || !c.isInfected) {
            return x
        } else {
            return x + 1
        }
    })

    const potencyCounter = counters.potency

    potencyCounter.setDepth(UI_DEPTH)
    potencyCounter.setText(padString("potency:", PADDED) +
        Math.round(100 * Math.max(stats.potency - 0.1, 0) / 0.9) + " %")
    potencyCounter.setOrigin(0, 0)
    potencyCounter.setScrollFactor(0, 0)
    potencyCounter.setY(HEIGHT - homeDist.height - potencyCounter.height)

    const healthCounter = counters.hostHealth

    healthCounter.setDepth(UI_DEPTH)
    healthCounter.setText(padString("host-health:", PADDED) +
        Math.round(100 * Math.max(stats.current!.health - HEALTH_NONE, 0) / (1 - HEALTH_NONE)) + " %")
    healthCounter.setOrigin(0, 0)
    healthCounter.setScrollFactor(0, 0)
    healthCounter.setY(HEIGHT - homeDist.height - potencyCounter.height - healthCounter.height)

    const infectCounter = counters.infectCount

    infectCounter.setDepth(UI_DEPTH)
    infectCounter.setText(padString("infected:", PADDED) + infect + " / " + total)
    infectCounter.setOrigin(0, 0)
    infectCounter.setScrollFactor(0, 0)
    infectCounter.setY(HEIGHT - homeDist.height - infectCounter.height - potencyCounter.height - healthCounter.height)


}

function calcStatistic<T>(humans: Set<HumanSpec>, init: T, func: (cur: HumanSpec, it: T) => T): T {
    let cur = init

    for (let item of humans.values()) {
        cur = func(item, cur)
    }

    return cur
}

function potencySystem([]: [], [stats, status, gameOver]: [Stats, StatusText, GameOver]): undefined {
    if (stats.potency < POTENCY_LOW && !stats.potencyWarning) {
        status.message("your potency is low, switch to weaker hosts")
        stats.potencyWarning = true
    }

    if (stats.potency > POTENCY_LOW) {
        stats.potencyWarning = false
    }

    if (stats.potency < POTENCY_CRIT) {
        status.message("you have no potency, gg")
        gameOver.over = true
        gameOver.reason = "you ran out of potency"
    }
}

const FLASH_DURATION = 500

function gameOverSystem([]: [], [gameOver, scene]: [GameOver, MainGame]): undefined {
    if (gameOver.over) {
        gameOver.over = false
        scene.active.set("default", false)
        scene.cameras.main.flash(FLASH_DURATION, 255, 0, 0)
        scene.registry.set("reason", gameOver.reason)
        setTimeout(() => {
            scene.scene.launch("game-over-scene")
            scene.sound.stopAll()
            scene.scene.stop(scene)
        }, GAME_OVER_DELAY)
    }
}

const SPACE_RATIO = 4 / 6
function padString(s: string, len: number): string {
    let total = 0
    for (let i = 0; i < s.length; i++) {
        if (s.charAt(i) == ' ') {
            total += SPACE_RATIO
        }
        else total += 1
    }
    let rem = len - total
    return s.padEnd(s.length + rem / SPACE_RATIO)
}
