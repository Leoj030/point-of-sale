import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { updateOrderStatus } from '../api/order';

interface OrderItemSnapshot {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface ReceiptData {
  orderId: string;
  items: OrderItemSnapshot[];
  totalAmount: number;
  amountPaid: number;
  changeGiven: number;
  orderType: string;
  paymentMethod: string;
  status: string;
  createdAt: string; 
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: unknown; 
}

const ReceiptView: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const response = await API.get<ApiResponse<ReceiptData>>(`/receipts/${orderId}`);
        if (response.data && response.data.success && response.data.data) {
          setReceipt(response.data.data);
          setError(null);
          
          if (response.data.data.status === 'Pending') {
            try {
              
              const updateResponse = await updateOrderStatus(orderId, 'Completed'); 
              if (!updateResponse.success) {
                
                console.warn('Failed to update order status to Completed:', updateResponse.message);
                
              }
            } catch (statusUpdateError) {
              console.error('Error updating order status:', statusUpdateError);
            }
          }
        } else {
          setError(response.data?.message || 'Failed to fetch receipt data.');
          setReceipt(null);
        }
      } catch (err: unknown) {
        console.error('Error fetching receipt:', err);
        let errorMessage = 'An error occurred while fetching receipt.';
        if (typeof err === 'object' && err !== null) {
            if ('response' in err) {
                const errorResponse = (err as { response?: { data?: ApiResponse<null> } }).response;
                if (errorResponse?.data?.message) {
                    errorMessage = errorResponse.data.message;
                } else if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
                    errorMessage = (err as { message: string }).message;
                }
            } else if ('message' in err && typeof (err as { message: unknown }).message === 'string'){
                errorMessage = (err as { message: string }).message;
            }
        } else if (typeof err === 'string') {
            errorMessage = err;
        }
        setError(errorMessage);
        setReceipt(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-4">Loading receipt...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!receipt) return <div className="p-4">No receipt data found.</div>;

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 my-8 print-receipt-container">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">POS System</h1> 
        <p className="text-sm">Description</p>
        <p className="text-sm">Phone: (+63) 912-3456-789</p>
        <p className="text-lg font-semibold mt-4">Order Receipt</p>
      </div>

      <div className="mb-4">
        <p><strong>Order ID:</strong> {receipt.orderId}</p>
        <p><strong>Date:</strong> {new Date(receipt.createdAt).toLocaleString()}</p>
      </div>

      <table className="w-full mb-4 text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Item</th>
            <th className="text-center py-2">Qty</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item) => (
            <tr key={item.productId} className="border-b">
              <td className="py-2">{item.name}</td>
              <td className="text-center py-2">{item.quantity}</td>
              <td className="text-right py-2">₱{item.price.toFixed(2)}</td>
              <td className="text-right py-2">₱{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-4 text-right">
        <p><strong>Subtotal:</strong> ₱{receipt.totalAmount.toFixed(2)}</p>
        {/* Add tax, discounts if applicable */}
        <p className="font-bold"><strong>Total Amount:</strong> ₱{receipt.totalAmount.toFixed(2)}</p>
        <p><strong>Amount Paid ({receipt.paymentMethod}):</strong> ₱{receipt.amountPaid.toFixed(2)}</p>
        <p><strong>Change Given:</strong> ₱{receipt.changeGiven.toFixed(2)}</p>
      </div>

      <div className="text-center mt-6 mb-2">
        <p className="text-sm">Thank you for your purchase!</p>
      </div>

      <div className="text-center mt-8 print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default ReceiptView;
