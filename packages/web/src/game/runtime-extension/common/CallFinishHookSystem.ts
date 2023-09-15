import { WebappSystemFactory } from "../WebappSystemFactory"

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
