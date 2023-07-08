import random from 'random'
import * as bitecs from 'bitecs'
import { BODY_SIZE, COVID_OFFSET_X, COVID_OFFSET_Y, HEAD_SIZE, HEALTH_COLOR, HEIGHT, HUMAN_DEPTH, LOW_HEALTH_COLOR, PROGRESS_DEPTH, SELECT_HEIGHT, SELECT_WIDTH, WAVE_AMP, WAVE_SPEED } from '../globals'
import rng from './rng'
import { GameObjects, Scene } from 'phaser'
import MainGame, { PointerData, Stats } from '../scenes/game'
import { makeProgressBar } from './progress-util'

export type HumanSpec = {
    x: number,
    y: number,
    velocity: number,

    health: number,
    growthRate: number,

    isInfected: boolean,
    isMasked: boolean,

    timeToHome: number,

    colorTop: number,
    colorBot: number,
}

export type HumanSprite = {
    head: GameObjects.Sprite,
    body: GameObjects.Sprite,
    legs: GameObjects.Sprite,

    zone: GameObjects.Zone,

    current?: GameObjects.Sprite,
    select?: GameObjects.Sprite
}

const VELOCITY_MULTIPLIER = 1
const MIN_VELOCITY = 0.45
const TIME_TO_HOME_MULTIPLIER = 200

const PALETTE = [0xd1b187, 0xc77b58, 0xae5d40, 0x79444a, 0x4b3d44, 0xba9158, 0x927441, 0x4d4539, 0x77743b,
    0xb3a555, 0xd2c9a5, 0x8caba1, 0x4b726e, 0x574852, 0x847875, 0xab9b8e]

const TOP_COLORS = PALETTE
const BOT_COLORS = PALETTE

export function generateHuman(x: number, y: number): HumanSpec {
    const health = rng.float(0, 1)

    let velocity = random.float(health, health * 2) * VELOCITY_MULTIPLIER
    velocity = Math.max(velocity, MIN_VELOCITY * VELOCITY_MULTIPLIER)
    velocity *= rng.choice([-1, 1])!

    const growthRate = rng.float(health - 1, health)

    const timeToHome = rng.float(0.2, 1) * TIME_TO_HOME_MULTIPLIER

    return {
        x: x,
        y: y,

        velocity: velocity,

        health: health,
        growthRate: growthRate,

        isInfected: false,
        isMasked: rng.boolean(),

        timeToHome: timeToHome,

        colorTop: rng.choice(TOP_COLORS)!,
        colorBot: rng.choice(BOT_COLORS)!
    }
}

export function setHumanSpritePosition(human: HumanSprite, x: number, y: number, v: number) {
    if (v < 0) {
        human.head.setFlipX(true)
        human.body.setFlipX(true)
        human.legs.setFlipX(true)
    } else {
        human.head.setFlipX(false)
        human.body.setFlipX(false)
        human.legs.setFlipX(false)
    }

    human.head.setPosition(x - 2 * Math.sign(v), y)
    human.body.setPosition(x, y + HEAD_SIZE)
    human.legs.setPosition(x, y + HEAD_SIZE + BODY_SIZE)

    human.zone.setPosition(human.head.x, human.head.y)
}

export function spawnHuman(scene: MainGame) {
    const x = 100
    const y = HEIGHT / 2

    const human = generateHuman(x, y)
    scene.rStats.get().current = human

    const eid = bitecs.addEntity(scene.ecs)

    scene.cSpec.insertIn(eid, human)
    scene.humans.add(human)

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
    
    scene.cHumanSprite.insertIn(eid, {head: head, body: body, legs: legs, zone: zone})

    scene.cProgress.insertIn(eid, makeProgressBar(scene, HEALTH_COLOR, 16, 1, human, "health", head, 0, 0, 7, -2))

}

export function humanSpriteSystem(
    [spec, sprite]: [HumanSpec, HumanSprite], 
    [scene, stats, pointer]: [Scene, Stats, PointerData]) {

    spec.x += spec.velocity
    setHumanSpritePosition(sprite, spec.x, spec.y, spec.velocity)

    // console.log(pointer.x, sprite.body.getBounds().left, sprite.body.getBounds().right)

    if (pointer.enabled && sprite.zone.getBounds().contains(pointer.x, sprite.body.y + 5)) {
        if (!stats.selecting && stats.current != spec) {
            stats.selecting = spec
        }
    } else if (stats.selecting === spec) {
        stats.selecting = undefined
    }

    if (stats.selecting === spec) {
        
        if (!sprite.select) {
            sprite.select = scene.add.sprite(0, 0, "current")
            sprite.select.setDepth(PROGRESS_DEPTH)
        }
       
        sprite.select.setPosition(sprite.head.x + COVID_OFFSET_X, 
                                  sprite.head.y + COVID_OFFSET_Y + 
                                      Math.sin(scene.time.now / WAVE_SPEED) * WAVE_AMP)
    } else {
        if (sprite.select) {
            sprite.select.destroy()
            sprite.select = undefined
        }
    }

    if (stats.current === spec) {
        if (!sprite.current) {
            sprite.current = scene.add.sprite(0, 0, "current")
            sprite.current.setDepth(PROGRESS_DEPTH)
        }
    
        scene.cameras.main.startFollow(sprite.head)
        sprite.current.setPosition(sprite.head.x + COVID_OFFSET_X, sprite.head.y + COVID_OFFSET_Y)
    } else {
        if (sprite.current) {
            sprite.current.destroy()
            sprite.current = undefined
        }
    }
}

export function humanSpecsUpdate([spec]: [HumanSpec], []: []) {
    spec.health = Math.max(spec.health - 0.001, 0.1)
}
