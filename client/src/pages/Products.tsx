import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Category, Product } from '../types/order';

const Products = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/inventory/categories');
        setCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const query = selectedCategory !== 'all' ? `?categoryId=${selectedCategory}` : '';
        const response = await API.get(`/inventory/products${query}`);
        setProducts(response.data.data);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };

    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  const handleAddProduct = () => {
    setProductToEdit(null);
    setName('');
    setPrice(0);
    setDescription('');
    setCategory('');
    setImageUrl('');
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setCategory(
      typeof product.category === 'object' && product.category !== null && '_id' in product.category
        ? product.category._id
        : (product.category as string)
    );
    setImageUrl(product.imageUrl);
  };
  

  const handleDeleteProduct = async (id: string) => {
    try {
      await API.delete(`/inventory/products/${id}`);
      setProducts(products.filter(product => product._id !== id));
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

// Handle Save Product (Create/Edit)
const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { name, price, description, category, imageUrl };
  
    try {
      let updatedProduct: Product | null = null;
  
      if (productToEdit) {
        const response = await API.put(`/inventory/products/${productToEdit._id}`, productData);
        updatedProduct = response.data.data;

        if (typeof updatedProduct.category === 'object' && updatedProduct.category._id) {
          updatedProduct.category = updatedProduct.category._id;
        }
        setProducts(products.map(product =>
          product._id === updatedProduct._id ? updatedProduct : product
        ));
      } else {
        const response = await API.post('/inventory/products', productData);
        updatedProduct = response.data.data;
        if (typeof updatedProduct.category === 'object' && updatedProduct.category._id) {
          updatedProduct.category = updatedProduct.category._id;
        }
        setProducts([...products, updatedProduct]);
      }
      

      setName('');
      setPrice(0);
      setDescription('');
      setCategory('');
      setImageUrl('');
      setProductToEdit(null);
    } catch (error) {
      console.error("Error saving product", error);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Products Management</h1>

      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Filter by Category</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <button
          onClick={handleAddProduct}
          className="bg-blue-500 text-white py-2 px-4 rounded mb-2"
        >
          Add Product
        </button>

        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={() => setProductToEdit(null)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
              {productToEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>

      <div className="mb-4">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
                return (
                    <tr key={product._id}>
                    <td className="py-2 px-4 border-b">{product.name}</td>
                    <td className="py-2 px-4 border-b">
                      {categories.find(c => c._id === product.category)?.name || 'Unknown'}
                    </td>
                    <td className="py-2 px-4 border-b">{product.price}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="bg-yellow-500 text-white py-1 px-2 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="bg-red-500 text-white py-1 px-2 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  
                );
            })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
