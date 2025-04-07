import { create } from "zustand"

export interface EditorStore {}

export const useEditorStore = create<EditorStore>((_set, _get) => ({}))
