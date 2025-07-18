import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Spinner } from "../shared/Spinner"
import { uploadImage } from "../funcs"
import { useEffect, useRef, useState } from "react"

interface MultipleImageFileUploadProps {
    label?: string
    onSuccessfullyUploaded?: (url: string) => void
    loading: boolean
    setLoading: (loading: boolean) => void
    value: string[]
    setValue: (value: string[]) => void
}

type Uploaded = {
    url: string
    file: File
}

const MultipleImageFileUpload = ({ label, onSuccessfullyUploaded, loading, setLoading, value, setValue }: MultipleImageFileUploadProps) => {
    const [uploads, setUploads] = useState<Uploaded[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        //  if values are prefilled, ie, value is not empty but uploads is empty
        //  then we need to set uploads to the prefilled values, create empty file objects with filename as the url's last string after '/'.
        if (value.length > 0 && uploads.length === 0) {
            setUploads(value.map(url => ({ url, file: new File([], url.split('/').pop()!) })))
        }
    }, [])

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files?.length === 0) return
        const file = files![0]
        setLoading(true)
        const url = await uploadImage(file)
        setUploads([...uploads, { url, file }])
        setValue([...value, url])
        setLoading(false)
        onSuccessfullyUploaded && onSuccessfullyUploaded(url)
    }

    return <div>
        {
            label && <label className="text-sm font-semibold text-neutral-500">{label}</label>
        }
        <input ref={inputRef} onChange={handleFileUpload} type="file" className="hidden" />
        <div className="flex flex-col gap-y-2 mb-5">
            {
                uploads.map(({ url, file }, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <img src={url} alt="" className="h-10 w-10 object-cover rounded-md" />
                        <span className="text-sm font-semibold text-neutral-500 flex-grow">{file.name}</span>
                        <button onClick={e => {
                            setUploads(uploads.filter((_, i) => i !== index))
                            setValue(value.filter((_, i) => i !== index))
                        }} className="text-sm font-semibold text-neutral-500">
                            <XMarkIcon height={20} />
                        </button>
                    </div>
                ))
            }
        </div>
        <div onClick={e => inputRef.current?.click()} className="py-5 px-3 z-50 flex items-center justify-center border border-neutral-300 cursor-pointer rounded-md">
            {
                loading ? (<>
                    <Spinner />
                    <span className="ml-2 text-sm font-semibold text-neutral-500">Uploading...</span>
                </>) : (<>
                    <PhotoIcon height={20} />
                    <span className="ml-2 text-sm font-semibold text-neutral-500">Upload Image</span>
                </>)
            }

        </div>
    </div>
}

export default MultipleImageFileUpload