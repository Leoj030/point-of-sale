import { Coffee, DollarSign, ShoppingCart, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { fetchCategories } from '../api/category';
import { createOrder, fetchOrders } from '../api/order';
import { fetchProducts } from '../api/product';
import OrderSummary from '../component/OrderSummary';
import { Category, OrderHistoryItem, OrderItem, Product } from '../types/order';

interface CreateOrderPayload {
  items: OrderItem[];
  orderType: string;
  paymentMethod: string;
  amountPaid: number;
}

const orderTypes = [
  { value: 'Dine In', label: 'Dine In', icon: <Coffee /> },
  { value: 'Take Out', label: 'Take Out', icon: <ShoppingCart /> },
  { value: 'Delivery', label: 'Delivery', icon: <Truck /> },
];

const paymentMethods = [
  { value: 'Cash', label: 'Cash', icon: <DollarSign /> },
  { value: 'GCash', label: 'GCash', icon: <DollarSign /> },
];

const Orders: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState('Dine In');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [, setChangeGiven] = useState<number | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<{ id: string; change: number } | null>(null);
  const navigate = useNavigate();

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

  const handleViewReceipt = (orderId: string) => {
    navigate(`/receipt/${orderId}`);
  };

return (
  <div className="p-4">
    {/* Top Section: Products + OrderSummary */}
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* LEFT: Products and Categories */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
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
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform transform hover:scale-105"
            >
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col p-6">
                <div className="font-semibold text-xl text-gray-800">{product.name}</div>
                <p className="text-gray-600 text-sm">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold text-[#f15734] text-2xl">₱{product.price}</div>
                  <div className={`text-sm ${product.quantity > 0 ? 'text-[#f15734]' : 'text-gray-400'} font-semibold`}>
                    {product.quantity > 0 ? `${product.quantity} available` : 'Out of Stock'}
                  </div>
                </div>
                <button
                  className={`w-full py-2 rounded-lg font-semibold transition duration-300 ${
                    product.quantity > 0
                      ? 'bg-white border border-[#f15734] text-[#f15734] hover:bg-[#f15734] hover:text-white'
                      : 'bg-white text-gray-400 border border-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => addToOrder(product)}
                  disabled={product.quantity === 0}
                >
                  {product.quantity > 0 ? 'Add to cart' : 'Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Order Summary (fixed width) */}
      <div className="w-full md:w-[290px]">
        <OrderSummary
          orderItems={orderItems}
          orderType={orderType}
          paymentMethod={paymentMethod}
          amountPaid={amountPaid}
          total={total}
          orderTypes={orderTypes}
          paymentMethods={paymentMethods}
          setOrderType={setOrderType}
          setPaymentMethod={setPaymentMethod}
          setAmountPaid={setAmountPaid}
          changeQuantity={changeQuantity}
          removeFromOrder={removeFromOrder}
          handleCheckout={handleCheckout}
          showReceiptButton={!!lastCompletedOrder}
          onViewReceipt={() => lastCompletedOrder && handleViewReceipt(lastCompletedOrder.id)}
        />
      </div>
    </div>

    {/* Bottom Section: Order History */}
    <div className="mt-8">
      

      {orderHistory.length === 0 ? (
        <div className="text-gray-500">No orders yet.</div>
      ) : (
        <table className="w-full text-sm bg-white rounded shadow overflow-x-auto">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Type</th>
              <th>Payment</th>
              <th>Items</th>
              <th>Total</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orderHistory.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId.slice(0, 8)}</td>
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
                  <button
                    onClick={() => handleViewReceipt(order.orderId)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    View Receipt
                  </button>
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
            try {
              setLoading(true);
              setError('');
              setSuccess('');
              await API.delete('/orders');
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
  </div>
);
};

export default Orders;
