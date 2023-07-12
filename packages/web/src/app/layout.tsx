import "./global.css"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="bg-zinc-900">
            <body>{children}</body>
        </html>
    )
}
