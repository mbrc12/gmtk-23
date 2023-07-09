import { addComponent, ComponentType, defineComponent, hasComponent, IWorld, Query, removeComponent, Types }  from "bitecs";
import { Store } from ".";


export type GameQuery<T extends unknown[]> = {
    ecs: IWorld,
    query: Query<IWorld>,
    components: StoredComponentList<T>,
    ask: () => number[]
}

export type RawSystem<T extends unknown[], U extends unknown[]> = 
    (components: T, resources: U) => undefined | boolean

// The first kind doesnt have any local data, the second one uses some local data
// which is in the fields other than run.
export type SystemSpec<T extends unknown[], U extends unknown[]> = 
    RawSystem<T, U> | { run: RawSystem<T, U> }


export type SystemConfig<SV> = {
    physics?: boolean, // runs on physics schedule instead of default
    static?: boolean,  // means that this is not called with any entities
    systemSet?: SV
}

export type System<T extends unknown[], U extends unknown[], SV> = {
    query: GameQuery<T>,
    resources: ResourceList<U>,
    isStatic: boolean
    callback: SystemSpec<T, U>,
    systemSet: SV
}

export class StoredComponent<T> {
    ecs: IWorld
    store: Store

    component: ComponentType<{id: "ui32"}>

    constructor(ecs: IWorld, store: Store) {
        this.ecs = ecs
        this.component = defineComponent({id: Types.ui32})
        this.store = store
    }
    
    get(eid: number): T {
        const ptr = this.component.id[eid]
        const item = this.store.get(ptr)
        return item as T
    }

    insertIn(eid: number, obj: T) {
        const ptr = this.store.add(obj)
        addComponent(this.ecs, this.component, eid)
        this.component.id[eid] = ptr
    }

    check(eid: number): boolean {
        return hasComponent(this.ecs, this.component, eid)
    }

    removeFrom(eid: number) {
        const ptr = this.component.id[eid]
        this.store.delete(ptr)
        removeComponent(this.ecs, this.component, eid)
    }
}

// [T1, T2] => [StoredComponent<T1>, StoredComponent<T2>]
export type StoredComponentList<T extends unknown[]> = { [K in keyof T]: StoredComponent<T[K]> }


export class Resource<U> {
    item?: U

    get(): U {
        if (!this.item) {
            throw new Error("Resource not set yet!")
        }
        return this.item
    }

    set(item: U) {
        this.item = item
    }
}

export type ResourceList<U extends unknown[]> = { [K in keyof U]: Resource<U[K]> }

