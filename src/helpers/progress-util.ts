import { NinePatch } from "@koreez/phaser3-ninepatch"
import { GameObjects, Scene } from "phaser"
import { PROGRESS_DEPTH } from "../globals"

export const PROGRESS_HEIGHT = 4
export const PROGRESS_TOP = 1
export const PROGRESS_BOT = 1
export const PROGRESS_LEFT = 1
export const PROGRESS_RIGHT = 1

export class Progress {
    texture: NinePatch
    color: number
    max: number
    width: number
    height: number

    track: any
    field: string

    anchor: GameObjects.Sprite
    originX: number
    originY: number
    offsetX: number
    offsetY: number

    constructor(scene: Scene, color: number, width: number, height: number, max: number, 
                track: any, field: string, anchor: GameObjects.Sprite, 
                originX: number, originY: number, offsetX: number, offsetY: number) 
                {
                    const texture = new NinePatch(scene, 0, 0, width, height, "progress", undefined, {
                        top: PROGRESS_TOP,
                        bottom: PROGRESS_BOT,
                        left: PROGRESS_LEFT,
                        right: PROGRESS_RIGHT
                    })

                    texture.setTint(color)
                    texture.setDepth(PROGRESS_DEPTH)

                    scene.add.existing(texture)

                    this.texture = texture
                    this.color = color
                    this.max = max
                    this.width = width
                    this.height = height
                    this.track = track
                    this.field = field
                    this.anchor = anchor
                    this.originX = originX
                    this.originY = originY
                    this.offsetX = offsetX
                    this.offsetY = offsetY
                }

                destroy() {
                    this.texture.destroy()
                }
}

export function updateProgress(
    [{anchor, originX, originY, offsetX, offsetY, texture, track, field, max, width, height}]: [Progress], 
    []: []): undefined {
    const value = track[field] as number
    // console.log(value, max)
    texture.resize(value/max * width, height)

    texture.setPosition(anchor.x - (originX - 0.5) * texture.width + offsetX, 
                        anchor.y - (originY - 0.5) * texture.height + offsetY)
}
