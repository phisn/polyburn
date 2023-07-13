/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
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
}
