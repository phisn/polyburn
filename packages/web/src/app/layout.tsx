import { Navbar } from "./Navbar"
import "./global.css"

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <html lang="en" className="bg-base-300 grid">
            <Navbar />
            <body>{props.children}</body>
        </html>
    )
}
