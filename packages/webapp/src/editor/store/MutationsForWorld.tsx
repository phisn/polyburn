
import { EntityModel } from "../../model/world/EntityModel"
import { FlagEntity } from "../../model/world/FlagModel"
import { areVerticesClockwise, hasAnyEdgeIntersections, Point } from "../../model/world/Point"
import { ShapeModel } from "../../model/world/ShapeModel"
import { WorldModel } from "../../model/world/WorldModel"
import { capture, composeEntityAt, composeShapeAt, newMutation, newMutationWithCompose } from "./Mutation"

export const insertShape = (shape: ShapeModel) => newMutationWithCompose(
    world => world.shapes.slice(0, world.shapes.length - 1),
    world => [...world.shapes, shape],
    shapes => ({ shapes }),
)

export const removeShape = (shapeIndex: number) => capture(
    world => world.shapes[shapeIndex],
    shape => newMutationWithCompose(
        world => [...world.shapes, shape],
        world => world.shapes.filter((_, i) => i !== shapeIndex),
        shapes => ({ shapes }),
    )
)

export const changeVertices = (
    index: number, 
    change: (vertices: Point[]) => Point[],
) => capture(
    world => world.shapes[index].vertices,
    vertices => {
        let newVertices = change(vertices)

        if (newVertices.length < 3) {
            throw new Error("Shape must have at least 3 vertices")
        }

        if (hasAnyEdgeIntersections(newVertices)) {
            throw new Error("Shape must not have any edge intersections")
        }

        if (!areVerticesClockwise(newVertices)) {
            newVertices = newVertices.reverse()
        }

        return newMutationWithCompose(
            () => vertices,
            () => newVertices,
            (vertices, world) => composeShapeAt(index)({ vertices }, world),
        )
    }
)

export const insertVertex = (shapeIndex: number, insertAfterVertex: number, vertex: Point) => changeVertices(
    shapeIndex,
    vertices => [
        ...vertices.slice(0, insertAfterVertex + 1),
        vertex,
        ...vertices.slice(insertAfterVertex + 1),
    ]
)

export const removeVertex = (shapeIndex: number, vertexIndex: number) => capture(
    world => world.shapes[shapeIndex].vertices.length,
    vertexCount => vertexCount > 3
        ? changeVertices(
            shapeIndex,
            vertices => [
                ...vertices.slice(0, vertexIndex),
                ...vertices.slice(vertexIndex + 1),
            ]
        )
        : removeShape(shapeIndex)
)

export const moveVertex = (shapeIndex: number, vertexIndex: number, to: Point) => changeVertices(
    shapeIndex,
    vertices => [
        ...vertices.slice(0, vertexIndex),
        to,
        ...vertices.slice(vertexIndex + 1),
    ]
)

export const insertEntity = (entity: EntityModel) => newMutationWithCompose(
    world => world.entities.slice(0, world.entities.length - 1),
    world => [...world.entities, entity],
    entities => ({ entities }),
)

export const removeEntity = (entityIndex: number) => capture(
    world => world.entities[entityIndex],
    entity => newMutationWithCompose(
        world => [...world.entities, entity],
        world => world.entities.filter((_, i) => i !== entityIndex),
        entities => ({ entities }),
    )
)

export const replaceWorld = (world: WorldModel) => capture(
    world => world,
    captured => newMutation(
        () => captured,
        () => world,
    )
)

export const moveCamera = (entityIndex: number, cameraTopLeft: Point, cameraBottomRight: Point) => capture(
    world => ({ 
        cameraTopLeft: (world.entities[entityIndex] as FlagEntity).cameraTopLeft,
        cameraBottomRight: (world.entities[entityIndex] as FlagEntity).cameraBottomRight,
    }),
    captured => newMutationWithCompose(
        () => ({
            cameraTopLeft: captured.cameraTopLeft,
            cameraBottomRight: captured.cameraBottomRight,
        }),
        () => ({
            cameraTopLeft,
            cameraBottomRight,
        }),
        (camera, world) => composeEntityAt(entityIndex)({ ...camera }, world),
    )
)