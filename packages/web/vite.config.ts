import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
    plugins: [
        react(),
        VitePWA({ 
            registerType: "autoUpdate",
            devOptions: {
                enabled: false,
            },
            includeAssets: [
                "icon.png",
            ],
            manifest: {
                name: "RocketGraphic Game",
                short_name: "RocketGraphic Game",

                background_color: "#000000",
                theme_color: "#000000",

                orientation: "landscape",
                display: "fullscreen",

                icons: [
                    {
                        src: "icon.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "icon.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                    {
                        src: "icon-196.png",
                        sizes: "196x196",
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
