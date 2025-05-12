import { HandCoins, Minus, Plus, ShoppingBag, Smartphone, Trash2, Truck, Utensils } from 'lucide-react';
import React from 'react';
import { OrderItem } from '../types/order';
import IconButtonGroup from './IconButtonGroup';

const orderTypeOptions = [
  { value: 'dine-in', label: 'Dine-In', icon: <Utensils className="w-7 h-7" strokeWidth={1.5} /> },
  { value: 'take-out', label: 'To-Go', icon: <ShoppingBag className="w-7 h-7" strokeWidth={1.5} /> },
  { value: 'delivery', label: 'Delivery', icon: <Truck className="w-7 h-7" strokeWidth={1.5}  /> },
];

const paymentMethodOptions = [
  { value: 'cash', label: 'Cash', icon: <HandCoins className="w-7 h-7" strokeWidth={1.5}/> },
  { value: 'gcash', label: 'GCash', icon: <Smartphone className="w-7 h-7" strokeWidth={1.5} /> },
];

interface Props {
  orderItems: OrderItem[];
  orderType: string;
  paymentMethod: string;
  amountPaid: string;
  total: number;
  orderTypes: { value: string; label: string }[];
  paymentMethods: { value: string; label: string }[];
  setOrderType: (val: string) => void;
  setPaymentMethod: (val: string) => void;
  setAmountPaid: (val: string) => void;
  changeQuantity: (id: string, delta: number) => void;
  removeFromOrder: (id: string) => void;
  handleCheckout: () => void;
}

const OrderSummary: React.FC<Props> = ({
  orderItems,
  orderType,
  paymentMethod,
  amountPaid,
  total,
  orderTypes,
  paymentMethods,
  setOrderType,
  setPaymentMethod,
  setAmountPaid,
  changeQuantity,
  removeFromOrder,
  handleCheckout,
}) => {
  return (
    <div className="w-[307.5px] bg-white rounded shadow p-4 overflow-y-auto max-h-[90vh] absolute top-0 right-0">
      <h2 className="text-2xl font-bold mb-2">Order Summary</h2>

      <IconButtonGroup
        value={orderType}
        onChange={setOrderType}
        options={orderTypeOptions}
      />

      {orderItems.length === 0 ? (
      <div className="text-gray-500">No items in order.</div>
      ) : (
        <div className="space-y-3 mb-4">
          {orderItems.map((item) => (
            
            <div
              key={item.id}
              className="flex items-center justify-between p-2 border border-gray-400 rounded-lg hover:bg-gray-50"
            >
              <button
                onClick={() => removeFromOrder(item.id)}
                className="text-gray-400 hover:text-[#f15734] mr-[8px]"
                title="Remove item"
              >
                <Trash2 className="w- h-5" />
              </button>
              
              <div className="flex-1">
                <div className="font-medium text-l mb-[-5px]">{item.productName}</div>
                <div className="w-20 text-left text-[#f15734] font-bold">₱{(item.price * item.quantity).toFixed(2)}</div>
              </div>

              <div className="flex gap-2 items-center">
              <button
                onClick={() => changeQuantity(item.id, -1)}
                className="w-6 h-6 bg-[#fcefe9] text-[#f15734] rounded-full hover:bg-gray-300 flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className='text-[#f15734] text-2xl'>{item.quantity}</span>
              <button
                onClick={() => changeQuantity(item.id, 1)}
                className="w-6 h-6 bg-[#fcefe9] text-[#f15734] rounded-full hover:bg-gray-300 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            </div>
          ))}
        </div>

      )}
      <div className='flex mb-2 bg-gray-200 p-2 justify-between rounded-lg'>
        <div className='text-left'>Total Amount</div>
        <span className="font-bold">₱{total.toFixed(2)}</span>
      </div>

      <IconButtonGroup
        value={paymentMethod}
        onChange={setPaymentMethod}
        options={paymentMethodOptions}
      />

      <div className="mt-4">
        <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">Amount Paid:</label>
        <input
          type="number"
          id="amountPaid"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          className="w-full border px-2 py-1 rounded-lg"
        />
      </div>

      <button
        onClick={handleCheckout}
        className="w-full mt-2 py-2 bg-[#fcefe9] text-[#f15734] border border-[#f15734] font-bold rounded-lg hover:bg-[#f15734] hover:text-white transition"
      >
        Checkout
      </button>
    </div>
  );
};

export default OrderSummary;