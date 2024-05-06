import {Vector, VectorOps, Rotation, RotationOps} from "../math";
import {RawColliderSet, RawShape} from "../raw";
import {ShapeContact} from "./contact";
import {PointProjection} from "./point";
import {Ray, RayIntersection} from "./ray";
import {ShapeTOI} from "./toi";
import {ColliderHandle} from "./collider";

export abstract class Shape {
    public abstract intoRaw(): RawShape;

    /**
     * The concrete type of this shape.
     */
    public abstract get type(): ShapeType;

    /**
     * instant mode without cache
     */
    public static fromRaw(
        rawSet: RawColliderSet,
        handle: ColliderHandle,
    ): Shape {
        const rawType = rawSet.coShapeType(handle);

        let extents: Vector;
        let borderRadius: number;
        let vs: Float32Array;
        let indices: Uint32Array;
        let halfHeight: number;
        let radius: number;
        let normal: Vector;

        switch (rawType) {
            case ShapeType.Ball:
                return new Ball(rawSet.coRadius(handle));
            case ShapeType.Cuboid:
                extents = rawSet.coHalfExtents(handle);
                // #if DIM2
                return new Cuboid(extents.x, extents.y);
                // #endif



            case ShapeType.RoundCuboid:
                extents = rawSet.coHalfExtents(handle);
                borderRadius = rawSet.coRoundRadius(handle);

                // #if DIM2
                return new RoundCuboid(extents.x, extents.y, borderRadius);
                // #endif



            case ShapeType.Capsule:
                halfHeight = rawSet.coHalfHeight(handle);
                radius = rawSet.coRadius(handle);
                return new Capsule(halfHeight, radius);
            case ShapeType.Segment:
                vs = rawSet.coVertices(handle);

                // #if DIM2
                return new Segment(
                    VectorOps.new(vs[0], vs[1]),
                    VectorOps.new(vs[2], vs[3]),
                );
                // #endif



            case ShapeType.Polyline:
                vs = rawSet.coVertices(handle);
                indices = rawSet.coIndices(handle);
                return new Polyline(vs, indices);
            case ShapeType.Triangle:
                vs = rawSet.coVertices(handle);

                // #if DIM2
                return new Triangle(
                    VectorOps.new(vs[0], vs[1]),
                    VectorOps.new(vs[2], vs[3]),
                    VectorOps.new(vs[4], vs[5]),
                );
                // #endif



            case ShapeType.RoundTriangle:
                vs = rawSet.coVertices(handle);
                borderRadius = rawSet.coRoundRadius(handle);

                // #if DIM2
                return new RoundTriangle(
                    VectorOps.new(vs[0], vs[1]),
                    VectorOps.new(vs[2], vs[3]),
                    VectorOps.new(vs[4], vs[5]),
                    borderRadius,
                );
                // #endif



            case ShapeType.HalfSpace:
                normal = VectorOps.fromRaw(rawSet.coHalfspaceNormal(handle));
                return new HalfSpace(normal);

            case ShapeType.TriMesh:
                vs = rawSet.coVertices(handle);
                indices = rawSet.coIndices(handle);
                return new TriMesh(vs, indices);

            case ShapeType.HeightField:
                const scale = rawSet.coHeightfieldScale(handle);
                const heights = rawSet.coHeightfieldHeights(handle);

                // #if DIM2
                return new Heightfield(heights, scale);
                // #endif



            // #if DIM2
            case ShapeType.ConvexPolygon:
                vs = rawSet.coVertices(handle);
                return new ConvexPolygon(vs, false);
            case ShapeType.RoundConvexPolygon:
                vs = rawSet.coVertices(handle);
                borderRadius = rawSet.coRoundRadius(handle);
                return new RoundConvexPolygon(vs, borderRadius, false);
            // #endif



            default:
                throw new Error("unknown shape type: " + rawType);
        }
    }

    /**
     * Computes the time of impact between two moving shapes.
     * @param shapePos1 - The initial position of this sahpe.
     * @param shapeRot1 - The rotation of this shape.
     * @param shapeVel1 - The velocity of this shape.
     * @param shape2 - The second moving shape.
     * @param shapePos2 - The initial position of the second shape.
     * @param shapeRot2 - The rotation of the second shape.
     * @param shapeVel2 - The velocity of the second shape.
     * @param maxToi - The maximum time when the impact can happen.
     * @param stopAtPenetration - If set to `false`, the linear shape-cast won’t immediately stop if
     *   the shape is penetrating another shape at its starting point **and** its trajectory is such
     *   that it’s on a path to exist that penetration state.
     * @returns If the two moving shapes collider at some point along their trajectories, this returns the
     *  time at which the two shape collider as well as the contact information during the impact. Returns
     *  `null`if the two shapes never collide along their paths.
     */
    public castShape(
        shapePos1: Vector,
        shapeRot1: Rotation,
        shapeVel1: Vector,
        shape2: Shape,
        shapePos2: Vector,
        shapeRot2: Rotation,
        shapeVel2: Vector,
        maxToi: number,
        stopAtPenetration: boolean,
    ): ShapeTOI | null {
        let rawPos1 = VectorOps.intoRaw(shapePos1);
        let rawRot1 = RotationOps.intoRaw(shapeRot1);
        let rawVel1 = VectorOps.intoRaw(shapeVel1);
        let rawPos2 = VectorOps.intoRaw(shapePos2);
        let rawRot2 = RotationOps.intoRaw(shapeRot2);
        let rawVel2 = VectorOps.intoRaw(shapeVel2);

        let rawShape1 = this.intoRaw();
        let rawShape2 = shape2.intoRaw();

        let result = ShapeTOI.fromRaw(
            null,
            rawShape1.castShape(
                rawPos1,
                rawRot1,
                rawVel1,
                rawShape2,
                rawPos2,
                rawRot2,
                rawVel2,
                maxToi,
                stopAtPenetration,
            ),
        );

        rawPos1.free();
        rawRot1.free();
        rawVel1.free();
        rawPos2.free();
        rawRot2.free();
        rawVel2.free();

        rawShape1.free();
        rawShape2.free();

        return result;
    }

    /**
     * Tests if this shape intersects another shape.
     *
     * @param shapePos1 - The position of this shape.
     * @param shapeRot1 - The rotation of this shape.
     * @param shape2  - The second shape to test.
     * @param shapePos2 - The position of the second shape.
     * @param shapeRot2 - The rotation of the second shape.
     * @returns `true` if the two shapes intersect, `false` if they don’t.
     */
    public intersectsShape(
        shapePos1: Vector,
        shapeRot1: Rotation,
        shape2: Shape,
        shapePos2: Vector,
        shapeRot2: Rotation,
    ): boolean {
        let rawPos1 = VectorOps.intoRaw(shapePos1);
        let rawRot1 = RotationOps.intoRaw(shapeRot1);
        let rawPos2 = VectorOps.intoRaw(shapePos2);
        let rawRot2 = RotationOps.intoRaw(shapeRot2);

        let rawShape1 = this.intoRaw();
        let rawShape2 = shape2.intoRaw();

        let result = rawShape1.intersectsShape(
            rawPos1,
            rawRot1,
            rawShape2,
            rawPos2,
            rawRot2,
        );

        rawPos1.free();
        rawRot1.free();
        rawPos2.free();
        rawRot2.free();

        rawShape1.free();
        rawShape2.free();

        return result;
    }

    /**
     * Computes one pair of contact points between two shapes.
     *
     * @param shapePos1 - The initial position of this sahpe.
     * @param shapeRot1 - The rotation of this shape.
     * @param shape2 - The second shape.
     * @param shapePos2 - The initial position of the second shape.
     * @param shapeRot2 - The rotation of the second shape.
     * @param prediction - The prediction value, if the shapes are separated by a distance greater than this value, test will fail.
     * @returns `null` if the shapes are separated by a distance greater than prediction, otherwise contact details. The result is given in world-space.
     */
    contactShape(
        shapePos1: Vector,
        shapeRot1: Rotation,
        shape2: Shape,
        shapePos2: Vector,
        shapeRot2: Rotation,
        prediction: number,
    ): ShapeContact | null {
        let rawPos1 = VectorOps.intoRaw(shapePos1);
        let rawRot1 = RotationOps.intoRaw(shapeRot1);
        let rawPos2 = VectorOps.intoRaw(shapePos2);
        let rawRot2 = RotationOps.intoRaw(shapeRot2);

        let rawShape1 = this.intoRaw();
        let rawShape2 = shape2.intoRaw();

        let result = ShapeContact.fromRaw(
            rawShape1.contactShape(
                rawPos1,
                rawRot1,
                rawShape2,
                rawPos2,
                rawRot2,
                prediction,
            ),
        );

        rawPos1.free();
        rawRot1.free();
        rawPos2.free();
        rawRot2.free();

        rawShape1.free();
        rawShape2.free();

        return result;
    }

    containsPoint(
        shapePos: Vector,
        shapeRot: Rotation,
        point: Vector,
    ): boolean {
        let rawPos = VectorOps.intoRaw(shapePos);
        let rawRot = RotationOps.intoRaw(shapeRot);
        let rawPoint = VectorOps.intoRaw(point);
        let rawShape = this.intoRaw();

        let result = rawShape.containsPoint(rawPos, rawRot, rawPoint);

        rawPos.free();
        rawRot.free();
        rawPoint.free();
        rawShape.free();

        return result;
    }

    projectPoint(
        shapePos: Vector,
        shapeRot: Rotation,
        point: Vector,
        solid: boolean,
    ): PointProjection {
        let rawPos = VectorOps.intoRaw(shapePos);
        let rawRot = RotationOps.intoRaw(shapeRot);
        let rawPoint = VectorOps.intoRaw(point);
        let rawShape = this.intoRaw();

        let result = PointProjection.fromRaw(
            rawShape.projectPoint(rawPos, rawRot, rawPoint, solid),
        );

        rawPos.free();
        rawRot.free();
        rawPoint.free();
        rawShape.free();

        return result;
    }

    intersectsRay(
        ray: Ray,
        shapePos: Vector,
        shapeRot: Rotation,
        maxToi: number,
    ): boolean {
        let rawPos = VectorOps.intoRaw(shapePos);
        let rawRot = RotationOps.intoRaw(shapeRot);
        let rawRayOrig = VectorOps.intoRaw(ray.origin);
        let rawRayDir = VectorOps.intoRaw(ray.dir);
        let rawShape = this.intoRaw();

        let result = rawShape.intersectsRay(
            rawPos,
            rawRot,
            rawRayOrig,
            rawRayDir,
            maxToi,
        );

        rawPos.free();
        rawRot.free();
        rawRayOrig.free();
        rawRayDir.free();
        rawShape.free();

        return result;
    }

    castRay(
        ray: Ray,
        shapePos: Vector,
        shapeRot: Rotation,
        maxToi: number,
        solid: boolean,
    ): number {
        let rawPos = VectorOps.intoRaw(shapePos);
        let rawRot = RotationOps.intoRaw(shapeRot);
        let rawRayOrig = VectorOps.intoRaw(ray.origin);
        let rawRayDir = VectorOps.intoRaw(ray.dir);
        let rawShape = this.intoRaw();

        let result = rawShape.castRay(
            rawPos,
            rawRot,
            rawRayOrig,
            rawRayDir,
            maxToi,
            solid,
        );

        rawPos.free();
        rawRot.free();
        rawRayOrig.free();
        rawRayDir.free();
        rawShape.free();

        return result;
    }

    castRayAndGetNormal(
        ray: Ray,
        shapePos: Vector,
        shapeRot: Rotation,
        maxToi: number,
        solid: boolean,
    ): RayIntersection {
        let rawPos = VectorOps.intoRaw(shapePos);
        let rawRot = RotationOps.intoRaw(shapeRot);
        let rawRayOrig = VectorOps.intoRaw(ray.origin);
        let rawRayDir = VectorOps.intoRaw(ray.dir);
        let rawShape = this.intoRaw();

        let result = RayIntersection.fromRaw(
            rawShape.castRayAndGetNormal(
                rawPos,
                rawRot,
                rawRayOrig,
                rawRayDir,
                maxToi,
                solid,
            ),
        );

        rawPos.free();
        rawRot.free();
        rawRayOrig.free();
        rawRayDir.free();
        rawShape.free();

        return result;
    }
}

// #if DIM2
/**
 * An enumeration representing the type of a shape.
 */
export enum ShapeType {
    Ball = 0,
    Cuboid = 1,
    Capsule = 2,
    Segment = 3,
    Polyline = 4,
    Triangle = 5,
    TriMesh = 6,
    HeightField = 7,
    // Compound = 8,
    ConvexPolygon = 9,
    RoundCuboid = 10,
    RoundTriangle = 11,
    RoundConvexPolygon = 12,
    HalfSpace = 13,
}

// #endif



/**
 * A shape that is a sphere in 3D and a circle in 2D.
 */
export class Ball extends Shape {
    readonly type = ShapeType.Ball;

    /**
     * The balls radius.
     */
    radius: number;

    /**
     * Creates a new ball with the given radius.
     * @param radius - The balls radius.
     */
    constructor(radius: number) {
        super();
        this.radius = radius;
    }

    public intoRaw(): RawShape {
        return RawShape.ball(this.radius);
    }
}

export class HalfSpace extends Shape {
    readonly type = ShapeType.HalfSpace;

    /**
     * The outward normal of the half-space.
     */
    normal: Vector;

    /**
     * Creates a new halfspace delimited by an infinite plane.
     *
     * @param normal - The outward normal of the plane.
     */
    constructor(normal: Vector) {
        super();
        this.normal = normal;
    }

    public intoRaw(): RawShape {
        let n = VectorOps.intoRaw(this.normal);
        let result = RawShape.halfspace(n);
        n.free();
        return result;
    }
}

/**
 * A shape that is a box in 3D and a rectangle in 2D.
 */
export class Cuboid extends Shape {
    readonly type = ShapeType.Cuboid;

    /**
     * The half extent of the cuboid along each coordinate axis.
     */
    halfExtents: Vector;

    // #if DIM2
    /**
     * Creates a new 2D rectangle.
     * @param hx - The half width of the rectangle.
     * @param hy - The helf height of the rectangle.
     */
    constructor(hx: number, hy: number) {
        super();
        this.halfExtents = VectorOps.new(hx, hy);
    }

    // #endif



    public intoRaw(): RawShape {
        // #if DIM2
        return RawShape.cuboid(this.halfExtents.x, this.halfExtents.y);
        // #endif


    }
}

/**
 * A shape that is a box in 3D and a rectangle in 2D, with round corners.
 */
export class RoundCuboid extends Shape {
    readonly type = ShapeType.RoundCuboid;

    /**
     * The half extent of the cuboid along each coordinate axis.
     */
    halfExtents: Vector;

    /**
     * The radius of the cuboid's round border.
     */
    borderRadius: number;

    // #if DIM2
    /**
     * Creates a new 2D rectangle.
     * @param hx - The half width of the rectangle.
     * @param hy - The helf height of the rectangle.
     * @param borderRadius - The radius of the borders of this cuboid. This will
     *   effectively increase the half-extents of the cuboid by this radius.
     */
    constructor(hx: number, hy: number, borderRadius: number) {
        super();
        this.halfExtents = VectorOps.new(hx, hy);
        this.borderRadius = borderRadius;
    }

    // #endif



    public intoRaw(): RawShape {
        // #if DIM2
        return RawShape.roundCuboid(
            this.halfExtents.x,
            this.halfExtents.y,
            this.borderRadius,
        );
        // #endif


    }
}

/**
 * A shape that is a capsule.
 */
export class Capsule extends Shape {
    readonly type = ShapeType.Capsule;

    /**
     * The radius of the capsule's basis.
     */
    radius: number;

    /**
     * The capsule's half height, along the `y` axis.
     */
    halfHeight: number;

    /**
     * Creates a new capsule with the given radius and half-height.
     * @param halfHeight - The balls half-height along the `y` axis.
     * @param radius - The balls radius.
     */
    constructor(halfHeight: number, radius: number) {
        super();
        this.halfHeight = halfHeight;
        this.radius = radius;
    }

    public intoRaw(): RawShape {
        return RawShape.capsule(this.halfHeight, this.radius);
    }
}

/**
 * A shape that is a segment.
 */
export class Segment extends Shape {
    readonly type = ShapeType.Segment;

    /**
     * The first point of the segment.
     */
    a: Vector;

    /**
     * The second point of the segment.
     */
    b: Vector;

    /**
     * Creates a new segment shape.
     * @param a - The first point of the segment.
     * @param b - The second point of the segment.
     */
    constructor(a: Vector, b: Vector) {
        super();
        this.a = a;
        this.b = b;
    }

    public intoRaw(): RawShape {
        let ra = VectorOps.intoRaw(this.a);
        let rb = VectorOps.intoRaw(this.b);
        let result = RawShape.segment(ra, rb);
        ra.free();
        rb.free();
        return result;
    }
}

/**
 * A shape that is a segment.
 */
export class Triangle extends Shape {
    readonly type = ShapeType.Triangle;

    /**
     * The first point of the triangle.
     */
    a: Vector;

    /**
     * The second point of the triangle.
     */
    b: Vector;

    /**
     * The second point of the triangle.
     */
    c: Vector;

    /**
     * Creates a new triangle shape.
     *
     * @param a - The first point of the triangle.
     * @param b - The second point of the triangle.
     * @param c - The third point of the triangle.
     */
    constructor(a: Vector, b: Vector, c: Vector) {
        super();
        this.a = a;
        this.b = b;
        this.c = c;
    }

    public intoRaw(): RawShape {
        let ra = VectorOps.intoRaw(this.a);
        let rb = VectorOps.intoRaw(this.b);
        let rc = VectorOps.intoRaw(this.c);
        let result = RawShape.triangle(ra, rb, rc);
        ra.free();
        rb.free();
        rc.free();
        return result;
    }
}

/**
 * A shape that is a triangle with round borders and a non-zero thickness.
 */
export class RoundTriangle extends Shape {
    readonly type = ShapeType.RoundTriangle;

    /**
     * The first point of the triangle.
     */
    a: Vector;

    /**
     * The second point of the triangle.
     */
    b: Vector;

    /**
     * The second point of the triangle.
     */
    c: Vector;

    /**
     * The radius of the triangles's rounded edges and vertices.
     * In 3D, this is also equal to half the thickness of the round triangle.
     */
    borderRadius: number;

    /**
     * Creates a new triangle shape with round corners.
     *
     * @param a - The first point of the triangle.
     * @param b - The second point of the triangle.
     * @param c - The third point of the triangle.
     * @param borderRadius - The radius of the borders of this triangle. In 3D,
     *   this is also equal to half the thickness of the triangle.
     */
    constructor(a: Vector, b: Vector, c: Vector, borderRadius: number) {
        super();
        this.a = a;
        this.b = b;
        this.c = c;
        this.borderRadius = borderRadius;
    }

    public intoRaw(): RawShape {
        let ra = VectorOps.intoRaw(this.a);
        let rb = VectorOps.intoRaw(this.b);
        let rc = VectorOps.intoRaw(this.c);
        let result = RawShape.roundTriangle(ra, rb, rc, this.borderRadius);
        ra.free();
        rb.free();
        rc.free();
        return result;
    }
}

/**
 * A shape that is a triangle mesh.
 */
export class Polyline extends Shape {
    readonly type = ShapeType.Polyline;

    /**
     * The vertices of the polyline.
     */
    vertices: Float32Array;

    /**
     * The indices of the segments.
     */
    indices: Uint32Array;

    /**
     * Creates a new polyline shape.
     *
     * @param vertices - The coordinates of the polyline's vertices.
     * @param indices - The indices of the polyline's segments. If this is `null` or not provided, then
     *    the vertices are assumed to form a line strip.
     */
    constructor(vertices: Float32Array, indices?: Uint32Array) {
        super();
        this.vertices = vertices;
        this.indices = indices ?? new Uint32Array(0);
    }

    public intoRaw(): RawShape {
        return RawShape.polyline(this.vertices, this.indices);
    }
}

/**
 * A shape that is a triangle mesh.
 */
export class TriMesh extends Shape {
    readonly type = ShapeType.TriMesh;

    /**
     * The vertices of the triangle mesh.
     */
    vertices: Float32Array;

    /**
     * The indices of the triangles.
     */
    indices: Uint32Array;

    /**
     * Creates a new triangle mesh shape.
     *
     * @param vertices - The coordinates of the triangle mesh's vertices.
     * @param indices - The indices of the triangle mesh's triangles.
     */
    constructor(vertices: Float32Array, indices: Uint32Array) {
        super();
        this.vertices = vertices;
        this.indices = indices;
    }

    public intoRaw(): RawShape {
        return RawShape.trimesh(this.vertices, this.indices);
    }
}

// #if DIM2
/**
 * A shape that is a convex polygon.
 */
export class ConvexPolygon extends Shape {
    readonly type = ShapeType.ConvexPolygon;

    /**
     * The vertices of the convex polygon.
     */
    vertices: Float32Array;

    /**
     * Do we want to assume the vertices already form a convex hull?
     */
    skipConvexHullComputation: boolean;

    /**
     * Creates a new convex polygon shape.
     *
     * @param vertices - The coordinates of the convex polygon's vertices.
     * @param skipConvexHullComputation - If set to `true`, the input points will
     *   be assumed to form a convex polyline and no convex-hull computation will
     *   be done automatically.
     */
    constructor(vertices: Float32Array, skipConvexHullComputation: boolean) {
        super();
        this.vertices = vertices;
        this.skipConvexHullComputation = !!skipConvexHullComputation;
    }

    public intoRaw(): RawShape {
        if (this.skipConvexHullComputation) {
            return RawShape.convexPolyline(this.vertices);
        } else {
            return RawShape.convexHull(this.vertices);
        }
    }
}

/**
 * A shape that is a convex polygon.
 */
export class RoundConvexPolygon extends Shape {
    readonly type = ShapeType.RoundConvexPolygon;

    /**
     * The vertices of the convex polygon.
     */
    vertices: Float32Array;

    /**
     * Do we want to assume the vertices already form a convex hull?
     */
    skipConvexHullComputation: boolean;

    /**
     * The radius of the convex polygon's rounded edges and vertices.
     */
    borderRadius: number;

    /**
     * Creates a new convex polygon shape.
     *
     * @param vertices - The coordinates of the convex polygon's vertices.
     * @param borderRadius - The radius of the borders of this convex polygon.
     * @param skipConvexHullComputation - If set to `true`, the input points will
     *   be assumed to form a convex polyline and no convex-hull computation will
     *   be done automatically.
     */
    constructor(
        vertices: Float32Array,
        borderRadius: number,
        skipConvexHullComputation: boolean,
    ) {
        super();
        this.vertices = vertices;
        this.borderRadius = borderRadius;
        this.skipConvexHullComputation = !!skipConvexHullComputation;
    }

    public intoRaw(): RawShape {
        if (this.skipConvexHullComputation) {
            return RawShape.roundConvexPolyline(
                this.vertices,
                this.borderRadius,
            );
        } else {
            return RawShape.roundConvexHull(this.vertices, this.borderRadius);
        }
    }
}

/**
 * A shape that is a heightfield.
 */
export class Heightfield extends Shape {
    readonly type = ShapeType.HeightField;

    /**
     * The heights of the heightfield, along its local `y` axis.
     */
    heights: Float32Array;

    /**
     * The heightfield's length along its local `x` axis.
     */
    scale: Vector;

    /**
     * Creates a new heightfield shape.
     *
     * @param heights - The heights of the heightfield, along its local `y` axis.
     * @param scale - The scale factor applied to the heightfield.
     */
    constructor(heights: Float32Array, scale: Vector) {
        super();
        this.heights = heights;
        this.scale = scale;
    }

    public intoRaw(): RawShape {
        let rawScale = VectorOps.intoRaw(this.scale);
        let rawShape = RawShape.heightfield(this.heights, rawScale);
        rawScale.free();
        return rawShape;
    }
}

// #endif


