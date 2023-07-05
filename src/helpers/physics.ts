import { Polygon, Vec2 } from "planck";
import { GameScene } from ".";
import { DEBUG_DEPTH, DEBUG_STROKE_ALPHA, DEBUG_STROKE_COLOR, DEBUG_STROKE_COLOR_ASLEEP, DEBUG_STROKE_WIDTH, HEIGHT, WALL_LAYER, WALL_MASK, WIDTH } from "../globals";

export function debugRender(scene: GameScene): void {
    for (var body = scene.world.getBodyList(); body; body = body.getNext()) {
        let bodyPosition = body.getPosition()

        for (var fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
            if (!fixture.getUserData()) {
                let fixturePolygon = fixture.getShape() as Polygon
                let angle = body.getAngle()

                let polygon = 
                    scene.add.polygon(bodyPosition.x, bodyPosition.y, fixturePolygon.m_vertices)

                polygon.setRotation(angle)

                polygon.setStrokeStyle(DEBUG_STROKE_WIDTH, 
                                       DEBUG_STROKE_COLOR, 
                                       DEBUG_STROKE_ALPHA)

                polygon.setDepth(DEBUG_DEPTH)
                polygon.setOrigin(0, 0)

                fixture.setUserData(polygon)
            } else {
                const polygon = fixture.getUserData() as Phaser.GameObjects.Polygon
                polygon.setPosition(bodyPosition.x, bodyPosition.y)
                polygon.setRotation(body.getAngle())

                if (body.isAwake()) {
                    polygon.setStrokeStyle(DEBUG_STROKE_WIDTH, 
                                           DEBUG_STROKE_COLOR, 
                                           DEBUG_STROKE_ALPHA)

                } else {
                    polygon.setStrokeStyle(DEBUG_STROKE_WIDTH, 
                                           DEBUG_STROKE_COLOR_ASLEEP, 
                                           DEBUG_STROKE_ALPHA)
                }
            }
        }
    }
}

export function rectangle(x: number, y: number, width: number, height: number): Polygon  {
    return new Polygon([Vec2(x, y), Vec2(x + width, y), Vec2(x + width, y + height), Vec2(x, y + height)])
}

export function addWalls(scene: GameScene) {
    const walls = scene.world.createKinematicBody({
        position: Vec2(0, 0)
    })

    walls.createFixture({
        shape:rectangle(0, 0, WIDTH, 10),
        filterCategoryBits: WALL_LAYER,
        filterMaskBits: WALL_MASK
    })

    walls.createFixture({
        shape: rectangle(WIDTH - 10, 0, 10, HEIGHT),
        filterCategoryBits: WALL_LAYER,
        filterMaskBits: WALL_MASK
    })

    walls.createFixture({
        shape: rectangle(0, HEIGHT - 10, WIDTH, 10),
        filterCategoryBits: WALL_LAYER,
        filterMaskBits: WALL_MASK
    })

    walls.createFixture({
        shape: rectangle(0, 0, 10, HEIGHT),
        filterCategoryBits: WALL_LAYER,
        filterMaskBits: WALL_MASK
    })
}
