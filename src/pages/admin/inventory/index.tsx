'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Edit2, X, Check } from 'lucide-react'
import AppShell from '@/components/shared/AppShell' // Import AppShell
import { GetServerSideProps } from 'next' // Import GetServerSideProps
import { adminFirestore } from '@/firebase/admin' // Import adminFirestore for server-side
import { ProductDocument, TProduct } from '@/db/products' // Import ProductDocument

// Define props interface for the component
interface InventoryManagementDashboardProps {
  initialProducts: TProduct[];
}

// Update the component signature to receive initialProducts
const InventoryManagementDashboard: React.FC<InventoryManagementDashboardProps> = ({ initialProducts }) => {
  const [products, setProducts] = useState<TProduct[]>(initialProducts) // Initialize with server-fetched data
  const [editingState, setEditingState] = useState<{productId: string, size: string} | null>(null)
  const [editValue, setEditValue] = useState<number | ''>('')
  const [savingState, setSavingState] = useState<boolean>(false)

  // const productService = new Product() // This will be handled via API calls now

  useEffect(() => {
    // Remove initial fetch, data comes from props
  }, [])

  const startEditing = (productId: string, size: string, currentValue: number) => {
    setEditingState({ productId, size })
    setEditValue(currentValue)
  }

  const cancelEditing = () => {
    setEditingState(null)
    setEditValue('')
  }

  const saveStockUpdate = async () => {
    if (editingState && editValue !== '') {
      setSavingState(true)
      try {
        // Make an API call to update the stock
        const response = await fetch('/api/updateProductStock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: editingState.productId,
            size: editingState.size,
            newQuantity: editValue,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update stock');
        }

        const updatedProductData = await response.json();
        
        // Update the products state with the new data
        setProducts(prev => prev.map(p => p.id === editingState.productId ? updatedProductData.product : p));

      } catch (error) {
        console.error('Error saving stock update:', error);
        alert('Failed to save stock update. Please try again.');
      } finally {
        setSavingState(false);
        setEditingState(null);
        setEditValue('');
      }
    }
  }

  return (
    <AppShell active="Inventory"> {/* Wrap in AppShell */}
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {products.map(product => (
              <AccordionItem key={product.id} value={product.id}>
                <AccordionTrigger className="text-left">
                  <span>{product.name}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.variants.map(variant => (
                        <TableRow key={`${product.id}-${variant.size}`}>
                          <TableCell>{variant.size}</TableCell>
                          <TableCell>
                            {editingState?.productId === product.id && editingState?.size === variant.size ? (
                              <Input 
                                type="number" 
                                value={editValue}
                                onChange={(e) => setEditValue(parseInt(e.target.value, 10) || '')}
                                className="w-24"
                                autoFocus
                              />
                            ) : (
                              variant.available
                            )}
                          </TableCell>
                          <TableCell>
                            {editingState?.productId === product.id && editingState?.size === variant.size ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={saveStockUpdate}
                                  disabled={savingState}
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">Save</span>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={cancelEditing}
                                  disabled={savingState}
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Cancel</span>
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => startEditing(product.id, variant.size, variant.available)}
                                disabled={!!editingState}
                              >
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </AppShell>
  )
}

// getServerSideProps to fetch products on the server
export const getServerSideProps: GetServerSideProps<InventoryManagementDashboardProps> = async () => {
  try {
    const productsSnapshot = await adminFirestore.collection('products').get();
    const initialProducts = productsSnapshot.docs.map((doc) => ({
      ...(doc.data() as ProductDocument),
      id: doc.id,
    }));

    return {
      props: {
        initialProducts: JSON.parse(JSON.stringify(initialProducts)),
      },
    };
  } catch (error) {
    console.error("Error fetching initial product data for inventory:", error);
    return {
      props: {
        initialProducts: [],
      },
    };
  }
};

export default InventoryManagementDashboard;
