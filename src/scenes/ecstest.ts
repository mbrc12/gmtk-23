// import * as bitecs from "bitecs"
// import { GameObjects, Input, Scene } from "phaser"
// import { Vec2, Body, Polygon } from "planck"
// import { Assets } from "../assets"
// import { DIAGNOSTICS_DEPTH, GRAVITY, HEIGHT, TREE_LAYER, TREE_MASK, WIDTH } from "../globals"
// import { GameScene, KeyboardManager, PhysicsHelpers, setupKeyboardInput, StoredComponent, Resource } from "../helpers"

// import { ShaderFX } from "../fx/shader"

// // import bloomVert from "../assets/shaders/bloom-vert.glsl?raw"
// // import bloomFrag from "../assets/shaders/bloom-frag.glsl?raw"
// // import vignetteFrag from "../assets/shaders/vignette-frag.glsl?raw"

// import KeyCodes = Input.Keyboard.KeyCodes

// const keySpec = {
//     left: KeyCodes.A,
//     right: KeyCodes.D,
//     up: KeyCodes.W,
//     down: KeyCodes.S,
//     space: KeyCodes.SPACE,
//     esc: KeyCodes.ESC
// }

// type KT = typeof keySpec

// type Push = {
//     push: boolean,
//     enabled: boolean
// }

// // all possible system sets
// type SystemSets = "default" | "ui"

// export default class ECSTest extends GameScene<SystemSets> {

//     cSprite: StoredComponent<GameObjects.Sprite>
//     cBody: StoredComponent<Body>
//     cText: StoredComponent<GameObjects.Text>

//     rKeys: Resource<KeyboardManager<KT>>
//     rPush: Resource<Push>
//     rScene: Resource<ECSTest>

//     constructor() {
//         super('ecs-test', new Vec2(0, GRAVITY), "default")
    
//         // Components in entities
//         this.cSprite = this.registerComponent<GameObjects.Sprite>()
//         this.cBody = this.registerComponent<Body>()
//         this.cText = this.registerComponent<GameObjects.Text>()

//         // Global resources
//         this.rKeys = this.registerResource<KeyboardManager<KT>>()
//         this.rPush = this.registerResource<Push>()
//         this.rScene = this.registerResource<ECSTest>()

//         // All the systems
//         this.system([this.cSprite, this.cBody], [], treeSystem)
//         this.system([this.cText], [this.rScene], fpsSystem)
//         this.system([this.cBody], [this.rPush], bodyKeySystem, { physics: true })
//         this.system([], [this.rKeys, this.rPush], setPush, { physics: true, static: true })

//         this.system([], [this.rKeys, this.rScene], pauseSystem, { static: true })
//     }

//     preload(): void {
//         // this.load.image("tree", Assets.art.tree)
//         // this.load.audio("click", Assets.audio.click)

//         this.cameras.main.setPostPipeline(ShaderFX)

//         const renderer = this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer
//         renderer.pipelines.addPostPipeline("shader", ShaderFX)
//     }

//     create() {
//         super.create()

//         this.rScene.set(this)
//         this.rKeys.set(setupKeyboardInput(this, keySpec))
//         this.rPush.set({ push: false, enabled: true })

//         // this.time.addEvent({
//         //     delay: 5000.0,
//         //     loop: true,
//         //     callback: () => {
//         //         this.sound.play("click")
//         //         const gravity = this.world.getGravity()
//         //         this.world.setGravity(gravity.mul(-1))
//         //     }
//         // })

//         const eid = bitecs.addEntity(this.ecs)
//         const text = this.add.text(0, 0, "fps: 0")
//         text.setDepth(DIAGNOSTICS_DEPTH)
//         this.cText.insertIn(eid, text)
        

//         for (let i = 0; i < 200; i++) {
//             const eid = bitecs.addEntity(this.ecs)

//             const x = Math.random() * WIDTH
//             const y = Math.random() * HEIGHT

//             const sprite = this.add.sprite(x, y, "tree")
//             sprite.setOrigin(0, 0)

//             // const bloom = sprite.preFX!.addBloom()
//             // bloom.strength = 1
//             // bloom.blurStrength = 1

//             this.cSprite.insertIn(eid, sprite)

//             const body = this.world.createDynamicBody({
//                 position: new Vec2(x, y),
//                 allowSleep: false
//             })
//             body.createFixture({
//                 shape: new Polygon([new Vec2(0, 0), new Vec2(0, 24), new Vec2(24, 24), new Vec2(24, 0)]),
//                 filterCategoryBits: TREE_LAYER,
//                 filterMaskBits: TREE_MASK,
//                 density: 1
//             })

//             this.cBody.insertIn(eid, body)
//         }

//         PhysicsHelpers.addWalls(this)
//         // this.cameras.main.setPostPipeline("shader")

//         // this.cameras.main.setPostPipeline(new Renderer.WebGL.Pipelines.PostFXPipeline({
//         //     game: this.game,
//         //     renderTarget: true,
//         //     // vertShader: bloomVert,
//         //     fragShader: vignetteFrag
//         // }))
//     }

//     update(time: number, delta: number): void {
//         super.update(time, delta)

//         PhysicsHelpers.debugRender(this)
//     }
// }

// // Systems

// function treeSystem([sprite, body]: [GameObjects.Sprite, planck.Body]): void {
//     const {x, y} = body.getPosition()

//     sprite.setPosition(x, y)
//     sprite.setFlipX(true)
//     sprite.setRotation(body.getAngle())

// }

// function bodyKeySystem([body]: [planck.Body], [push]: [Push]): void {
//     if (push.push) {
//         // console.log("pushed")
//         const dx = Math.random() * 1000 - 500
//         const dy = Math.random() * 1000 - 500

//         body.applyLinearImpulse(Vec2(dx, dy).mul(body.getMass()), 
//                                 body.getWorldCenter())
//     }
// }

// function setPush([]: [], [keys, push]: [KeyboardManager<KT>, Push]): void {
//     const down = keys.space.down()
//     if (push.enabled && down) {
//         push.push = true
//         push.enabled = false
//         return
//     }
    
//     push.push = false

//     if (!push.enabled && !down) {
//         push.enabled = true
//     }
// }


// const fpsSystem = {
//     ctr: 0,
    
//     run([text]: [GameObjects.Text], [scene]: [ECSTest])  {
//         this.ctr += 1
//         text.setText("fps: " + this.ctr + ":: " + scene.game.loop.actualFps.toFixed(0))
//     }
// }

// function pauseSystem([]: [], [keys, scene]: [KeyboardManager<KT>, Scene]) {
//     if (keys.esc.justDown()) {
//         scene.scene.pause()
//         scene.scene.launch('pause-scene');
//     }
// }


