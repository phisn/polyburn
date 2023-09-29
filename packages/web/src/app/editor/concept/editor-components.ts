import { EmptyComponent } from "runtime-framework"
import { ObjectComponents } from "./features/object/object"
import { ShapeComponents } from "./features/shape/shape"

export type EditorComponents = {
    selected?: EmptyComponent
} & ObjectComponents &
    ShapeComponents
