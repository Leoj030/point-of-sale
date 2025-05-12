import React from 'react';
import { OrderHistoryItem } from '../types/order';

interface OrderHistoryProps {
  orderHistory: OrderHistoryItem[];
  loading: boolean;
  onDeleteAll: () => void;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  error: string;
  success: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  orderHistory,
  loading,
  onDeleteAll,
  onUpdateStatus,
  error,
  success,
}) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold mb-2">Order History</h2>
        <button
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            marginLeft: '1rem',
            cursor: 'pointer',
            color: 'black',
            fontSize: '2rem',
            fontWeight: 'bold',
            lineHeight: 1,
          }}
          title="Delete Order History"
          onClick={onDeleteAll}
          disabled={loading || orderHistory.length === 0}
        >
          x
        </button>
      </div>

      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory;