import "./global.css"

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <html lang="en" className="bg-base-300">
            {props.children}
        </html>
    )
}
