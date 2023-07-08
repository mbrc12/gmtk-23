import { GameObjects, Scene } from "phaser"
import { BUILDING_DEPTH, HEIGHT, ROAD_DEPTH, SKY_DEPTH } from "../globals"
import rng from "./rng"

export const MAP_BLOCK = 48
const MAP_BOT_Y = 3 * HEIGHT / 4

export const MAP_WIDTH = 100

const HOSPITAL_SPRITE_WIDTH = 144
const HOSPITAL_SPRITE_HEIGHT = 64
const HOSPITAL_WIDTH_BLOCKS = HOSPITAL_SPRITE_WIDTH / MAP_BLOCK

const BUILDING_BODY_HEIGHT = 48
const BUILDING_TOP_HEIGHT = 16

const SKY_WIDTH = 64
const MAP_WIDTH_SKIES = MAP_WIDTH * MAP_BLOCK / SKY_WIDTH

const BUILDING_TOP_CHOICES = ["building-top-1", "building-top-2", "building-top-3", "building-top-4", "building-top-5"]
const BUILDING_BODY_CHOICES = ["building-body", "building-body-2"]

export type BlockData = {
    building: Array<GameObjects.Sprite>,

    hospital: boolean,
    dread: number,
}

export type MapData = {
    skies: Array<GameObjects.Sprite>,
    roads: Array<GameObjects.Sprite>,
    blocks: Array<BlockData>,
    hospitals: Array<GameObjects.Sprite>
}


export function generateMap(scene: Scene): MapData {
    const data = new Array<BlockData>(MAP_WIDTH)

    const skies: GameObjects.Sprite[] = []

    for (let i = 0; i < MAP_WIDTH_SKIES; i++) {
        const x = i * SKY_WIDTH
        const sky = scene.add.sprite(x, 0, rng.choice(["sky-1", "sky-2"])!)
        sky.setOrigin(0, 0)
        sky.setDepth(SKY_DEPTH)
        skies.push(sky)
    }

    const roads: GameObjects.Sprite[] = []

    for (let i = 0; i < MAP_WIDTH; i++) {
        const x = i * MAP_BLOCK
        let road = scene.add.sprite(x, MAP_BOT_Y, "road")
        road.setOrigin(0, 0)
        road.setDepth(ROAD_DEPTH)

        roads.push(road)
    }

    for (let i = 0; i < MAP_WIDTH; i++) {
        const x = i * MAP_BLOCK
        
        let isHospital = true

        let building : GameObjects.Sprite[] = []

        if (i >= HOSPITAL_WIDTH_BLOCKS && i < MAP_WIDTH - HOSPITAL_WIDTH_BLOCKS) {
            isHospital = false

            const shift = rng.int(0, 5) * 3

            const buildingBody = scene.add.sprite(x, MAP_BOT_Y + shift - BUILDING_BODY_HEIGHT, 
                                                  biasedChoice(BUILDING_BODY_CHOICES))

            if (rng.boolean()) {
                buildingBody.setFlipX(true)
            }
            
            const buildingTop = scene.add.sprite(x, MAP_BOT_Y + shift - BUILDING_BODY_HEIGHT - BUILDING_TOP_HEIGHT, 
                                                 biasedChoice(BUILDING_TOP_CHOICES)!)

            if (rng.boolean()) {
                buildingTop.setFlipX(true)
            }

            buildingTop.setOrigin(0, 0)
            buildingTop.setDepth(BUILDING_DEPTH)
            buildingBody.setOrigin(0, 0)
            buildingBody.setDepth(BUILDING_DEPTH)
            building = [buildingTop, buildingBody]
        }

        const dread = rng.float(0, 0.1)


        data[i] = {
            
            building: building,
            hospital: isHospital,

            dread: dread
        }
    }

    const hospitals: GameObjects.Sprite[] = []
    const hospitalIndices = [0, MAP_WIDTH - HOSPITAL_WIDTH_BLOCKS]

    for (let i = 0; i < hospitalIndices.length; i++) {
        const idx = hospitalIndices[i]
        const hospital = scene.add.sprite(idx * MAP_BLOCK  , MAP_BOT_Y - HOSPITAL_SPRITE_HEIGHT,
                                       "hospital")
        hospital.setOrigin(0, 0)
        hospital.setDepth(BUILDING_DEPTH)

        hospitals.push(hospital)
    }

    return {
        skies: skies,
        roads: roads,
        blocks: data,
        hospitals: hospitals
    }
}

function range(x: number, y: number): Array<number> {
    const arr: number[] = [];
    for (let i = x; i < y; i++) {
        arr.push(i)
    }
    return arr
}

function biasedChoice<T>(xs: T[]): T {
    let v = rng.float(0, 1)
    v = 1 - Math.pow(1 - v, 1.5)
    v = Math.floor(v * xs.length)
    return xs[v]
}
