import * as bitecs from 'bitecs'
import { AUDIO_DISTANCE, BODY_SIZE, CHAOS_OFFSET_X, CHAOS_OFFSET_Y, COVID_OFFSET_X, COVID_OFFSET_Y, DESTINATION_CLOSENESS, HEAD_SIZE, HEALTH_COLOR, HEALTH_NONE, HEALTH_THRESHOLD, HEIGHT, HOME_WAIT_TIME, HUMAN_DEPTH, INFECT_COLOR, LOW_HEALTH_COLOR, PERSON_Y, PROGRESS_DEPTH, SELECT_HEIGHT, SELECT_WIDTH, SKULL_DEPTH, SKULL_X_OFFSET, SKULL_Y, WAVE_AMP, WAVE_SPEED } from '../globals'
import { GameObjects, Scene } from 'phaser'
import MainGame, { GameOver, PointerData, Stats, StatusText, Time } from '../scenes/game'
import { Progress } from './progress-util'
import { CityInfo } from './sim-util'

export type HumanSpec = {
    x: number,
    y: number,
    speed: number,

    source: number,
    destination: number,

    baseGrowth: number,

    health: number,

    isInfected: boolean,
    isMasked: boolean,


    colorTop: number,
    colorBot: number,

    disabled: boolean,

    endTime?: number,
    doorClosed?: boolean,

    ripStarted?: boolean,
    ripPlayed?: boolean
}

export type SignType = "current" | "selecting" | "banned" | "inert"

export class HumanSprite {
    head: GameObjects.Sprite
    body: GameObjects.Sprite
    legs: GameObjects.Sprite

    zone: GameObjects.Zone

    // current?: GameObjects.Sprite
    // select?: GameObjects.Sprite
    // banned?: GameObjects.Sprite

    sign?: GameObjects.Sprite
    signType?: SignType
    chaos?: GameObjects.Sprite

    constructor(head: GameObjects.Sprite, body: GameObjects.Sprite, legs: GameObjects.Sprite, zone: GameObjects.Zone) {
        this.head = head
        this.body = body
        this.legs = legs
        this.zone = zone
    }

    destroy() {
        this.head.destroy()
        this.body.destroy()
        this.legs.destroy()
        this.zone.destroy()
        // this.current?.destroy()
        // this.select?.destroy()

        this.sign?.destroy()
        this.chaos?.destroy()
    }
}

export function setHumanSpritePosition(human: HumanSprite, x: number, y: number, v: number): void {
    if (v < 0) {
        human.head.setFlipX(true)
        human.body.setFlipX(true)
        human.legs.setFlipX(true)
    } else {
        human.head.setFlipX(false)
        human.body.setFlipX(false)
        human.legs.setFlipX(false)
    }

    human.head.setPosition(x, y)
    human.body.setPosition(x, y + HEAD_SIZE)
    human.legs.setPosition(x, y + HEAD_SIZE + BODY_SIZE)

    human.zone.setPosition(human.head.x, human.head.y)
    human.chaos?.setPosition(human.head.x + CHAOS_OFFSET_X, human.head.y + CHAOS_OFFSET_Y)
}

export function spawnHuman(scene: MainGame, human: HumanSpec, setCurrent?: boolean) {
    if (setCurrent) {
        scene.rStats.get().current = human
    }

    const eid = bitecs.addEntity(scene.ecs)

    scene.cSpec.insertIn(eid, human)
    scene.rHumans.get().add(human)

    const head = scene.add.sprite(0, 0, human.isMasked ? "head-mask" : "head")
    const body = scene.add.sprite(0, 0, "body")
    const legs = scene.add.sprite(0, 0, "legs")
    legs.play("walk")

    head.setDepth(HUMAN_DEPTH)
    body.setDepth(HUMAN_DEPTH)
    legs.setDepth(HUMAN_DEPTH)

    head.setOrigin(0, 0)
    body.setOrigin(0, 0)
    legs.setOrigin(0, 0)

    body.setTint(human.colorTop)
    legs.setTint(human.colorBot)

    const zone = scene.add.zone(0, 0, SELECT_WIDTH, SELECT_HEIGHT)
    zone.setOrigin(0, 0)

    scene.cHumanSprite.insertIn(eid, new HumanSprite(head, body, legs, zone))

    // scene.cProgress.insertIn(eid,
    //     new Progress(scene, HEALTH_COLOR, 16, 4, 1, human, "health", head, 0.5, 0.5, 8, -1))

}

export function humanPositionSystem([spec, sprite]: [HumanSpec, HumanSprite],
    [time, status, stats, gameOver, city]:
        [Time, StatusText, Stats, GameOver, CityInfo])
    : true | undefined {
    if (spec.endTime && time.now >= spec.endTime) {
        return true
    }

    if (Math.abs(spec.destination - spec.x) < DESTINATION_CLOSENESS) {
        if (!spec.endTime) {
            sprite.legs.stop()
            sprite.legs.setTexture("legs", 4)
            spec.endTime = time.now + HOME_WAIT_TIME
            city.registerHome()

            if (spec === stats.current) {
                status.message("your host has reached a hospital, gg")
                gameOver.over = true
                gameOver.reason = "your host reached a hospital"
            }
        }
        return
    }

    let v = spec.speed * Math.sign(spec.destination - spec.x)
    spec.x += v
    setHumanSpritePosition(sprite, spec.x, spec.y, v)
}

export function humanRIPSystem([spec, sprite]: [HumanSpec, HumanSprite],
    [status, stats, scene, gameOver, city]:
        [StatusText, Stats, Scene, GameOver, CityInfo]): true | undefined {


    if (spec.health < HEALTH_NONE) {
        spec.disabled = true
        city.registerRIP(sprite.head.x)

        if (!spec.ripStarted) {

            if (spec === stats.current) {
                status.message("your host died, gg")
                gameOver.over = true
                gameOver.reason = "your host died"
                scene.sound.play("ripsfx")
            } else if (stats.current && Math.abs(spec.x - stats.current.x) < AUDIO_DISTANCE) {
                scene.sound.play("ripsfx-muted")
            }

            spec.ripStarted = true
            sprite.body.setVisible(false)
            sprite.legs.setVisible(false)
            sprite.chaos?.setVisible(false)
            // sprite.select?.setVisible(false)
            // sprite.current?.setVisible(false)
            sprite.sign?.setVisible(false)

            // sprite.head.setTint(0xffffff)

            sprite.head.play("rip")
            sprite.head.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                spec.ripPlayed = true
                sprite.head.setVisible(false)
                const skull = scene.add.sprite(sprite.head.x + SKULL_X_OFFSET, SKULL_Y, "skull")
                skull.setDepth(SKULL_DEPTH)
            })
        }
    }

    if (spec.ripPlayed) {
        return true
    }
}

export function humanDoorClose([spec]: [HumanSpec], [scene, stats]: [Scene, Stats]): undefined {
    if (stats.current && Math.abs(spec.x - stats.current.x) >= AUDIO_DISTANCE) {
        return
    }
    if (spec.endTime && !spec.doorClosed) {
        spec.disabled = true
        if (spec === stats.current) {
            scene.sound.play("door-close")
        } else {
            scene.sound.play("door-close-muted")
        }
        spec.doorClosed = true
    }
}

export function humanSpriteSystem(
    [spec, sprite]: [HumanSpec, HumanSprite],
    [scene, stats, pointer, time, status]: [Scene, Stats, PointerData, Time, StatusText]): undefined {

    const inZone = sprite.zone.getBounds().contains(pointer.x, sprite.body.y + 5);

    const mode: SignType | undefined = (() => {
        if (spec === stats.current) {
            return "current"
        }
        if (!inZone && stats.selecting === spec) {
            return undefined
        }
        if (inZone && (spec.disabled || spec.isInfected)) {
            return "banned"
        }
        if (!inZone) {
            return "inert"
        }
        if (inZone && stats.selecting && stats.selecting !== spec) {
            return "inert"
        }
        return "selecting"
    })()

    if (mode == sprite.signType && (mode == "current" || mode == "banned")) {
        sprite.sign?.setPosition(sprite.head.x + COVID_OFFSET_X, sprite.head.y + COVID_OFFSET_Y)
    } else if (mode == "inert") {
        sprite.sign?.destroy()
    } else {
        if (mode == "selecting") {
            if (mode != sprite.signType || sprite.sign === undefined) {
                sprite.sign?.destroy()
                sprite.sign = scene.add.sprite(0, 0, "current")
                sprite.signType = "selecting"
                sprite.sign.setDepth(PROGRESS_DEPTH)
            }

            sprite.sign?.setPosition(sprite.head.x + COVID_OFFSET_X,
                sprite.head.y + COVID_OFFSET_Y +
                Math.sin(time.now / WAVE_SPEED) * WAVE_AMP)

            stats.selecting = spec

        } else {
            if (mode) {
                sprite.sign?.destroy()
                sprite.sign = scene.add.sprite(0, 0, mode == "current" ? "current" : "banned")
                sprite.sign.setDepth(PROGRESS_DEPTH)


                sprite.sign.setPosition(sprite.head.x + COVID_OFFSET_X, sprite.head.y + COVID_OFFSET_Y)
                if (mode == "current") {
                    scene.cameras.main.startFollow(sprite.head)
                }
            } else {
                sprite.sign?.destroy()
                stats.selecting = undefined
            }
        }
    }

    sprite.signType = mode

    if (spec.health < HEALTH_THRESHOLD) {
        // sprite.head.setTint(LOW_HEALTH_COLOR)
        if (!sprite.chaos) {
            if (spec === stats.current) {
                status.message("your host is low on health, please change hosts")
            }
            sprite.chaos = scene.add.sprite(sprite.head.x, sprite.head.y, "chaos", 0)
            sprite.chaos.setOrigin(0, 0)
            sprite.chaos.play("chaos-anim")
        }
    } else {
        sprite.chaos?.setVisible(false)
        sprite.chaos?.destroy()
        sprite.chaos = undefined
    }

    if (spec.isInfected) {
        if (spec.isMasked) {
            sprite.head.setTexture("head-mask-infected")
        } else {
            sprite.head.setTexture("head-infected")

        }
    }
}