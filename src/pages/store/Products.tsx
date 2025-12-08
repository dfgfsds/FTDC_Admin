import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import Button from '../../components/Button';
import Search from '../../components/Search';
import ProductModal from '../../components/products/ProductModal';
import ProductsTable from '../../components/products/ProductsTable';
import ProductDetailsModal from '../../components/products/ProductDetailsModal';
import { Product, ProductForm } from '../../types/product';
import { getAllProductVariantSizeApi, getProductApi } from '../../Api-Service/Apis';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


export default function Products() {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [productForm, setProductForm] = useState<any>();
  const [searchTerm, setSearchTerm] = useState('');

  // const { data,isLoading }:any =useQuery({
  //   queryKey:['getProductData'],
  //   queryFn:()=>getProductApi('?vendor_id=9')
  // });

  const { data, isLoading }: any = useQuery({
    queryKey: ['getAllProductVariantSizeData',id],
    queryFn: () => getAllProductVariantSizeApi(`?vendor_id=${id}`)
  });


  const handleAddProduct = () => {
    // setProductForm(initialProductForm);
    // setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    console.log(product)
    setProductForm(product);
    setIsEditing(true);
    setIsModalOpen(true);
    setSelectedProduct(null);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProductForm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(productForm);
    closeModal();
  };



  const filteredProducts: Product[] = data?.data?.filter((product: Product) => {
    const term = searchTerm?.toLowerCase();
    return (
      product?.name?.toLowerCase()?.includes(term) ||
      // product?.description?.toLowerCase()?.includes(term) ||
      product?.price?.toString()?.includes(term)
    );
  }) || [];

  const handleDownloadExcel = () => {
    if (!filteredProducts.length) {
      alert('No products to download!');
      return;
    }

    // 1. Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredProducts);

    // 2. Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    // 3. Write workbook to binary
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // 4. Create a blob and trigger download
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'products.xlsx');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your store's products and inventory
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button onClick={handleAddProduct} className='flex'>
              <Plus className="h-4 w-4 mr-2 my-auto" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="mt-4 flex justify-between flex-wrap">
          <Search
            value={searchTerm}
            onChange={setSearchTerm}
            // placeholder="Search products by name, description, color, or price..."
            placeholder="Search products by name"

          />
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button onClick={handleDownloadExcel} className='flex'>
              <Download className="h-4 w-4 mr-2 my-auto" />
              Excel Download
            </Button>
          </div>
        </div>

        {isModalOpen && (
          <ProductModal
            productForm={productForm}
            onClose={closeModal}
            onSubmit={handleSubmit}
            onChange={(updates) => setProductForm('')}

          />
        )}

        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onEdit={() => handleEditProduct(selectedProduct)}
          />
        )}

        <ProductsTable
          isLoading={isLoading}
          products={filteredProducts || []}
          onEdit={handleEditProduct}
          onView={handleViewProduct}
        />
      </div>
    </div>
  );
}