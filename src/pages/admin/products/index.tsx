import PageHeader from "@/components/admin/PageHeader";
import AppShell from "@/components/shared/AppShell";
import ImageCell from "@/components/shared/ImageCell";
// Removed MultipleImageFileUpload as we'll use TextArea for multiple image links
// import MultipleImageFileUpload from "@/components/forms/MultipleImageFileUpload";
import NumericField from "@/components/forms/NumericField";
import SlideOver from "@/components/shared/SlideOver";
import TextField from "@/components/forms/TextField";
import TextArea from "@/components/forms/TextArea";
import { Product, type TProduct, type Description, type ProductVariantData, ProductDocument } from "@/db/products";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useCollection, useCollectionData } from "react-firebase-hooks/firestore";
// import SingleSelect from "@/components/forms/SingleSelect"; // Not directly used in this snippet, but kept if used elsewhere
import { doc } from "firebase/firestore";
import firestore from "@/firebase/firestore";
import { XMarkIcon } from "@heroicons/react/24/outline";
import MultiSelect from "@/components/forms/MultiSelect";
// Removed ImageFileUpload as we'll use TextField for image links
// import ImageFileUpload from "@/components/forms/ImageFileUpload";
import withAdminAuth from "@/components/withAdminAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { collection } from "firebase/firestore";


function Products() {
    const [showCreateSlideOver, setShowCreateSlideOver] = useState(false)
    const [showEditSlideOver, setShowEditSlideOver] = useState(false)
    const [currentlyEditingProduct, setCurrentlyEditingProduct] = useState<string>("")

    const [products, setProducts] = useState<TProduct[]>([])
    const [allCategories, setAllCategories] = useState<{ slug: string, name: string }[]>([])
    // FIX: Get loading state from useCollection
    const [snapshot, productsLoading] = useCollection(new Product().collection)
    const [categoriesSnapshot, categoriesLoading] = useCollection(collection(firestore, "categories"))

    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const [editLoading, setEditLoading] = useState<boolean>(false)
    // Removed imageUploadWaiting state as it's no longer relevant
    // const [imageUploadWaiting, setImageUploadWaiting] = useState<boolean>(false)

    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<Description>({
        long: "",
        short: ""
    })
    const [slug, setSlug] = useState<string>("")
    const [priceEUR, setPriceEUR] = useState<number>(0)
    const [salePriceEUR, setSalePriceEUR] = useState<number>(-1)
    const [images, setImages] = useState<string[]>([])
    const [featuredImage, setFeaturedImage] = useState<string>("")
    const [featuredImageHover, setFeaturedImageHover] = useState<string>("")
    const [variants, setVariants] = useState<ProductVariantData[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [cateogry, setCategory] = useState<string>("")
    const [details, setDetails] = useState<{ [key: string]: string[] }>({ "What's Included": [] })
    const [selectedDrop, setSelectedDrop] = useState<string>("all")
    const [filteredProducts, setFilteredProducts] = useState<TProduct[]>([])

    useEffect(() => {
        if (!snapshot) return
        const allProducts = snapshot.docs.map(doc => ({ ...(doc.data() as ProductDocument), id: doc.id }))
        setProducts(allProducts)

        if (categoriesSnapshot) {
            const categoriesData = categoriesSnapshot.docs.map(doc => ({ slug: doc.id, name: (doc.data() as { name: string }).name }));
            setAllCategories(categoriesData);
        }

        // Filter products based on selected drop
        if (selectedDrop === "all") {
            setFilteredProducts(allProducts)
        } else {
            setFilteredProducts(allProducts.filter(product => product.categories.includes(selectedDrop)))
        }
    }, [snapshot, categoriesSnapshot, selectedDrop])

    const handleCreateProduct = async () => {
        setCreateLoading(true)
        await new Product().createProduct({
            name,
            description,
            slug,
            priceEUR,
            salePriceEUR,
            featuredImage,
            featuredImageHover,
            images,
            variants,
            categories,
            details
        })
        setCreateLoading(false)
        setShowCreateSlideOver(false)
        clearFields()
    }

    const handleEditProduct = async () => {
        setEditLoading(true)
        await new Product().updateProduct(currentlyEditingProduct, {
            name,
            description,
            slug,
            priceEUR,
            salePriceEUR,
            featuredImage,
            featuredImageHover,
            images,
            variants,
            categories,
            details
        })
        setEditLoading(false)
        setShowEditSlideOver(false)
        clearFields()
    }

    const populateEditFields = (id: string) => {
        const product = products.find(p => p.id === id)
        if (!product) return
        setName(product.name)
        setDescription(product.description)
        setPriceEUR(product.priceEUR)
        setSalePriceEUR(product.salePriceEUR)
        setImages(product.images)
        setVariants(product.variants)
        setCategories(product.categories)
        setDetails({
            "What's Included": product.details["What's Included"] || [],
            ...product.details
        })
        setSlug(product.slug)
        setFeaturedImage(product.featuredImage)
        setFeaturedImageHover(product.featuredImageHover)
    }

    const clearFields = () => {
        setName("")
        setDescription({ long: "", short: "" })
        setPriceEUR(0)
        setSalePriceEUR(-1)
        setImages([])
        setVariants([])
        setCategories([])
        setDetails({ "What's Included": [] })
        setSlug("")
        setFeaturedImage("")
        setFeaturedImageHover("")
    }

    const columns: TableColumn<TProduct>[] = [
        {
            name: "Name",
            selector: row => row.name,
            sortable: true
        },
        {
            name: "Price",
            cell: row => <>Price: €{row.priceEUR}<br />Sale Price: {row.salePriceEUR !== -1 ? `€${row.salePriceEUR}` : 'N/A'}</>,
            sortable: true
        },
        {
            name: "Categories",
            selector: row => row.categories.join(", "),
            sortable: true
        },
        {
            name: "Description",
            cell: row => <VerticalDescriptionViewCell data={row.description} />
        },
        {
            name: "Images",
            cell: row => <ImagesCell data={[row.featuredImage, row.featuredImageHover, ...row.images]} />
        },
        {
            name: "Variants",
            cell: row => <VariantsDataCell data={row.variants} />
        },
        {
            name: "Actions",
            cell: row => <div className="flex">
                <Button variant="outline" size="sm" onClick={() => {
                    setCurrentlyEditingProduct(row.id)
                    populateEditFields(row.id)
                    setShowEditSlideOver(true)
                }} className="mr-2 text-white">Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => new Product().deleteProduct(row.id)}>Delete</Button>
            </div>
        }
    ]

    return <AppShell active="Products">
        <div className="flex items-center mb-4">
            <div className="text-2xl font-semibold text-black">Products</div>
            <div className="flex items-center space-x-4 text-black ml-auto mr-4">
                <Select value={selectedDrop} onValueChange={setSelectedDrop}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {allCategories.map((category) => (
                            <SelectItem key={category.slug} value={category.slug}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <PageHeader
                title=""
                buttonLabel="Create Product"
                onCreate={() => {
                    clearFields()
                    setShowCreateSlideOver(true)
                }}
            />
        </div>
        {/* FIX: Conditional rendering for loading state */}
        {productsLoading || categoriesLoading ? (
            <div className="flex justify-center items-center h-40">
                <p className="text-lg text-gray-600">Loading products...</p>
            </div>
        ) : (
            <DataTable
                columns={columns}
                data={filteredProducts}
                pagination
                pointerOnHover
                className="rounded-lg shadow-md overflow-hidden"
                highlightOnHover
                responsive
            />
        )}
        <SlideOver
            open={showCreateSlideOver}
            setOpen={setShowCreateSlideOver}
            title="Create Product"
            loading={createLoading}
            onSubmit={handleCreateProduct}
        >
            <TextField
                label="Name"
                value={name}
                setValue={setName}
                placeholder="Enter product name"
            />
            <NumericField
                label="Price (EUR)"
                value={priceEUR}
                setValue={setPriceEUR}
                placeholder="Enter product price in EUR"
            />
            <NumericField
                label="Sale Price (EUR)"
                value={salePriceEUR}
                setValue={setSalePriceEUR}
                placeholder="Enter sale price in EUR (NOTE: enter -1 for no sale price)."
            />
            <MultiSelect
                label="Categories"
                options={allCategories.map(category => ({ name: category.name, value: category.slug }))}
                setValues={setCategories}
                values={categories}
            />
            <TextField
                label="Slug"
                value={slug}
                setValue={setSlug}
                placeholder="Enter product slug (e.g., 'bridal-makeup-classic')"
            />
            <TextArea
                label="Short Description"
                value={description.short}
                setValue={(val) => setDescription({ ...description, short: val })}
                placeholder="Enter short description"
            />
            <TextArea
                label="Long Description"
                value={description.long}
                setValue={(val) => setDescription({ ...description, long: val })}
                placeholder="Enter long description"
            />
            <TextField
                label="Featured Image URL"
                value={featuredImage}
                setValue={setFeaturedImage}
                placeholder="Enter URL for featured image"
            />
            <TextField
                label="Featured Image Hover URL"
                value={featuredImageHover}
                setValue={setFeaturedImageHover}
                placeholder="Enter URL for featured image on hover"
            />
            <TextArea
                label="Additional Image URLs (one per line)"
                value={images.join('\n')}
                setValue={(val) => setImages(val.split('\n').filter(url => url.trim() !== ''))}
                placeholder="Enter additional image URLs, one per line"
            />
            {/* FIX: Add Variants and Details input fields */}
            <EditVariantsField data={variants} setData={setVariants} />
            <EditDetailsField data={details} setData={setDetails} />
        </SlideOver>

        <SlideOver
            open={showEditSlideOver}
            setOpen={setShowEditSlideOver}
            title="Edit Product"
            loading={editLoading}
            onSubmit={handleEditProduct}
        >
            <TextField
                label="Name"
                value={name}
                setValue={setName}
                placeholder="Enter product name"
            />
            <NumericField
                label="Price (EUR)"
                value={priceEUR}
                setValue={setPriceEUR}
                placeholder="Enter product price in EUR"
            />
            <NumericField
                label="Sale Price (EUR)"
                value={salePriceEUR}
                setValue={setSalePriceEUR}
                placeholder="Enter sale price in EUR (NOTE: enter -1 for no sale price)."
            />
            <MultiSelect
                label="Categories"
                options={allCategories.map(category => ({ name: category.name, value: category.slug }))}
                setValues={setCategories}
                values={categories}
            />
            <TextField
                label="Slug"
                value={slug}
                setValue={setSlug}
                placeholder="Enter product slug (e.g., 'bridal-makeup-classic')"
            />
            <TextArea
                label="Short Description"
                value={description.short}
                setValue={(val) => setDescription({ ...description, short: val })}
                placeholder="Enter short description"
            />
            <TextArea
                label="Long Description"
                value={description.long}
                setValue={(val) => setDescription({ ...description, long: val })}
                placeholder="Enter long description"
            />
            <TextField
                label="Featured Image URL"
                value={featuredImage}
                setValue={setFeaturedImage}
                placeholder="Enter URL for featured image"
            />
            <TextField
                label="Featured Image Hover URL"
                value={featuredImageHover}
                setValue={setFeaturedImageHover}
                placeholder="Enter URL for featured image on hover"
            />
            <TextArea
                label="Additional Image URLs (one per line)"
                value={images.join('\n')}
                setValue={(val) => setImages(val.split('\n').filter(url => url.trim() !== ''))}
                placeholder="Enter additional image URLs, one per line"
            />
            {/* FIX: Add Variants and Details input fields */}
            <EditVariantsField data={variants} setData={setVariants} />
            <EditDetailsField data={details} setData={setDetails} />
        </SlideOver>
    </AppShell>
}

const VerticalDescriptionViewCell = ({ data }: { data: Description }) => {
    return <div className="text-sm">
        <p className="font-semibold">Short:</p>
        <p>{data.short}</p>
        <p className="font-semibold mt-2">Long:</p>
        <p>{data.long}</p>
    </div>
}

const ImagesCell = ({ data }: { data: string[] }) => {
    return <div className="flex space-x-2 overflow-x-auto py-2">
        {data.map((src, index) => src && (
            <img key={index} src={src} alt={`Product Image ${index}`} className="h-16 w-16 object-cover rounded" />
        ))}
    </div>
}

const VariantsDataCell = ({ data }: { data: ProductVariantData[] }) => {
    return <div className="text-sm">
        {data.map((variant, index) => (
            <p key={index}>{variant.size}: {variant.available} available</p>
        ))}
    </div>
}

const EditDescriptionField = ({ data, setData }: { data: Description, setData: (data: Description) => void }) => {
    return <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">Short Description</label>
        <textarea
            value={data.short}
            onChange={(e) => setData({ ...data, short: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <label className="text-sm font-medium text-gray-700">Long Description</label>
        <textarea
            value={data.long}
            onChange={(e) => setData({ ...data, long: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
    </div>
}

const EditVariantsField = ({ data, setData }: { data: ProductVariantData[], setData: (data: ProductVariantData[]) => void }) => {
    const handleAddVariant = () => {
        setData([...data, { size: "", available: 0 }]);
    };

    const handleRemoveVariant = (index: number) => {
        const newVariants = [...data];
        newVariants.splice(index, 1);
        setData(newVariants);
    };

    const handleChangeVariant = (index: number, field: keyof ProductVariantData, value: string | number) => {
        const newVariants = [...data];
        if (field === 'available') {
            newVariants[index][field] = Number(value);
        } else {
            newVariants[index][field] = value as string;
        }
        setData(newVariants);
    };

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Variants</label>
            {data.map((variant, index) => (
                <div key={index} className="flex space-x-2 items-center">
                    <TextField
                        label={`Size ${index + 1}`}
                        value={variant.size}
                        setValue={(val) => handleChangeVariant(index, 'size', val)}
                        placeholder="e.g., Small, Medium, Large"
                    />
                    <NumericField
                        label="Available"
                        value={variant.available}
                        setValue={(val) => handleChangeVariant(index, 'available', val)}
                        placeholder="e.g., 10"
                    />
                    <Button type="button" onClick={() => handleRemoveVariant(index)} variant="destructive" size="sm">
                        Remove
                    </Button>
                </div>
            ))}
            <Button type="button" onClick={handleAddVariant} variant="outline" size="sm">
                Add Variant
            </Button>
        </div>
    );
};

const EditDetailsField = ({ data, setData }: { data: { [key: string]: string[] }, setData: (data: { [key: string]: string[] }) => void }) => {
    // FIX: Add local state for the new item input
    const [newItemInput, setNewItemInput] = useState<{ [key: string]: string }>({});

    const handleAddKey = () => {
        setData({ ...data, ["New Field"]: [] });
    };

    const handleRemoveKey = (keyToRemove: string) => {
        const newDetails = { ...data };
        delete newDetails[keyToRemove];
        setData(newDetails);
    };

    const handleChangeKeyName = (oldKey: string, newKey: string) => {
        if (oldKey === newKey) return;
        const newDetails = { ...data };
        newDetails[newKey] = newDetails[oldKey];
        delete newDetails[oldKey];
        setData(newDetails);
    };

    const handleAddItem = (key: string) => { // Modified to use local state
        const itemToAdd = newItemInput[key] || '';
        if (itemToAdd.trim() === '') return;

        setData({
            ...data,
            [key]: [...(data[key] || []), itemToAdd.trim()]
        });
        setNewItemInput(prev => ({ ...prev, [key]: '' })); // Clear specific input field
    };

    const handleRemoveItem = (key: string, index: number) => {
        const newItems = [...(data[key] || [])];
        newItems.splice(index, 1);
        setData({
            ...data,
            [key]: newItems
        });
    };

    const handleChangeItem = (key: string, index: number, value: string) => {
        const newItems = [...(data[key] || [])];
        newItems[index] = value;
        setData({
            ...data,
            [key]: newItems
        });
    };

    return (
        <div className="flex flex-col space-y-4">
            <label className="text-lg font-semibold text-gray-800 mb-2">Product Details</label>
            {Object.entries(data).map(([key, items]) => (
                <div key={key} className="border border-gray-300 p-4 rounded-md space-y-4 bg-gray-50 shadow-sm">
                    <div className="flex items-center space-x-2">
                        <div className="flex-grow"> {/* FIX: Apply flex-grow to a wrapper div */}
                            <TextField
                                label=""
                                value={key}
                                setValue={(val) => handleChangeKeyName(key, val)}
                                placeholder="Detail Title (e.g., 'What's Included')"
                                // Removed className="flex-grow" from here
                            />
                        </div>
                        <Button type="button" onClick={() => handleRemoveKey(key)} variant="destructive" size="sm">
                            Remove Detail
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Items for "{key}"</label>
                        {items.map((item, index) => (
                            <div key={index} className="flex space-x-2 items-center">
                                <div className="flex-grow"> {/* FIX: Apply flex-grow to a wrapper div */}
                                    <TextField
                                        label=""
                                        value={item}
                                        setValue={(val) => handleChangeItem(key, index, val)}
                                        placeholder={`Item ${index + 1}`}
                                        // Removed className="flex-grow" from here
                                    />
                                </div>
                                <Button type="button" onClick={() => handleRemoveItem(key, index)} variant="outline" size="sm">
                                    <XMarkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {/* FIX: Use local state for new item input and simplified handlers */}
                        <div className="flex space-x-2 items-center">
                            <div className="flex-grow"> {/* FIX: Apply flex-grow to a wrapper div */}
                                <TextField
                                    label=""
                                    value={newItemInput[key] || ''}
                                    setValue={(val) => setNewItemInput(prev => ({ ...prev, [key]: val }))}
                                    placeholder="Add new item"
                                    
                                />
                            </div>
                            <Button type="button" onClick={() => handleAddItem(key)} variant="outline" size="sm">
                                Add Item
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
            <Button type="button" onClick={handleAddKey} variant="outline" size="sm">
                Add New Detail Field
            </Button>
        </div>
    );
};

export default withAdminAuth(Products)