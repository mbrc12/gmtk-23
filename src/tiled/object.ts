import { parseTiledProperties, TiledProperty } from "./property";

export function parseTiledObjects(obj: any[]): TiledObject[] {
    return obj.map((item) => parseTiledObject(item))
}

export function parseTiledObject(obj: any): TiledObject {
    const x: number = obj.x!;
    const y: number = obj.y!;
    const id: number = obj.id!;
    const name: string = obj.name!;

    const properties = obj.properties && parseTiledProperties(obj.properties!);

    if (obj["ellipse"] == true) {
        return {
            kind: "ellipse",
            x,
            y,
            id,
            name,
            properties,
            width: obj.width,
            height: obj.height
        }
    } else if (obj["point"] == true) {
        return {
            kind: "point",
            x,
            y,
            id,
            properties,
            name,
        }
    } else if (obj["polygon"] != undefined) {
        return {
            kind: "polygon",
            x,
            y,
            id,
            name,
            properties,
            points: obj["polygon"] as Point[]
        }
    } else if (obj["polyline"] != undefined) {
        return {
            kind: "polyline",
            x,
            y,
            id,
            name,
            properties,
            points: obj["polyline"] as Point[]
        }
    } else {
        return {
            kind: "rectangle",
            x,
            y,
            id,
            name,
            properties,
            height: obj.height,
            width: obj.width,
        }
    }
}


interface BaseShape {
    id: number,
    name: string,

    // type: string,

    x: number,
    y: number,

    properties?: TiledProperty[],
}

export interface TiledEllipse extends BaseShape {
    kind: "ellipse",
    height: number,
    width: number,
}
export interface TiledPolygon extends BaseShape {
    kind: "polygon",
    points: Point[]
}
export interface TiledRectangle extends BaseShape {
    kind: "rectangle",
    height: number,
    width: number
}
export interface TiledPoint extends BaseShape {
    kind: "point"
}
export interface TiledPolyline extends BaseShape {
    kind: "polyline",
    points: Point[]
}

export interface Point {
    x: number,
    y: number
}

export type TiledObject = 
    TiledEllipse |
    TiledPoint |
    TiledRectangle |
    TiledPolygon | 
    TiledPolyline;

