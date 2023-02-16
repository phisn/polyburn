import sin from "@stdlib/math/base/special/sin"
import cos from "@stdlib/math/base/special/cos"

export const changeAnchor = (
    position: { x: number; y: number },
    rotation: number,
    size: { width: number; height: number },
    sourceAnchor: { x: number; y: number },
    targetAnchor: { x: number; y: number }
) =>
    ({
        x: position.x 
            + cos(rotation) * (size.width  * (targetAnchor.x - sourceAnchor.x)) 
            - sin(rotation) * (size.height * (targetAnchor.y - sourceAnchor.y)),
        y: position.y 
            + sin(rotation) * (size.width  * (targetAnchor.x - sourceAnchor.x)) 
            + cos(rotation) * (size.height * (targetAnchor.y - sourceAnchor.y))
    })
