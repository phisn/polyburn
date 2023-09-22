import { WebappSystemFactory } from "../webapp-system-factory"

export const newCallFinishHookSystem: WebappSystemFactory = ({
    messageStore,
    hook,
    replayCaptureService,
}) => {
    messageStore.listenTo("finished", () => {
        if (hook) {
            hook.finished?.(replayCaptureService.replay)
        }
    })
}
