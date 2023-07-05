export class Store {
    private storage: Map<number, any>
    index: number

    constructor() {
        this.index = 0
        this.storage = new Map<number, any>()
    }

    add(item: any): number {
        this.index += 1
        this.storage.set(this.index, item)
        return this.index
    }

    get(id: number): any {
        return this.storage.get(id)
    }

    delete(id: number): void {
        this.storage.delete(id)
    }
}
