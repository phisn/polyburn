import { makeCCW, quickDecomp } from "poly-decomp"

const points0 = [
    0, 600,   
    3, 355,   
    4, 344,   
    7, 310,  
    15, 256,  
    43, 169,
    87,  85, 
    150,   0, 
    183,  42, 
    200,  62, 
    243, 138, 
    277, 229,
    291, 297, 
    296, 334, 
    300, 600, 
    190, 502, 
    110, 502
]

const points1 = points0.map(
    (p, i) => i % 2 === 0 
        ? p - 150
        : p - 300)

const points2 = points1.map(p => p * 0.15)

const points3 = points2.map(p => Math.round(p * 100) / 100)

// convert array to array of arrays. where the inner array has 2 elements
const points4 = points3.reduce((acc, p, i) => {
    if (i % 2 === 0) {
        acc.push([p])
    } else {
        acc[acc.length - 1].push(p)
    }

    return acc
}, [])

// Make sure the polygon has counter-clockwise winding. Skip this step if you know it's already counter-clockwise.
makeCCW(points4)
   
// Decompose into convex polygons, using the faster algorithm
var convexPolygons = quickDecomp(points4)

console.log(convexPolygons)
