import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
    plugins: [
        react(),
        VitePWA({ 
            registerType: "autoUpdate",
            devOptions: {
                enabled: true,
            },
            manifest: {
                name: "Rocket Game",
                theme_color: "#000000",
                icons: [
                    {
                        src: "/src/assets/icon.png",
                        sizes: "512x512",
                        type: "image/png",
                    }
                ]
            }
        })
    ]
})
