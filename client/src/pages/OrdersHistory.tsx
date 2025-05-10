import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import API from '../api/axios';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: unknown; 
}

interface OrderItem {
    id: string;
    productName: string;
    price: number;
    quantity: number;
}

interface Order {
    orderId: string;
    items: OrderItem[];
    totalAmount: number;
    amountPaid: number;
    changeGiven: number;
    orderType: string;
    paymentMethod: string;
    status: string; 
    createdBy: { username: string }; 
    createdAt: string; 
    updatedAt: string; 
}

const OrdersHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await API.get<ApiResponse<Order[]>>('/inventory/orders'); 
                if (response.data && response.data.success) {
                    setOrders(response.data.data || []);
                } else {
                    setError(response.data?.message || 'Failed to fetch orders');
                }
            } catch (err: unknown) { 
                console.error('Error fetching orders:', err);
                let errorMessage = 'An error occurred while fetching orders.';

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
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="container mx-auto p-4">Loading orders...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4 relative">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center justify-between">
                <span>Orders History</span>
            </h1>
            {orders.length === 0 ? (
                <p className="text-gray-600">No orders found.</p>
            ) : (
                <div className="shadow-lg rounded-lg overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="py-3 px-4 text-left">Order ID</th>
                                <th className="py-3 px-4 text-left">Date</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left">Total</th>
                                <th className="py-3 px-4 text-left">Created By</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {orders.map((order) => (
                                <tr key={order.orderId} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-4">{order.orderId}</td>
                                    <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ 
                                            order.status === 'Completed' ? 'bg-green-200 text-green-800' :
                                            order.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                                            order.status === 'Cancelled' ? 'bg-red-200 text-red-800' :
                                            'bg-gray-200 text-gray-800' 
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">₱{order.totalAmount.toFixed(2)}</td>
                                    <td className="py-3 px-4">{order.createdBy?.username || 'N/A'}</td>
                                    <td className="py-3 px-4 text-center">
                                        {(order.status === 'Completed' || order.status === 'Pending') && (
                                            <Link 
                                                to={`/receipt/${order.orderId}`} 
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-xs"
                                            >
                                                Print Receipt
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrdersHistory;
