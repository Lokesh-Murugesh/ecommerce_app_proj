export async function uploadImage(file: File) {
    const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
    const response = await fetch("/api/uploadImage", {
        method: "POST",
        body: JSON.stringify({
            imageBase64: base64File
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    if (!response.ok) throw new Error("Error uploading image")
    const data = await response.json()
    return data.url
}