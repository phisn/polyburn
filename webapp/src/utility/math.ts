
export const changeAnchor = (
    position: { x: number; y: number },
    rotation: number,
    size: { width: number; height: number },
    sourceAnchor: { x: number; y: number },
    targetAnchor: { x: number; y: number }
) =>
    ({
        x: position.x 
            + Math.cos(rotation) * (size.width  * (targetAnchor.x - sourceAnchor.x)) 
            - Math.sin(rotation) * (size.height * (targetAnchor.y - sourceAnchor.y)),
        y: position.y 
            + Math.sin(rotation) * (size.width  * (targetAnchor.x - sourceAnchor.x)) 
            + Math.cos(rotation) * (size.height * (targetAnchor.y - sourceAnchor.y))
    })
