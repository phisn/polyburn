export function Campaign() {
    const levels = [
        {},
        {},
        {},
        {},
        {},
        {},
        {}
    ]

    return (
        <div className="flex justify-center">
            <div className="grid max-w-[100rem] p-12 gap-16 grid-cols-2">
                {levels.map((_, i) => (<Level key={i} />))}
            </div>
        </div>
    )
}

function Trohpy() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="yellow" className="bi bi-trophy-fill" viewBox="0 0 16 16">
            <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935z"/>
        </svg>
    )
}

function Level() {
    return (
        <div className="rounded-2xl aspect-[7/4] w-[32rem] relative">
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-base-100 opacity-80">
                <div className="grid grid-cols-5">
                    <div className="steps col-span-4">
                        <div className="step step-primary">
                        </div>
                        <div className="step step-primary">
                        </div>
                        <div className="step">
                        </div>
                        
                        <div className="step">
                        </div>
                        
                        <div className="step">
                        </div>
                    </div>
                    <button className="ml-auto btn btn-square btn-ghost">
                        <Trohpy />
                    </button>
                </div>
            </div>
            <img className="absolute top-0 left-0 bottom-0 right-0 rounded-2xl -z-10" src="https://placehold.co/700x400"/>
        </div>
    )
}
