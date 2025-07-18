import { CheckCircleIcon, PhotoIcon } from "@heroicons/react/24/outline"
import { Spinner } from "../shared/Spinner"
import { uploadImage } from "../funcs"
import { useRef, useState } from "react"

export interface ImageFileUploadProps {
    label?: string
    onSuccessfullyUploaded?: (url: string) => void
    loading: boolean
    setLoading: (loading: boolean) => void
    value: string
    setValue: (value: string) => void
}

const ImageFileUpload = ({ label, onSuccessfullyUploaded, loading, setLoading, value, setValue }: ImageFileUploadProps) => {

    const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [file, setFile] = useState<File | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        setState("loading")
        setLoading(true)
        setFile(file)

        try {
            const url = await uploadImage(file)
            setState("success")
            setValue(url)
            onSuccessfullyUploaded && onSuccessfullyUploaded(url)
        } catch (error) {
            setState("error")
        }

        setLoading(false)
    }

    return <div>
        {
            label && <label className="text-sm font-semibold text-neutral-900">{label}</label>
        }
        <input ref={inputRef} onChange={handleFileUpload} type="file" className="hidden" />
        <div onClick={e => inputRef.current?.click()} className="py-5 px-3 flex items-center justify-center border border-neutral-300 cursor-pointer rounded-md">
            {
                state === "idle" ? (<>
                    <PhotoIcon height={20} />
                    <span className="ml-2 text-sm font-semibold text-neutral-500">
                        {
                            value ? "Change Image" : "Upload Image"
                        }
                    </span>
                </>) : state === "loading" ? (<>
                    <Spinner />
                    <span className="ml-2 text-sm font-semibold text-neutral-500">Uploading {file?.name.substring(0, 10)}{file?.name.length! > 10 && "..."}</span>
                </>) : state === "success" ? (<>
                    <CheckCircleIcon height={20} />
                    <span className="ml-2 text-sm font-semibold text-neutral-500">Uploaded {file?.name.substring(0, 10)}{file?.name.length! > 10 && "..."}</span>
                </>) : state === "error" ? (<>
                    <span className="text-sm font-semibold text-red-500">Error uploading {file?.name.substring(0, 10)}{file?.name.length! > 10 && "..."}</span>
                </>) : null
            }
        </div>
        {
            value && <a href={value} target="_blank" rel="noreferrer" className="text-xs opacity-90 text-blue-500">Preview</a>
        }
    </div>
}

export default ImageFileUpload