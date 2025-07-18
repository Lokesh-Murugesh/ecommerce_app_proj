export default function PageHeader({ title, buttonLabel,  onCreate }: { title: string, buttonLabel?: string, onCreate?: () => void }) {
    return (
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {buttonLabel && <button onClick={onCreate} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Create</button>}
        </div>
    )
}