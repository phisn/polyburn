import { useNavigate } from "react-router-dom"

export function NotFound() {
    const navigate = useNavigate()

    function onBackToHome() {
        navigate("/")
    }

    return (
        <div className="flex items-center justify-center space-x-4 p-4">
            <div className="flex items-center pl-3 text-2xl">404 Not Found</div>
            <button className="btn btn-outline" onClick={onBackToHome}>
                Back To Home
            </button>
        </div>
    )
}
