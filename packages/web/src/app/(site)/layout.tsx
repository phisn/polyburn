import { Navbar } from "./Navbar"

export default function InnerRootLayout(props: { children: React.ReactNode }) {
    return (
        <body className="grid">
            <Navbar />
            {props.children}
        </body>
    )
}
