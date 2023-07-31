/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            screens: {
                hxs: { raw: "(min-height: 475px)" },
                hsm: { raw: "(min-height: 640px)" },
                hmd: { raw: "(min-height: 768px)" },
            },
        },
    },
    plugins: [require("daisyui"), require("tailwind-scrollbar")],
    daisyui: {
        themes: [
            {
                dark: {
                    ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
                    "base-100": "#3a3a3a",
                    "base-200": "#2a2a2a",
                    "base-300": "#1a1a1a",
                },
            },
        ],
    },
    variants: {
        extend: {
            visibility: ["group-hover"],
        },
    },
}
