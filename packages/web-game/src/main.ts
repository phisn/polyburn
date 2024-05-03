import { WorldModel } from "runtime/proto/world"
import { Game } from "./game/game"
import { GameLoop } from "./game/game-loop"
import { GameInstanceType, GameSettings } from "./game/game-settings"

function base64ToBytes(base64: string) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}

const worldStr =
    "CqAJCgZOb3JtYWwSlQkKDw0fhZ3BFR+FB0Id2w/JQBItDR+FtsEVgZUDQh3bD8lAJQAAEMItpHBhQjWuR9lBPR+Fm0FFAAAAQE0AAABAEi0Nrkc/QRVt5wZCHdsPyUAlAAD4QC2kcBZCNezRjUI94KMwP0UAAABATQAAAEASLQ2k8B5CFX9qWEEd2w/JQCUAAP5BLaRwFkI17NG9Qj3gozA/RQAAAEBNAAAAQBItDeyRm0IVPzWGQR3bD8lAJQCAjUItSOHsQTX26AVDPYTr6cBFAAAAQE0AAABAEi0Nw0XwQhUcd4lAHTMeejwlAIDnQi2kcA5CNfboMkM9EK6nv0UAAABATQAAAEASLQ2PYhxDFT813EEd2w/JQCUAAM9CLaRwbEI1AMAmQz0fhbFBRQAAAEBNAAAAQBItDcM15UIVYxBJQh3bD8lAJQAAeUItUrijQjXs0fpCPZDCM0JFAAAAQE0AAABAEi0N9WiFQhXVeIhCHdsPyUAlw7WBQi3sUY9CNcO1kUI9AACBQkUAAABATQAAAEAaTgpMpHA9wXE9ukHAwP8AAEAAPYCA/wAAtIBDAAD/AIDFAEBAQP8AgMgAAICA/wBAxgC+oKD/AABGAMf///8AV0dxQry8+QBSQPHA////ABpOCkyuR3FBSOHKQf/++ABAxgAA//3wAAA/QMT/++AAQEoAQv/3wAAAPkBF/++AAADHAD//3gAAgMYAAP/vgAAAAIDD////AKxGCq////8AGpcCCpQC9qjBQpqZJEL///8AMNEAOv///wDqy9pH////AOzHNML///8AAMIAx////wAAQkDE////AABFAL3///8AAELAx////wCARgBF////AEBGgMb///8AwEYAv////wAgSQBF////AOBIgMP///8A4EjAR////wAARYDE////AAC+oMj///8AAD8AAP///wAAAODK////AGBJAEf///8AwMTASP///wAgSQAA////AEBEwMb///8AAEOAQ////wBASQC/////AAA+wEj///8AwEqAw////wAAvMBL////AODIAAD///8AQMoAQP///wAAPgBI////ACDIAAD///8AgMCARv///wCAyQAA////AEBFgMb///8AGqcCCqQCpHAZQqRwOcH///8AmFgAwP///wCAxwhU////AGDK4E3///8AwM1gyf///wAAv+DI////AKBLAMP///8AADpgyf///wCARgAA////AAA6YMv///8AQMgAAP///wAAvuDJ////AIBFYMj///8AQMyAwf///wAAtMDG////AGDLAL3///8AOMAMSP///wAkxgCu////AADC4Mj///8AAMNARv///wBgyQAA////AEDHgMP///8AwMeAQf///wAAAEBM////ACDJAAD///8AgMMAx////wAAyoBC////AAC9AMb///8AgMTARf///wCAwIDB////AABFAML///8AAMgANP///wBAxEBG////AADHAAD///8AAMFAyP///wBgyEDE////ABomCiSPQopCcT2DQv/AjQAAxAAA/+R0AAAAAMT/kwAAAEQAAP+bAAASEgoGTm9ybWFsEggKBk5vcm1hbA=="
const worldModel = WorldModel.decode(base64ToBytes(worldStr))

const settings: GameSettings = {
    instanceType: GameInstanceType.Play,
    world: worldModel,
    gamemode: "Normal",
    canvas: document.getElementById("scene") as HTMLCanvasElement,
    worldname: "Test",
}

try {
    const loop = new GameLoop(new Game(settings))
    loop.start()
} catch (e) {
    console.error(e)
}
