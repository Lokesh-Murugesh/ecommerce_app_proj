interface NumericFieldProps {
    value: number
    setValue: (value: number) => void
    label?: string
    subLabel?: string
    placeholder?: string
}

function NumericField({ value, setValue, label, subLabel, placeholder }: NumericFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
                {label}
            </label>
            <div className="mt-2">
                <input
                    value={value}
                    onChange={e => setValue(parseInt(e.target.value))}
                    type="number"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder={placeholder}
                />
            </div>
            <p className="mt-2 text-sm text-gray-500">
                {subLabel}
            </p>
        </div>
    )
}

export default NumericField