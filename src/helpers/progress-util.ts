import { NinePatch } from "@koreez/phaser3-ninepatch"
import { GameObjects, Scene } from "phaser"
import { PROGRESS_DEPTH } from "../globals"

export const PROGRESS_HEIGHT = 4
export const PROGRESS_TOP = 1
export const PROGRESS_BOT = 1
export const PROGRESS_LEFT = 1
export const PROGRESS_RIGHT = 1

export type Progress = {
    texture: NinePatch,
    color: number,
    max: number,
    width: number,

    track: any,
    field: string,

    anchor: GameObjects.Sprite,
    originX: number,
    originY: number
    offsetX: number,
    offsetY: number
}

export function makeProgressBar(scene: Scene, color: number, width: number,  max: number, 
                                track: any, field: string,
                                anchor: GameObjects.Sprite, 
                                originX: number, originY: number,
                                offsetX: number, offsetY: number) : 
    Progress {
    const texture = new NinePatch(scene, 0, 0, 10, PROGRESS_HEIGHT, "progress", undefined, {
        top: PROGRESS_TOP,
        bottom: PROGRESS_BOT,
        left: PROGRESS_LEFT,
        right: PROGRESS_RIGHT
    })
    
    texture.setTint(color)
    texture.setDepth(PROGRESS_DEPTH)

    scene.add.existing(texture)

    return {
        texture: texture,
        color: color,
        max: max,
        width: width,
        track: track,
        field: field,
        anchor: anchor,
        originX: originX,
        originY: originY,
        offsetX: offsetX,
        offsetY: offsetY
    }
}

export function updateProgress(
    [{anchor, originX, originY, offsetX, offsetY, texture, track, field, max, width}]: [Progress], 
    []: []) {
    const value = track[field] as number
    // console.log(value, max)
    texture.resize(value/max * width, PROGRESS_HEIGHT)

    texture.setPosition(anchor.x - (originX - 0.5) * texture.width + offsetX, 
                        anchor.y - (originY - 0.5) * texture.height + offsetY)
}
