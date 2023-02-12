import DefaultHandler from "./DefaultPlacementHandler";
import MoveVertexHandler from "./MovePlacementHandler";
import { PlacementHandlerType, PlacementHandlerProps } from "./PlacementHandlerProps";
import PlaceObjectHandler from "./PlaceObjectPlacementHandler";

function PlacementHandler(props: { state: PlacementHandlerProps }) {
    switch (props.state.type) {
        case PlacementHandlerType.PlaceObject:
            return <PlaceObjectHandler {...props.state} />
        
        case PlacementHandlerType.Default:
            return <DefaultHandler {...props.state} />

        case PlacementHandlerType.MoveVertex:
            return <MoveVertexHandler {...props.state} />
    }
}

export default PlacementHandler
