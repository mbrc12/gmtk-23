import Phaser from "phaser";

import glitchFrag from "../assets/shaders/glitch.glsl?raw"

export class ShaderFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {

    resolution = {x: 0, y: 0}

    constructor(game: Phaser.Game) {
        super({
            game,
            name: 'Shader',
            fragShader: glitchFrag,
        })
    }

    onPreRender(): void {
        this.resolution.x = this.game.canvas.width
        this.resolution.y = this.game.canvas.height

        this.set2f('iResolution', this.resolution.x, this.resolution.y)
        this.setTime('iTime')
    }
}

