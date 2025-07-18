import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid'
import SingleSelect from './SingleSelect'

interface MultiSelectProps {
    options: {
        value: string
        name: string
    }[]
    values: string[]
    setValues: (value: string[]) => void
    label: string
}

function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

const MultiSelect = ({ options, values, setValues, label }: MultiSelectProps) => {

    return (<>
        <div>
            {
                label && <label className="block text-sm font-medium leading-6 text-gray-900">
                    {label}
                </label>
            }
        </div>
        <div className='flex gap-x-3'>
            {
                values.map((value, index) => {
                    return <div key={index} className="flex items-center space-x-2 border border-neutral-500 p-1 px-2 rounded-lg">
                        <span className="text-sm font-semibold text-gray-900">{options.find(option => option.value === value)?.name}</span>
                        <button onClick={e => {
                            setValues(values.filter((_, i) => i !== index))
                        }} className="text-sm font-semibold text-gray-900">
                            <XMarkIcon height={20} />
                        </button>
                    </div>
                })
            }
        </div>
        <div>
            <SingleSelect
                options={options.filter(option => !values.includes(option.value))}
                value={options[0].value}
                setValue={(value) => setValues([...values, value])}
                label="Add"
            />
        </div>
    </>)
}

export default MultiSelect