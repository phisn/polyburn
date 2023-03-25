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
            includeAssets: [
                "icon.png",
            ],
            manifest: {
                name: "Rocket Game",
                theme_color: "#000000",
                display: "fullscreen",
                icons: [
                    {
                        src: "icon.png",
                        sizes: "512x512",
                        type: "image/png",
                    }
                ]
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,png,svg}"],
                maximumFileSizeToCacheInBytes: 1024 * 1024 * 16,
            }
        })
    ]
})
