import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../api/category';
import { fetchProducts } from '../api/product';
import { fetchOrders, createOrder, updateOrderStatus } from '../api/order';
import { Category, Product, OrderItem, OrderHistoryItem } from '../types/order';
import API from '../api/axios';

interface CreateOrderPayload {
  items: OrderItem[];
  orderType: string;
  paymentMethod: string;
  status: string;
  amountPaid: number;
}

const orderTypes = [
  { value: 'Dine In', label: 'Dine In' },
  { value: 'Take Out', label: 'Take Out' },
  { value: 'Delivery', label: 'Delivery' },
];

const paymentMethods = [
  { value: 'Cash', label: 'Cash' },
  // Add more in the future
];

const orderStatusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
];

const Orders: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState(orderTypes[0].value);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].value);
  const [orderStatus, setOrderStatus] = useState(orderStatusOptions[0].value);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [amountPaid, setAmountPaid] = useState<string>(''); 
  const [changeGiven, setChangeGiven] = useState<number | null>(null); 
  const [lastCompletedOrder, setLastCompletedOrder] = useState<{ id: string; change: number } | null>(null); 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes, orderRes] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
          fetchOrders(),
        ]);
        setCategories(catRes || []);
        setProducts(prodRes || []);
        setOrderHistory(orderRes || []);
      } catch (err) {
        setError('Failed to load categories, products, or orders: ' + err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const addToOrder = (product: Product) => {
    const productInList = products.find(p => p._id === product._id);
    if (!productInList || productInList.quantity === 0) {
      setError(`Cannot add ${product.name}, it is out of stock.`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Update the product quantity immediately
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p._id === product._id 
          ? { ...p, quantity: p.quantity - 1 }
          : p
      )
    );

    setOrderItems((prev) => {
      const existing = prev.find((item) => item.id === product._id);
      if (existing) {
        if (existing.quantity >= productInList.quantity) {
          setError(`No more stock available for ${product.name}. Max: ${productInList.quantity}`);
          setTimeout(() => setError(''), 3000);
          return prev; 

        }
        return prev.map((item) =>
          item.id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: product._id,
            productName: product.name,
            price: product.price,

            quantity: 1, 
          },
        ];
      }
    });
  };

  const removeFromOrder = (id: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const changeQuantity = (id: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const productInList = products.find(p => p._id === item.id);

            if (!productInList) return item; 

            let newQuantity = item.quantity + delta;
            if (delta > 0 && newQuantity > productInList.quantity) {
              newQuantity = productInList.quantity; 
              setError(`No more stock available for ${item.productName}. Max: ${productInList.quantity}`);
              setTimeout(() => setError(''), 3000);
            }
            return { ...item, quantity: Math.max(1, newQuantity) };
          }
          return item;
        })
    );
  };

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (orderItems.length === 0) return;
    if (!amountPaid || parseFloat(amountPaid) < total) {
      setError('Amount paid must be greater than or equal to the total.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setChangeGiven(null);
    setLastCompletedOrder(null);

    try {
      const response = await createOrder({
        items: orderItems,
        orderType,
        paymentMethod,
        status: 'Completed', 
        amountPaid: parseFloat(amountPaid),
      } as CreateOrderPayload);
      
      if (response && response.success && response.data) {
        setOrderItems([]);
        setAmountPaid('');
        setChangeGiven(response.data.changeGiven);
        setLastCompletedOrder({ id: response.data.orderId, change: response.data.changeGiven });
        setSuccess(`Order placed successfully! Change: $${response.data.changeGiven.toFixed(2)}`);

        setProducts(prevProducts => 
          prevProducts.map(p => {
            const orderedItem = orderItems.find(oi => oi.id === p._id);
            if (orderedItem) {
              return { ...p, quantity: p.quantity - orderedItem.quantity };
            }
            return p;
          })
        );

        const orderRes = await fetchOrders();
        setOrderHistory(orderRes || []);
      } else {
        setError(response?.message || 'Failed to place order. Unexpected response structure.');
      }
    } catch (err: unknown) { 
      let errorMessage = 'Failed to place order';
      if (typeof err === 'object' && err !== null) {
        if ('response' in err) {
            const errResponse = (err as { response?: { data?: { message?: string } } }).response;
            if (errResponse?.data?.message) {
                errorMessage = errResponse.data.message;
            } else if ('message' in err && typeof (err as {message?:unknown}).message === 'string'){
                 // Fallback to top-level error message if response.data.message is not specific
                errorMessage = (err as {message: string}).message;
            }
        } else if ('message' in err && typeof (err as {message?:unknown}).message === 'string') {
            errorMessage = (err as {message: string}).message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatusHandler = async (orderId: string, newStatus: string) => {
    setLoading(true);
    setError('');
    try {
      await updateOrderStatus(orderId, newStatus);
      const orderRes = await fetchOrders();
      setOrderHistory(orderRes || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update order status');
    }
    setLoading(false);
  };

  return (
    <div className="border-4 p-4 border-[#f15734]">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          className={`px-3 py-1 rounded ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`px-3 py-1 rounded ${selectedCategory === cat._id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="flex gap-4 mb-8">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product._id} className="border rounded p-4 flex flex-col items-center">
              <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover mb-2" />
              <div className="font-bold">{product.name}</div>
              <div className="text-gray-600 text-sm mb-2">{product.description}</div>
              <div className="mb-2">₱{product.price}</div>
              <div className={`text-sm mb-2 ${product.quantity > 0 ? 'text-green-600' : 'text-red-600 font-semibold'}`}>
                {product.quantity > 0 ? `${product.quantity} available` : 'Out of Stock'}
              </div>
              <button
                className={`text-white px-3 py-1 rounded ${product.quantity > 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                onClick={() => addToOrder(product)}
                disabled={product.quantity === 0}
              >
                {product.quantity > 0 ? '+ Add' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>

        <div className="w-full sm:w-1/3 md:w-1/4 bg-white rounded shadow p-4 overflow-auto">
          <h2 className="text-lg font-bold mb-2">Order Summary</h2>
          {orderItems.length === 0 ? (
            <div className="text-gray-500">No items in order.</div>
          ) : (
            <table className="w-full mb-2">
              <thead>
                <tr>
                  <th className="text-left">Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>
                      <button onClick={() => changeQuantity(item.id, -1)} className="px-2">-</button>
                      {item.quantity}
                      <button onClick={() => changeQuantity(item.id, 1)} className="px-2">+</button>
                    </td>
                    <td>₱{item.price * item.quantity}</td>
                    <td>
                      <button onClick={() => removeFromOrder(item.id)} className="text-red-500">x</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        <div className="mb-2">Total: <span className="font-bold">₱{total.toFixed(2)}</span></div>
        <div className="mb-2 flex gap-2">
          <label>Order Type:
            <select
              className="ml-2 border rounded px-2 py-1"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              {orderTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </label>
          <label>Payment:
            <select
              className="ml-2 border rounded px-2 py-1"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((pm) => (
                <option key={pm.value} value={pm.value}>{pm.label}</option>
              ))}
            </select>
          </label>
          <label>Status:
            <select
              className="ml-2 border rounded px-2 py-1"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
            >
              {orderStatusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4">
          <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">Amount Paid:</label>
          <input 
            type="number" 
            id="amountPaid" 
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="Enter amount customer paid"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {changeGiven !== null && (
          <div className="mt-2 text-lg font-semibold text-green-600">
            Change Due: ${changeGiven.toFixed(2)}
          </div>
        )}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2 w-full disabled:opacity-50"
          onClick={handleCheckout}
          disabled={orderItems.length === 0 || loading || !amountPaid || parseFloat(amountPaid) < total}
        >
          {loading ? 'Placing Order...' : 'Checkout'}
        </button>

        {lastCompletedOrder && (
          <button 
            onClick={() => window.open(`/receipt/${lastCompletedOrder.id}`, '_self')} 
            className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Print Receipt for Last Order
          </button>
        )}
      </div> {/* End of Order Summary */}
      </div> {/* End of flex gap-4 mb-8 */}
      {/* Order History Section */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold mb-2">Order History</h2>
        <button
          style={{ background: 'none', border: 'none', padding: 0, marginLeft: '1rem', cursor: 'pointer', color: 'black', fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}
          title="Delete Order History"
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete all order history? This action cannot be undone.')) {
              try {
                setLoading(true);
                setError('');
                await API.delete('/inventory/orders');
                setOrderHistory([]);
                setSuccess('All order history deleted successfully.');
              } catch {
                setError('Failed to delete order history.');
              } finally {
                setLoading(false);
              }
            }
          }}
          disabled={loading || orderHistory.length === 0}
        >
          x
        </button>
      </div>
      {orderHistory.length === 0 ? (
        <div className="text-gray-500">No orders yet.</div>
      ) : (
        <table className="w-full text-sm bg-white rounded shadow">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Type</th>
              <th>Payment</th>
              <th>Items</th>
              <th>Total</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orderHistory.map((order) => (
              <tr key={order.orderId} className={order.status === 'Pending' ? 'bg-yellow-50' : ''}>
                <td>{order.orderId.slice(0, 8)}</td>
                <td>{order.status}</td>
                <td>{order.orderType}</td>
                <td>{order.paymentMethod}</td>
                <td>
                  {order.items.map((item) => (
                    <div key={item.id}>{item.productName} x{item.quantity}</div>
                  ))}
                </td>
                <td>₱{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  {order.status === 'Pending' && (
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => updateOrderStatusHandler(order.orderId, 'Completed')}
                      disabled={loading}
                    >
                      Mark Completed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex justify-end mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          onClick={async () => {
            setLoading(true);
            setError('');
            setSuccess('');
            try {
              await API.delete('/inventory/orders');
              setOrderHistory([]);
              setSuccess('All order history deleted successfully.');
            } catch {
              setError('Failed to delete order history.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading || orderHistory.length === 0}
        >
          Delete All Order History
        </button>
      </div>
    </div>
  );
};

export default Orders;
