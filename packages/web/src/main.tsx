import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { registerSW } from "virtual:pwa-register"
import { App } from "./app/App"
import "./main.css"

// TODO: think about implementing periodic updates
// https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html
registerSW({ immediate: true })

const root = document.getElementById("root")

if (!root) {
    throw new Error("No root element found")
}

/*
const model = importModelString(
    "CpYJCgZOb3JtYWwSiwkKDw0fhZ3BFR+FB0Id2w/JQBItDR+FtsEVgZUDQh3bD8lAJQAAEMItpHBhQjWuR9lBPR+Fm0FFAAAAQE0AAABAEi0Nrkc/QRVt5wZCHdsPyUAlAAD4QC2kcBZCNezRjUI94KMwP0UAAABATQAAAEASLQ2k8B5CFX9qWEEd2w/JQCUAAP5BLaRwFkI17NG9Qj3gozA/RQAAAEBNAAAAQBItDeyRm0IVPzWGQR3bD8lAJQCAjUItSOHsQTX26AVDPYTr6cBFAAAAQE0AAABAEi0Nw0XwQhUcd4lAHTMeejwlAIDnQi2kcA5CNfboMkM9EK6nv0UAAABATQAAAEASLQ2PYhxDFT813EEd2w/JQCUAAM9CLaRwbEI1AMAmQz0fhbFBRQAAAEBNAAAAQBItDcM15UIVYxBJQh3bD8lAJQAAeUItUrijQjXs0fpCPZDCM0JFAAAAQE0AAABAEiMN9WiFQhXVeIhCHdsPyUAlw7WBQi3sUY9CNcO1kUI9AACBQhpOCkykcD3BcT26QcDA/wAAQAA9gID/AAC0gEMAAP8AgMUAQEBA/wCAyAAAgID/AEDGAL6goP8AAEYAx////wBXR3FCvLz5AFJA8cD///8AGk4KTK5HcUFI4cpB//74AEDGAAD//fAAAD9AxP/74ABASgBC//fAAAA+QEX/74AAAMcAP//eAACAxgAA/++AAAAAgMP///8ArEYKr////wAalwIKlAL2qMFCmpkkQv///wAw0QA6////AOrL2kf///8A7Mc0wv///wAAwgDH////AABCQMT///8AAEUAvf///wAAQsDH////AIBGAEX///8AQEaAxv///wDARgC/////ACBJAEX///8A4EiAw////wDgSMBH////AABFgMT///8AAL6gyP///wAAPwAA////AAAA4Mr///8AYEkAR////wDAxMBI////ACBJAAD///8AQETAxv///wAAQ4BD////AEBJAL////8AAD7ASP///wDASoDD////AAC8wEv///8A4MgAAP///wBAygBA////AAA+AEj///8AIMgAAP///wCAwIBG////AIDJAAD///8AQEWAxv///wAapwIKpAKkcBlCpHA5wf///wCYWADA////AIDHCFT///8AYMrgTf///wDAzWDJ////AAC/4Mj///8AoEsAw////wAAOmDJ////AIBGAAD///8AADpgy////wBAyAAA////AAC+4Mn///8AgEVgyP///wBAzIDB////AAC0wMb///8AYMsAvf///wA4wAxI////ACTGAK7///8AAMLgyP///wAAw0BG////AGDJAAD///8AQMeAw////wDAx4BB////AAAAQEz///8AIMkAAP///wCAwwDH////AADKgEL///8AAL0Axv///wCAxMBF////AIDAgMH///8AAEUAwv///wAAyAA0////AEDEQEb///8AAMcAAP///wAAwUDI////AGDIQMT///8AGiYKJI9CikJxPYNC/8CNAADEAAD/5HQAAAAAxP+TAAAARAAA/5sAABISCgZOb3JtYWwSCAoGTm9ybWFs",
)

model.entities.forEach(entity => {
    if (entity.type === EntityType.LEVEL) {
        entity.captureLeft = 2
        entity.captureRight = 2
    }
})

console.log(exportModelString(model))
*/

createRoot(root).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)
