import { useEffect, useState } from "react";
import { createProduct, deleteProduct, fetchInventory, updateProduct } from "../api/api";
import Loader from "../components/Loader";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", stock: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);

  // fetch current inventory
  useEffect(() => {
    fetchInventory()
      .then(res => setItems(res.data))
      .catch(() => setError("Could not fetch inventory"))
      .finally(() => setLoading(false));
  }, []);

  // new product
  const handleCreate = async () => {
    if (!newProduct.name || newProduct.stock <= 0) {
      setError("Please provide valid product name and stock.");
      return;
    }
    try {
      await createProduct(newProduct);
      setNewProduct({ name: "", stock: 0 }); // reset input
      fetchInventory(); // re-fetch the inventory after creating a product
    } catch (err) {
      setError("Failed to create product.");
    }
  };

  // edit existing product
  const handleEdit = async (id, updatedData) => {
    try {
      await updateProduct(id, updatedData);
      fetchInventory(); // re-fetch the inventory after updating
      setEditMode(null); // exit edit mode
    } catch (err) {
      setError("Failed to update product.");
    }
  };

  // delete a product
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      fetchInventory(); // re-fetch the inventory after deleting
    } catch (err) {
      setError("Failed to delete product.");
    }
  };

  // handle change in the new product form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Inventory</h2>

      {/* product creation form */}
      <div className="mb-4">
        <h3 className="text-lg font-medium">Add New Product</h3>
        <input
          type="text"
          name="name"
          value={newProduct.name}
          onChange={handleChange}
          className="border p-2 mr-2"
          placeholder="Product Name"
        />
        <input
          type="number"
          name="stock"
          value={newProduct.stock}
          onChange={handleChange}
          className="border p-2"
          placeholder="Stock Quantity"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white p-2 rounded ml-2"
        >
          Create Product
        </button>
      </div>

      {/* product list */}
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="bg-white shadow p-3 rounded flex justify-between">
            <span>{item.name}</span>
            <span className="text-gray-700">{item.stock} in stock</span>
            <div className="flex gap-2">
              {/* edit product button */}
              <button
                onClick={() => setEditMode(item.id)}
                className="bg-yellow-500 text-white p-2 rounded"
              >
                Edit
              </button>

              {/* delete product button */}
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Delete
              </button>
            </div>

            {editMode === item.id && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  defaultValue={item.name}
                  onChange={(e) => item.name = e.target.value}
                  className="border p-2"
                />
                <input
                  type="number"
                  defaultValue={item.stock}
                  onChange={(e) => item.stock = e.target.value}
                  className="border p-2"
                />
                <button
                  onClick={() => handleEdit(item.id, { name: item.name, stock: item.stock })}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(null)}
                  className="bg-gray-500 text-white p-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}