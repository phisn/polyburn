/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],

    theme: {
        fontFamily: {
            sans: ["Andale Mono"],
        },
        extend: {
            screens: {
                xs: "560px",
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
                core: {
                    primary: "#36d399",
                    secondary: "#d926a9",
                    accent: "#1fb2a6",
                    neutral: "#2a323c",
                    "base-100": "#5a5a5a",
                    "base-200": "#303030",
                    "base-300": "#101010",
                    info: "#3abff8",
                    success: "#36d35d",
                    warning: "#fbbd23",
                    error: "#f87272",
                },
                dark: {
                    ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
                    "base-100": "#9a9a9a",
                    "base-200": "#7a7a7a",
                    "base-300": "#101010",
                    neutral: "d8d8da",
                    /*
                    "base-100": "#3a3a3a",
                    "base-200": "#2a2a2a",
                    "base-300": "#101010",
                    */
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
