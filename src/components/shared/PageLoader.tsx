export default function PageLoader() {
    return <div className="min-h-screen w-screen flex items-center justify-center z-50">
        <div style={{ animationDuration: "400ms" }} className="h-16 w-16 border-2 border-[#b0b0ff] border-r-neutral-500 rounded-full animate-spin">
        </div>
        <img className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-5" src="/small-logo.svg" alt="" />
    </div>
}