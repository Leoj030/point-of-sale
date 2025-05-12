import { HandCoins, Minus, Plus, Receipt, ShoppingBag, Smartphone, Trash2, Truck, Utensils } from 'lucide-react';
import clsx from 'clsx';
import React from 'react';
import { OrderItem } from '../types/order';

const orderTypeOptions = [
  { value: 'Dine In', label: 'Dine In', icon: <Utensils className="w-7 h-7" strokeWidth={1.5} /> },
  { value: 'Take Out', label: 'Take Out', icon: <ShoppingBag className="w-7 h-7" strokeWidth={1.5} /> },
  { value: 'Delivery', label: 'Delivery', icon: <Truck className="w-7 h-7" strokeWidth={1.5}  /> },
];

const paymentMethodOptions = [
  { value: 'Cash', label: 'Cash', icon: <HandCoins className="w-7 h-7" strokeWidth={1.5}/> },
  { value: 'GCash', label: 'GCash', icon: <Smartphone className="w-7 h-7" strokeWidth={1.5} /> },
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
  showReceiptButton: boolean;
  onViewReceipt: () => void;
}

const OrderSummary: React.FC<Props> = ({
  orderItems,
  orderType,
  paymentMethod,
  amountPaid,
  total,

  setOrderType,
  setPaymentMethod,
  setAmountPaid,
  changeQuantity,
  removeFromOrder,
  handleCheckout,
  showReceiptButton,
  onViewReceipt,
}) => {
  return (
    <div className="w-[307.5px] bg-white rounded shadow p-4 overflow-y-auto max-h-[90vh] absolute top-0 right-0">
      <h2 className="text-2xl font-bold mb-2">Order Summary</h2>

      <div className="mb-4">
        <div className="flex justify-between gap-1">
          {orderTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOrderType(opt.value)}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center h-20 rounded-lg transition drop-shadow-lg whitespace-nowrap text-sm px-1",
                orderType === opt.value
                  ? "bg-[#f15734] text-white"
                  : "bg-white text-gray-600 hover:bg-[#fcefe9] hover:text-[#f15734]"
              )}
            >
              <div className="mb-1">{opt.icon}</div>
              <span className="text-center">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

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

      <div className="mb-4">
        <div className="flex justify-between gap-1">
          {paymentMethodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPaymentMethod(opt.value)}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center h-20 rounded-lg transition drop-shadow-lg whitespace-nowrap text-sm px-1",
                paymentMethod === opt.value
                  ? "bg-[#f15734] text-white"
                  : "bg-white text-gray-600 hover:bg-[#fcefe9] hover:text-[#f15734]"
              )}
            >
              <div className="mb-1">{opt.icon}</div>
              <span className="text-center">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

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
        disabled={orderItems.length === 0}
      >
        Checkout
      </button>

      {showReceiptButton && (
        <button
          onClick={onViewReceipt}
          className="w-full mt-2 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
        >
          <Receipt className="w-5 h-5" />
          View Receipt
        </button>
      )}
    </div>
  );
};

export default OrderSummary;