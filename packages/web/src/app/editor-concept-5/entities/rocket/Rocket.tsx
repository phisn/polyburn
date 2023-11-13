export function Rocket() {
    // do a 1 to 1 mapping between behavior and visual
    // therefore the behavior is handling all the visual stuff

    return (
        <ObjectBehavior>
            <Svg ref={svgRef as any} />
        </ObjectBehavior>
    )
}
