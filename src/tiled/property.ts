export function parseTiledProperties(obj: any[]): TiledProperty[] {
    return obj.map((prop) => parseTiledProperty(prop)!)
}

export function parseTiledProperty(obj: any): TiledProperty {
    const name = obj.name!;
    const type = obj.type!;
    if (type == "string") {
        return {
            name,
            value: obj.value as string
        }
    } else if (type == "int" || type == "float") {
        return {
            name,
            value: obj.value as number
        }
    } else if (type == "bool") {
        return {
            name,
            value: obj.value as boolean
        }
    } else {
        throw new Error("Unrecognized property type");
    }
};

export type TiledProperty = {
    name: string,
    value: string | number | boolean;
};
