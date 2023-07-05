import { Input, Scene } from "phaser";

export type KeySpec = {
    [k: string]: number
}

export type KeyboardManager<T> = {
    [k in keyof T]: KeyInfo
}

export class KeyInfo {
    scene: Scene
    keyCode: number
    key: Input.Keyboard.Key

    constructor(scene: Scene, key: number) {
        this.scene = scene
        this.keyCode = key
        
        if (!scene.input.keyboard) {
            throw new Error("Scene doesnt support keyboard input.")
        }

        this.key = scene.input.keyboard.addKey(key)
    }

    down(): boolean {
        return this.key.isDown
    }

    justDown(): boolean {
        return Input.Keyboard.JustDown(this.key)
    }
}

export function setupKeyboardInput<T extends KeySpec>(scene: Scene, spec: T): KeyboardManager<T> { 
    return Object.fromEntries(Object.entries(spec).map(([name, code]: [string, number]) => {
        return [name, new KeyInfo(scene, code)]
    })) as KeyboardManager<T>
}

