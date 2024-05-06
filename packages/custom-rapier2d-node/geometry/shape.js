"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heightfield = exports.RoundConvexPolygon = exports.ConvexPolygon = exports.TriMesh = exports.Polyline = exports.RoundTriangle = exports.Triangle = exports.Segment = exports.Capsule = exports.RoundCuboid = exports.Cuboid = exports.HalfSpace = exports.Ball = exports.ShapeType = exports.Shape = void 0;
const math_1 = require("../math");
const raw_1 = require("../raw");
const contact_1 = require("./contact");
const point_1 = require("./point");
const ray_1 = require("./ray");
const toi_1 = require("./toi");
class Shape {
    /**
     * instant mode without cache
     */
    static fromRaw(rawSet, handle) {
        const rawType = rawSet.coShapeType(handle);
        let extents;
        let borderRadius;
        let vs;
        let indices;
        let halfHeight;
        let radius;
        let normal;
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
                return new Segment(math_1.VectorOps.new(vs[0], vs[1]), math_1.VectorOps.new(vs[2], vs[3]));
            // #endif
            case ShapeType.Polyline:
                vs = rawSet.coVertices(handle);
                indices = rawSet.coIndices(handle);
                return new Polyline(vs, indices);
            case ShapeType.Triangle:
                vs = rawSet.coVertices(handle);
                // #if DIM2
                return new Triangle(math_1.VectorOps.new(vs[0], vs[1]), math_1.VectorOps.new(vs[2], vs[3]), math_1.VectorOps.new(vs[4], vs[5]));
            // #endif
            case ShapeType.RoundTriangle:
                vs = rawSet.coVertices(handle);
                borderRadius = rawSet.coRoundRadius(handle);
                // #if DIM2
                return new RoundTriangle(math_1.VectorOps.new(vs[0], vs[1]), math_1.VectorOps.new(vs[2], vs[3]), math_1.VectorOps.new(vs[4], vs[5]), borderRadius);
            // #endif
            case ShapeType.HalfSpace:
                normal = math_1.VectorOps.fromRaw(rawSet.coHalfspaceNormal(handle));
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
    castShape(shapePos1, shapeRot1, shapeVel1, shape2, shapePos2, shapeRot2, shapeVel2, maxToi, stopAtPenetration) {
        let rawPos1 = math_1.VectorOps.intoRaw(shapePos1);
        let rawRot1 = math_1.RotationOps.intoRaw(shapeRot1);
        let rawVel1 = math_1.VectorOps.intoRaw(shapeVel1);
        let rawPos2 = math_1.VectorOps.intoRaw(shapePos2);
        let rawRot2 = math_1.RotationOps.intoRaw(shapeRot2);
        let rawVel2 = math_1.VectorOps.intoRaw(shapeVel2);
        let rawShape1 = this.intoRaw();
        let rawShape2 = shape2.intoRaw();
        let result = toi_1.ShapeTOI.fromRaw(null, rawShape1.castShape(rawPos1, rawRot1, rawVel1, rawShape2, rawPos2, rawRot2, rawVel2, maxToi, stopAtPenetration));
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
    intersectsShape(shapePos1, shapeRot1, shape2, shapePos2, shapeRot2) {
        let rawPos1 = math_1.VectorOps.intoRaw(shapePos1);
        let rawRot1 = math_1.RotationOps.intoRaw(shapeRot1);
        let rawPos2 = math_1.VectorOps.intoRaw(shapePos2);
        let rawRot2 = math_1.RotationOps.intoRaw(shapeRot2);
        let rawShape1 = this.intoRaw();
        let rawShape2 = shape2.intoRaw();
        let result = rawShape1.intersectsShape(rawPos1, rawRot1, rawShape2, rawPos2, rawRot2);
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
    contactShape(shapePos1, shapeRot1, shape2, shapePos2, shapeRot2, prediction) {
        let rawPos1 = math_1.VectorOps.intoRaw(shapePos1);
        let rawRot1 = math_1.RotationOps.intoRaw(shapeRot1);
        let rawPos2 = math_1.VectorOps.intoRaw(shapePos2);
        let rawRot2 = math_1.RotationOps.intoRaw(shapeRot2);
        let rawShape1 = this.intoRaw();
        let rawShape2 = shape2.intoRaw();
        let result = contact_1.ShapeContact.fromRaw(rawShape1.contactShape(rawPos1, rawRot1, rawShape2, rawPos2, rawRot2, prediction));
        rawPos1.free();
        rawRot1.free();
        rawPos2.free();
        rawRot2.free();
        rawShape1.free();
        rawShape2.free();
        return result;
    }
    containsPoint(shapePos, shapeRot, point) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawPoint = math_1.VectorOps.intoRaw(point);
        let rawShape = this.intoRaw();
        let result = rawShape.containsPoint(rawPos, rawRot, rawPoint);
        rawPos.free();
        rawRot.free();
        rawPoint.free();
        rawShape.free();
        return result;
    }
    projectPoint(shapePos, shapeRot, point, solid) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawPoint = math_1.VectorOps.intoRaw(point);
        let rawShape = this.intoRaw();
        let result = point_1.PointProjection.fromRaw(rawShape.projectPoint(rawPos, rawRot, rawPoint, solid));
        rawPos.free();
        rawRot.free();
        rawPoint.free();
        rawShape.free();
        return result;
    }
    intersectsRay(ray, shapePos, shapeRot, maxToi) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawRayOrig = math_1.VectorOps.intoRaw(ray.origin);
        let rawRayDir = math_1.VectorOps.intoRaw(ray.dir);
        let rawShape = this.intoRaw();
        let result = rawShape.intersectsRay(rawPos, rawRot, rawRayOrig, rawRayDir, maxToi);
        rawPos.free();
        rawRot.free();
        rawRayOrig.free();
        rawRayDir.free();
        rawShape.free();
        return result;
    }
    castRay(ray, shapePos, shapeRot, maxToi, solid) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawRayOrig = math_1.VectorOps.intoRaw(ray.origin);
        let rawRayDir = math_1.VectorOps.intoRaw(ray.dir);
        let rawShape = this.intoRaw();
        let result = rawShape.castRay(rawPos, rawRot, rawRayOrig, rawRayDir, maxToi, solid);
        rawPos.free();
        rawRot.free();
        rawRayOrig.free();
        rawRayDir.free();
        rawShape.free();
        return result;
    }
    castRayAndGetNormal(ray, shapePos, shapeRot, maxToi, solid) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawRayOrig = math_1.VectorOps.intoRaw(ray.origin);
        let rawRayDir = math_1.VectorOps.intoRaw(ray.dir);
        let rawShape = this.intoRaw();
        let result = ray_1.RayIntersection.fromRaw(rawShape.castRayAndGetNormal(rawPos, rawRot, rawRayOrig, rawRayDir, maxToi, solid));
        rawPos.free();
        rawRot.free();
        rawRayOrig.free();
        rawRayDir.free();
        rawShape.free();
        return result;
    }
}
exports.Shape = Shape;
// #if DIM2
/**
 * An enumeration representing the type of a shape.
 */
var ShapeType;
(function (ShapeType) {
    ShapeType[ShapeType["Ball"] = 0] = "Ball";
    ShapeType[ShapeType["Cuboid"] = 1] = "Cuboid";
    ShapeType[ShapeType["Capsule"] = 2] = "Capsule";
    ShapeType[ShapeType["Segment"] = 3] = "Segment";
    ShapeType[ShapeType["Polyline"] = 4] = "Polyline";
    ShapeType[ShapeType["Triangle"] = 5] = "Triangle";
    ShapeType[ShapeType["TriMesh"] = 6] = "TriMesh";
    ShapeType[ShapeType["HeightField"] = 7] = "HeightField";
    // Compound = 8,
    ShapeType[ShapeType["ConvexPolygon"] = 9] = "ConvexPolygon";
    ShapeType[ShapeType["RoundCuboid"] = 10] = "RoundCuboid";
    ShapeType[ShapeType["RoundTriangle"] = 11] = "RoundTriangle";
    ShapeType[ShapeType["RoundConvexPolygon"] = 12] = "RoundConvexPolygon";
    ShapeType[ShapeType["HalfSpace"] = 13] = "HalfSpace";
})(ShapeType = exports.ShapeType || (exports.ShapeType = {}));
// #endif
/**
 * A shape that is a sphere in 3D and a circle in 2D.
 */
class Ball extends Shape {
    /**
     * Creates a new ball with the given radius.
     * @param radius - The balls radius.
     */
    constructor(radius) {
        super();
        this.type = ShapeType.Ball;
        this.radius = radius;
    }
    intoRaw() {
        return raw_1.RawShape.ball(this.radius);
    }
}
exports.Ball = Ball;
class HalfSpace extends Shape {
    /**
     * Creates a new halfspace delimited by an infinite plane.
     *
     * @param normal - The outward normal of the plane.
     */
    constructor(normal) {
        super();
        this.type = ShapeType.HalfSpace;
        this.normal = normal;
    }
    intoRaw() {
        let n = math_1.VectorOps.intoRaw(this.normal);
        let result = raw_1.RawShape.halfspace(n);
        n.free();
        return result;
    }
}
exports.HalfSpace = HalfSpace;
/**
 * A shape that is a box in 3D and a rectangle in 2D.
 */
class Cuboid extends Shape {
    // #if DIM2
    /**
     * Creates a new 2D rectangle.
     * @param hx - The half width of the rectangle.
     * @param hy - The helf height of the rectangle.
     */
    constructor(hx, hy) {
        super();
        this.type = ShapeType.Cuboid;
        this.halfExtents = math_1.VectorOps.new(hx, hy);
    }
    // #endif
    intoRaw() {
        // #if DIM2
        return raw_1.RawShape.cuboid(this.halfExtents.x, this.halfExtents.y);
        // #endif
    }
}
exports.Cuboid = Cuboid;
/**
 * A shape that is a box in 3D and a rectangle in 2D, with round corners.
 */
class RoundCuboid extends Shape {
    // #if DIM2
    /**
     * Creates a new 2D rectangle.
     * @param hx - The half width of the rectangle.
     * @param hy - The helf height of the rectangle.
     * @param borderRadius - The radius of the borders of this cuboid. This will
     *   effectively increase the half-extents of the cuboid by this radius.
     */
    constructor(hx, hy, borderRadius) {
        super();
        this.type = ShapeType.RoundCuboid;
        this.halfExtents = math_1.VectorOps.new(hx, hy);
        this.borderRadius = borderRadius;
    }
    // #endif
    intoRaw() {
        // #if DIM2
        return raw_1.RawShape.roundCuboid(this.halfExtents.x, this.halfExtents.y, this.borderRadius);
        // #endif
    }
}
exports.RoundCuboid = RoundCuboid;
/**
 * A shape that is a capsule.
 */
class Capsule extends Shape {
    /**
     * Creates a new capsule with the given radius and half-height.
     * @param halfHeight - The balls half-height along the `y` axis.
     * @param radius - The balls radius.
     */
    constructor(halfHeight, radius) {
        super();
        this.type = ShapeType.Capsule;
        this.halfHeight = halfHeight;
        this.radius = radius;
    }
    intoRaw() {
        return raw_1.RawShape.capsule(this.halfHeight, this.radius);
    }
}
exports.Capsule = Capsule;
/**
 * A shape that is a segment.
 */
class Segment extends Shape {
    /**
     * Creates a new segment shape.
     * @param a - The first point of the segment.
     * @param b - The second point of the segment.
     */
    constructor(a, b) {
        super();
        this.type = ShapeType.Segment;
        this.a = a;
        this.b = b;
    }
    intoRaw() {
        let ra = math_1.VectorOps.intoRaw(this.a);
        let rb = math_1.VectorOps.intoRaw(this.b);
        let result = raw_1.RawShape.segment(ra, rb);
        ra.free();
        rb.free();
        return result;
    }
}
exports.Segment = Segment;
/**
 * A shape that is a segment.
 */
class Triangle extends Shape {
    /**
     * Creates a new triangle shape.
     *
     * @param a - The first point of the triangle.
     * @param b - The second point of the triangle.
     * @param c - The third point of the triangle.
     */
    constructor(a, b, c) {
        super();
        this.type = ShapeType.Triangle;
        this.a = a;
        this.b = b;
        this.c = c;
    }
    intoRaw() {
        let ra = math_1.VectorOps.intoRaw(this.a);
        let rb = math_1.VectorOps.intoRaw(this.b);
        let rc = math_1.VectorOps.intoRaw(this.c);
        let result = raw_1.RawShape.triangle(ra, rb, rc);
        ra.free();
        rb.free();
        rc.free();
        return result;
    }
}
exports.Triangle = Triangle;
/**
 * A shape that is a triangle with round borders and a non-zero thickness.
 */
class RoundTriangle extends Shape {
    /**
     * Creates a new triangle shape with round corners.
     *
     * @param a - The first point of the triangle.
     * @param b - The second point of the triangle.
     * @param c - The third point of the triangle.
     * @param borderRadius - The radius of the borders of this triangle. In 3D,
     *   this is also equal to half the thickness of the triangle.
     */
    constructor(a, b, c, borderRadius) {
        super();
        this.type = ShapeType.RoundTriangle;
        this.a = a;
        this.b = b;
        this.c = c;
        this.borderRadius = borderRadius;
    }
    intoRaw() {
        let ra = math_1.VectorOps.intoRaw(this.a);
        let rb = math_1.VectorOps.intoRaw(this.b);
        let rc = math_1.VectorOps.intoRaw(this.c);
        let result = raw_1.RawShape.roundTriangle(ra, rb, rc, this.borderRadius);
        ra.free();
        rb.free();
        rc.free();
        return result;
    }
}
exports.RoundTriangle = RoundTriangle;
/**
 * A shape that is a triangle mesh.
 */
class Polyline extends Shape {
    /**
     * Creates a new polyline shape.
     *
     * @param vertices - The coordinates of the polyline's vertices.
     * @param indices - The indices of the polyline's segments. If this is `null` or not provided, then
     *    the vertices are assumed to form a line strip.
     */
    constructor(vertices, indices) {
        super();
        this.type = ShapeType.Polyline;
        this.vertices = vertices;
        this.indices = indices !== null && indices !== void 0 ? indices : new Uint32Array(0);
    }
    intoRaw() {
        return raw_1.RawShape.polyline(this.vertices, this.indices);
    }
}
exports.Polyline = Polyline;
/**
 * A shape that is a triangle mesh.
 */
class TriMesh extends Shape {
    /**
     * Creates a new triangle mesh shape.
     *
     * @param vertices - The coordinates of the triangle mesh's vertices.
     * @param indices - The indices of the triangle mesh's triangles.
     */
    constructor(vertices, indices) {
        super();
        this.type = ShapeType.TriMesh;
        this.vertices = vertices;
        this.indices = indices;
    }
    intoRaw() {
        return raw_1.RawShape.trimesh(this.vertices, this.indices);
    }
}
exports.TriMesh = TriMesh;
// #if DIM2
/**
 * A shape that is a convex polygon.
 */
class ConvexPolygon extends Shape {
    /**
     * Creates a new convex polygon shape.
     *
     * @param vertices - The coordinates of the convex polygon's vertices.
     * @param skipConvexHullComputation - If set to `true`, the input points will
     *   be assumed to form a convex polyline and no convex-hull computation will
     *   be done automatically.
     */
    constructor(vertices, skipConvexHullComputation) {
        super();
        this.type = ShapeType.ConvexPolygon;
        this.vertices = vertices;
        this.skipConvexHullComputation = !!skipConvexHullComputation;
    }
    intoRaw() {
        if (this.skipConvexHullComputation) {
            return raw_1.RawShape.convexPolyline(this.vertices);
        }
        else {
            return raw_1.RawShape.convexHull(this.vertices);
        }
    }
}
exports.ConvexPolygon = ConvexPolygon;
/**
 * A shape that is a convex polygon.
 */
class RoundConvexPolygon extends Shape {
    /**
     * Creates a new convex polygon shape.
     *
     * @param vertices - The coordinates of the convex polygon's vertices.
     * @param borderRadius - The radius of the borders of this convex polygon.
     * @param skipConvexHullComputation - If set to `true`, the input points will
     *   be assumed to form a convex polyline and no convex-hull computation will
     *   be done automatically.
     */
    constructor(vertices, borderRadius, skipConvexHullComputation) {
        super();
        this.type = ShapeType.RoundConvexPolygon;
        this.vertices = vertices;
        this.borderRadius = borderRadius;
        this.skipConvexHullComputation = !!skipConvexHullComputation;
    }
    intoRaw() {
        if (this.skipConvexHullComputation) {
            return raw_1.RawShape.roundConvexPolyline(this.vertices, this.borderRadius);
        }
        else {
            return raw_1.RawShape.roundConvexHull(this.vertices, this.borderRadius);
        }
    }
}
exports.RoundConvexPolygon = RoundConvexPolygon;
/**
 * A shape that is a heightfield.
 */
class Heightfield extends Shape {
    /**
     * Creates a new heightfield shape.
     *
     * @param heights - The heights of the heightfield, along its local `y` axis.
     * @param scale - The scale factor applied to the heightfield.
     */
    constructor(heights, scale) {
        super();
        this.type = ShapeType.HeightField;
        this.heights = heights;
        this.scale = scale;
    }
    intoRaw() {
        let rawScale = math_1.VectorOps.intoRaw(this.scale);
        let rawShape = raw_1.RawShape.heightfield(this.heights, rawScale);
        rawScale.free();
        return rawShape;
    }
}
exports.Heightfield = Heightfield;
// #endif
//# sourceMappingURL=shape.js.map