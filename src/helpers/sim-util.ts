import { BOT_COLORS, MIN_INITIAL_HEALTH, MIN_VELOCITY, PERSON_Y, STARTING_HUMAN_MIN_HEALTH, TOP_COLORS, VELOCITY_MULTIPLIER, WIDTH } from "../globals";
import MainGame, { Stats } from "../scenes/game";
import { HumanSpec, spawnHuman } from "./human-util";
import { MAP_BLOCK, MAP_WIDTH } from "./map-util";
import rng from "./rng";

export type Notification = "none" | "left" | "right"

const SIZE = MAP_BLOCK * MAP_WIDTH
const DREAD_MIN = 0.001
const DREAD_BOOST = Math.exp(1.02)
const DREAD_WINDOW = 50
const DREAD_ROLLOFF = Math.exp(2/50)

const BASE_GROWTH_RANGE = 0.001

const RATE_MAJOR = 1 / (1000 * 6)
const MAJOR_SIZE = 3
const LEAST_GAP_MAJOR = 3 * 1000

const RATE_MINOR = 1 / (1000 * 3)
const MINOR_SIZE = 1
const LEAST_GAP_MINOR = 1 * 1000

const STARTING_POSITION = SIZE / 2
const MAX_POPULATION = 200

const MIN_HOME_DIST = 500
const EVENT_DIST = 300

const MIN_EVT = 5
const MAX_EVT = SIZE - 5
const NOTIFY_RANGE = SIZE/6

const EVENT_CONCENTRATION = 0.9

export class CityInfo {
    dread: number[]    // every [k, k + 1] has a different dread
    total: number

    nextMajor!: number
    nextMinor!: number

    constructor() {
        this.total = 0
        
        this.dread = new Array<number>(SIZE)

        for (let i = 0; i < SIZE; i++) {
            this.dread[i] = DREAD_MIN
        }
        
        this.nextMajor = this.nextMinor = 0

        this.setNextMajor()
        this.setNextMinor()
    }

    setNextMajor() {
        this.nextMajor += Math.max(rng.exponential(RATE_MAJOR)(), LEAST_GAP_MAJOR)
    }

    setNextMinor() {
        this.nextMinor += Math.max(rng.exponential(RATE_MINOR)(), LEAST_GAP_MINOR)
    }

    registerRIP(x: number) {
        if (0 < x && x < SIZE) {
            const i = Math.floor(x)
            for (let j = i - DREAD_WINDOW; j <= i + DREAD_WINDOW; j++) {
                if (j >= MIN_EVT && j <= MAX_EVT) {
                    this.dread[j] *= DREAD_BOOST * Math.pow(DREAD_ROLLOFF, -Math.abs(j - i))
                    this.dread[j] = Math.min(this.dread[j], 1)
                }
            }
        }
        this.total --
    }

    registerHome() {
        this.total --
    }

    sampleEvt(currentX: number): number { 
        let sum = 0
        
        const sampleRate = (dread: number, dist: number) => {
            if (dist <= EVENT_DIST) return 0
            return (1 - dread) * Math.pow(dist - EVENT_DIST, -EVENT_CONCENTRATION)
        }

        for (let i = MIN_EVT; i < MAX_EVT; i++) {
            const dist = Math.abs(i - currentX)
            sum += sampleRate(this.dread[i], dist)
        }

        while (true) {
            const unif = rng.float(0, 1)
            const idx = rng.int(MIN_EVT, MAX_EVT)
            const dist = Math.abs(idx - currentX)
            if (unif * sum <= sampleRate(this.dread[idx], dist)) {
                return idx
            }
        }
    }

    spawnBatch(scene: MainGame, batchSize: number): Notification {
        const current = scene.rStats.get().current
        let currentX = 0
        if (!current) {
            currentX = STARTING_POSITION
        } else {
            currentX = current!.x
        }

        const batch = Math.min(MAX_POPULATION - this.total, batchSize)
        const position = this.sampleEvt(currentX)
        
        // console.log(position, batch, this.total)
        // scene.rStatus.get().message(": " + position + " // " + currentX )

      
        for (let i = 0; i < batch; i++) {
            const left = Math.max(position - MIN_HOME_DIST, MIN_EVT)
            const right = Math.min(position + MIN_HOME_DIST, MAX_EVT)
            // const leftLen = left - MIN_EVT
            // const rightLen = MAX_EVT - right
            
            let dest = 0

            if (rng.float(0, 1) <= 0.5) {  //leftLen / (leftLen + rightLen)) {
                dest = MIN_EVT
            } else {
                dest = MAX_EVT
            }

            this.total++
            if (!current) {
                const human = generateHuman(position, dest, STARTING_HUMAN_MIN_HEALTH)
                spawnHuman(scene, human, true) 
            } else {
                const human = generateHuman(position, dest)
                spawnHuman(scene, human)
            }
        }

        if (current && Math.abs(position - currentX) <= NOTIFY_RANGE) {
            if (position > currentX) {
                return "right"
            } else {
                return "left"
            }
        }


        return "none"
    }
    

    check(scene: MainGame): Notification {
        const now = scene.rTime.get().now
        let result: Notification = "none"
        if (now >= this.nextMajor) {
            result = this.spawnBatch(scene, MAJOR_SIZE)
            this.setNextMajor()
        } else if (now >= this.nextMinor) {
            result = this.spawnBatch(scene, MINOR_SIZE)
            this.setNextMinor()
        }
        return result
    }
}


export function generateHuman(x: number, dest: number, minHealth?: number): HumanSpec {

    const health = rng.float(minHealth || MIN_INITIAL_HEALTH, 1)
    // const health = rng.float(0.01, 0.02)
    const speed = 0

    return {
        x: x,
        y: PERSON_Y,
    
        source: x,
        destination: dest,

        baseGrowth: rng.normal(0, BASE_GROWTH_RANGE)(),

        speed: speed,

        health: health,

        isInfected: false,
        isMasked: rng.boolean(),

        disabled: false,

        colorTop: rng.choice(TOP_COLORS)!,
        colorBot: rng.choice(BOT_COLORS)!
    }
}

const DREAD_FACTOR = 0.01
const MASKED_BOOST = Math.exp(0.0008)
const INFECTED_LOSS = Math.exp(-0.0005)
const CURRENT_ADDITIONAL_LOSS = Math.exp(-0.0005)
const SPEED_RNG_RANGE = 0.1
const POTENCY_LOSS_PER_HEALTH = 60 * 60
const POTENCY_DECAY = 8
const POTENCY_GAIN = 6
export const TOO_HEALTHY_THRESHOLD = 0.5

export function healthSystem([spec]: [HumanSpec], [stats, { dread }]: [Stats, CityInfo]): undefined {
    let { x, health } = spec
    const isCurrent = stats.current === spec
    const dreadHere = dread[Math.floor(x)]

    if (isCurrent) {
        spec.isInfected = true
        let excessHealth = health - TOO_HEALTHY_THRESHOLD
        if (excessHealth > 0) {
            excessHealth = excessHealth * POTENCY_DECAY
        } else {
            excessHealth = excessHealth * POTENCY_GAIN
        }
        stats.potency *= Math.exp(-excessHealth / POTENCY_LOSS_PER_HEALTH)
        stats.potency = Math.min(stats.potency, 1)
    }

    // if (spec === stats.current) 
        // console.log(spec.speed)
    
    health -= dreadHere * DREAD_FACTOR 

    health = health * (1 + spec.baseGrowth)

    if (spec.isMasked) {
        health *= MASKED_BOOST
    }
    if (spec.isInfected) {
        health *= INFECTED_LOSS
    }
    if (isCurrent) {
        health *= CURRENT_ADDITIONAL_LOSS
    }

    spec.health = Phaser.Math.Clamp(health, 0, 1)
    
    spec.speed = health * rng.float(1 - SPEED_RNG_RANGE, 1 + SPEED_RNG_RANGE) * VELOCITY_MULTIPLIER

    spec.speed = Math.max(spec.speed, MIN_VELOCITY)
}

const BIAS = 2

function biasedLeft(l: number, r: number): number {
    return Math.pow(rng.float(0, 1), BIAS) * (r - l) + l
}

function biasedRight(l: number, r: number): number {
    return r - Math.pow(rng.float(0, 1), BIAS) * (r - l)
}
