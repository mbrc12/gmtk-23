import { Tilemaps } from "phaser";
import planck, { Polygon, Vec2 } from "planck";
import { GameScene } from ".";

import { TILE_LAYER, TILE_MASK, DEBUG_STROKE_WIDTH, DEBUG_STROKE_COLOR, DEBUG_STROKE_ALPHA, DEBUG_DEPTH } from "../globals";
import { parseTiledObjects } from "../tiled/object";

export function getObjectLayer(key: string, map: Tilemaps.Tilemap): 
    Map<string, Phaser.Types.Tilemaps.TiledObject> {

    const objects = new Map<string, Phaser.Types.Tilemaps.TiledObject>();
    map.getObjectLayer(key)!.objects.forEach((obj) => {
        objects.set(obj.name, obj);
    })
    return objects
}

export function extractCollisionObjects(scene: GameScene, layer: Tilemaps.TilemapLayer): void {
    const width = layer.width;
    const height = layer.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tile = layer.getTileAt(x, y);
            if (tile) {
                getCollidersOfTile(scene, tile);
            }
        }
    }
}

export function getCollidersOfTile(scene: GameScene, tile: Tilemaps.Tile): planck.Body[] {
    const tx = tile.pixelX;
    const ty = tile.pixelY;
    const tw = tile.width;
    const th = tile.height;

    const bodies = [] as planck.Body[];

    const collisions = tile.getCollisionGroup() as any;

    if (collisions) {
        const colliders = parseTiledObjects(collisions.objects!)!;
        colliders.forEach((collider) => {
            if (collider.kind == "polygon") {
                let points = collider.points.map((pt) => {

                    // This tile rotation code only works if the rotation is pi or 0. 

                    let fin = Phaser.Math.Rotate({x: pt.x - tw/2, y: pt.y - th/2}, tile.rotation);
                    if (tile.flipX) {
                        fin.x = -fin.x;
                    }

                    return new Vec2(fin.x + tw/2, fin.y + th/2);
                })

                const body = scene.world.createKinematicBody({
                    position: new Vec2(tx, ty),
                });

                body.createFixture({
                    shape: new Polygon(points),
                    filterCategoryBits: TILE_LAYER,
                    filterMaskBits: TILE_MASK,
                });
            }
        });
    }

    return bodies;
}


