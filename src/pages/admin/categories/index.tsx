import AppShell from "@/components/shared/AppShell";
import { useEffect, useState } from "react";
import SlideOver from "@/components/shared/SlideOver";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Categories, type Category } from "@/db/drops";
import DataTable, { TableColumn } from "react-data-table-component";
import { useCollection } from "react-firebase-hooks/firestore";
import firestore from "@/firebase/firestore";
import TextArea from "@/components/forms/TextArea";
import TextField from "@/components/forms/TextField";
// Removed ImageCell as it's no longer needed for cover images
// import ImageCell from "@/components/shared/ImageCell";
import PageHeader from "@/components/admin/PageHeader";
import withAdminAuth from "@/components/withAdminAuth";
import { collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";


function CategoriesPage() {
    const [showCreateSlideOver, setShowCreateSlideOver] = useState(false)
    const [showEditSlideOver, setShowEditSlideOver] = useState(false)

    // FIX: Removed coverImageUrl state
    // const [coverImageUrl, setCoverImageUrl] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [slug, setSlug] = useState<string>("")

    const [currentlyEditingCategory, setCurrentlyEditingCategory] = useState<string>("")
    const [editLoading, setEditLoading] = useState<boolean>(false)
    const [createLoading, setCreateLoading] = useState<boolean>(false)

    const [snapshot, loading, error] = useCollection(collection(firestore, "categories"));
    const [data, setData] = useState<Category[]>([])

    useEffect(() => {
        if (snapshot) {
            const categoriesArray = snapshot.docs.map(doc => ({
                slug: doc.id,
                ...(doc.data() as Omit<Category, 'slug'>)
            }));
            setData(categoriesArray);
        }
    }, [snapshot]);


    const columns: TableColumn<Category>[] = [
        {
            name: "Slug (Unique)",
            selector: row => row.slug,
            sortable: true,
            cell: row => <span className="text-black">{row.slug}</span>
        },
        {
            name: "Name",
            selector: row => row.name,
            sortable: true,
            cell: row => <span className="text-black">{row.name}</span>
        },
        // FIX: Removed Cover Image column
        // {
        //     name: "Cover Image",
        //     cell: row => <ImageCell src={row.image || ''} />
        // },
        {
            name: "Description",
            selector: row => row.description,
            sortable: true,
            cell: row => <span className="text-black">{row.description}</span>
        },
        {
            name: "Actions",
            cell: row => (
                <div className="flex">
                    {/* FIX: Ensure "Edit" button text is white for visibility on dark background, if variant="outline" doesn't handle it */}
                    {/* We can achieve this by overriding the text color if the default outline variant uses a dark text. */}
                    <Button variant="outline" size="sm" onClick={() => {
                        setCurrentlyEditingCategory(row.slug)
                        populateEditFields(row.slug)
                        setShowEditSlideOver(true)
                    }} className="mr-2 text-white bg-gray-700 border-gray-600 hover:bg-gray-600">Edit</Button> {/* Added specific classes for white text and dark background for clarity */}
                    <Button variant="destructive" size="sm" onClick={() => {
                        const categoryService = new Categories()
                        categoryService.deleteCategory(row.slug)
                    }}>Delete</Button>
                </div>
            )
        }
    ]

    const handleCreateCategory = async () => {
        // FIX: Removed coverImageUrl check and usage
        if (!description || !name || !slug) {
            alert("Please fill out all fields.")
            return
        }
        const categoryService = new Categories()
        setCreateLoading(true)
        // FIX: Removed image from payload
        await categoryService.createCategory(slug, { name, description })
        setCreateLoading(false)
        setShowCreateSlideOver(false)
        clearFields()
    }

    const handleEditCategory = async () => {
        // FIX: Removed coverImageUrl check
        if (!description && !name) {
            alert("Please fill out at least one field to update.")
            return
        }
        const categoryService = new Categories()
        setEditLoading(true)
        let payload: any = {}
        // FIX: Removed image from payload
        // if (coverImageUrl) payload.image = coverImageUrl
        if (description) payload.description = description
        if (name) payload.name = name
        await categoryService.updateCategory(currentlyEditingCategory, payload)
        setEditLoading(false)
        setShowEditSlideOver(false)
        clearFields()
    }

    const populateEditFields = (categorySlug: string) => {
        const category = data.find(d => d.slug === categorySlug)
        if (!category) return
        // FIX: Removed setCoverImageUrl
        // setCoverImageUrl(category.image || "")
        setDescription(category.description)
        setName(category.name)
        setSlug(category.slug)
    }

    const clearFields = () => {
        // FIX: Removed setCoverImageUrl
        // setCoverImageUrl("")
        setDescription("")
        setName("")
        setSlug("")
    }

    return <AppShell active="Categories">
        <PageHeader
            title="Categories"
            buttonLabel="Create Category"
            onCreate={() => {
                clearFields()
                setShowCreateSlideOver(true)
            }}
        />
        {loading ? (
            <div className="flex justify-center items-center h-40">
                <p className="text-lg text-gray-600">Loading categories...</p>
            </div>
        ) : error ? (
            <div className="flex justify-center items-center h-40">
                <p className="text-lg text-red-500">Error loading categories: {error.message}</p>
            </div>
        ) : (
            <DataTable
                columns={columns}
                data={data}
                pagination
                className="rounded-lg shadow-md overflow-hidden"
                highlightOnHover
                responsive
            />
        )}
        <SlideOver onSubmit={handleCreateCategory} loading={createLoading} title="Create Category" setOpen={setShowCreateSlideOver} open={showCreateSlideOver}>
            <div className="space-y-5">
                {/* FIX: Removed TextField for Category Cover Image URL */}
                {/*
                <TextField
                    label="Category Cover Image URL"
                    value={coverImageUrl}
                    setValue={setCoverImageUrl}
                    placeholder="Enter URL for category cover image"
                />
                */}
                <TextField
                    label="Category Name"
                    value={name}
                    setValue={setName}
                    placeholder="Enter category name"
                    subLabel="This will be displayed as the title of the category."
                />
                <TextField
                    label="Category Slug"
                    value={slug}
                    setValue={setSlug}
                    placeholder="Example: bridal-services"
                    subLabel="This will be used in the URL and as a unique identifier. It should be unique and contain only lowercase letters, numbers, and hyphens. This cannot be changed later."
                />
                <TextArea
                    label="Category Description"
                    value={description}
                    setValue={setDescription}
                    placeholder="Enter category description"
                    subLabel="This will be displayed as the description of the category."
                />
            </div>
        </SlideOver>
        <SlideOver
            onSubmit={handleEditCategory}
            loading={editLoading}
            title={`Edit ${currentlyEditingCategory}`}
            setOpen={setShowEditSlideOver}
            open={showEditSlideOver}
        >
            <div className="space-y-5">
                {/* FIX: Removed TextField for Category Cover Image URL */}
                {/*
                <TextField
                    label="Category Cover Image URL"
                    value={coverImageUrl}
                    setValue={setCoverImageUrl}
                    placeholder="Enter URL for category cover image"
                />
                */}
                <TextField
                    label="Category Name"
                    value={name}
                    setValue={setName}
                    placeholder="Enter category name"
                    subLabel="This will be displayed as the title of the category."
                />
                <TextArea
                    label="Category Description"
                    value={description}
                    setValue={setDescription}
                    placeholder="Enter category description"
                    subLabel="This will be displayed as the description of the category."
                />
                <TextField
                    label="Category Slug (Not Editable)"
                    value={slug}
                    setValue={setSlug}
                    disabled
                    placeholder="Slug is not editable"
                />
            </div>
        </SlideOver>
    </AppShell>
}

export default withAdminAuth(CategoriesPage)
