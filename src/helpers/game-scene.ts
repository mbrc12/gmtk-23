import * as bitecs from "bitecs"
import {Scene} from "phaser"
import {Vec2, World} from "planck"
import {LAST_SCENE_KEY, PHYSICS_STEP} from "../globals"
import {GameQuery, Resource, ResourceList, StoredComponent, StoredComponentList, System, SystemConfig, SystemSpec} from "./ecs"
import {Store} from "./store"


const defaultSystemConfig: SystemConfig<any> = {
    physics: false,
    static: false,
    systemSet: undefined
}

export abstract class GameScene<SV> extends Scene {
    world!: World
    ecs!: bitecs.IWorld
    store!: Store

    systems: System<any, any, SV>[] = []
    physicsSystems: System<any, any, SV>[] = []

    active: Map<SV, boolean>

    private sceneName: string
    private toClean: number[] 
    private defaultSystemSet: SV
    private components: StoredComponent<any>[]

    protected constructor(name: string, gravity: Vec2, defaultSystemSet: SV) {
        super(name)

        this.sceneName = name
        this.defaultSystemSet = defaultSystemSet
        this.toClean = []
        this.components = []

        this.world = new World(new Vec2(gravity))
        this.ecs = bitecs.createWorld()
        this.store = new Store()

        this.active = new Map()
    }

    protected registerComponent<T>(): StoredComponent<T> {
        const component = new StoredComponent<T>(this.ecs, this.store)
        this.components.push(component)
        return component
    }

    protected registerResource<U>(): Resource<U> {
        return new Resource<U>()
    }

    protected registerQuery<T extends unknown[]>(components: StoredComponentList<T>): GameQuery<T> {
        return {
            ecs: this.ecs,
            query: bitecs.defineQuery(components.map((sc) => sc.component)),
            components: components,

            ask(): number[] {
                return this.query(this.ecs)
            }
        }
    }

    protected registerSystem<T extends unknown[], U extends unknown[]>
    (query: GameQuery<T>,
     resources: ResourceList<U>,
     system: SystemSpec<T, U>,
     config?: SystemConfig<SV>): System<T, U, SV> {

        let modifiedConfig = {...defaultSystemConfig, ...config}
        if (!modifiedConfig.systemSet) {
            modifiedConfig.systemSet = this.defaultSystemSet
        }

        const item: System<T, U, SV> = {
            query: query,
            resources: resources,
            isStatic: modifiedConfig.static!,
            systemSet: modifiedConfig.systemSet!,
            callback: system
        }
        const which = (modifiedConfig.physics ? this.physicsSystems : this.systems)
        which.push(item)

        return item
    }


    protected system<T extends unknown[], U extends unknown[]>
    (components: StoredComponentList<T>,
     resources: ResourceList<U>,
     system: SystemSpec<T, U>,
     config?: SystemConfig<SV>): System<T, U, SV> {

        return this.registerSystem(this.registerQuery<T>(components), resources, system, config)
    }

    create() {
        this.time.addEvent({
            delay: PHYSICS_STEP * 1000.0, // milliseconds
            loop: true,
            callback: this.physicsUpdate,
            callbackScope: this
        })
    }

    runSystems(systems: System<any, any, SV>[]): void {
        systems.forEach(({query, resources, isStatic, callback, systemSet}) => {
            
            if (this.active.has(systemSet) && this.active.get(systemSet) == false) {
                return
            } 

            const run = ("run" in callback) ? callback.run.bind(callback) : callback;

            if (isStatic) {
                const resourceList = resources.map((res) => res.get())
                run([], resourceList)
                return
            }

            query.ask().forEach((eid) => {
                const components = query.components.map((comp) => comp.get(eid))
                const resourceList = resources.map((res) => res.get())
                const output = run(components, resourceList)

                if (output) { // obsolete id
                    this.toClean.push(eid) 
                }
            })
        })
    }

    update(_time: number, _delta: number): void {
        this.registry.set(LAST_SCENE_KEY, this.sceneName)
        this.runSystems(this.systems)
        this.__clean()
    }

    private __clean() {
        this.toClean.forEach((eid) => {
            console.log("Cleaned .. " + eid)
            this.components.forEach((comp) => {
                if (comp.check(eid)) {
                    const item = comp.get(eid)
                    if (item["destroy"] != undefined) {
                        item.destroy()
                    }
                    comp.removeFrom(eid)
                }
            })
        })
        this.toClean = []
    }

    physicsUpdate(): void {
        this.runSystems(this.physicsSystems)
        if (this.world) {
            this.world.step(PHYSICS_STEP)
        }
    }
}
