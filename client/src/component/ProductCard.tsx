import React from 'react';
import { OrderItem, Product } from '../types/order';

interface ProductCardProps {
  product: Product;
  itemInCart: OrderItem | undefined;
  addToOrder: (product: Product) => void;
  changeQuantity: (id: string, delta: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  itemInCart,
  addToOrder,
  changeQuantity,
}) => {
  return (
    <div className="rounded-2xl flex flex-col items-center bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="w-full h-48 border-[#f15734] overflow-hidden relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full rounded-t-2xl object-cover"
        />
      </div>
      <div className="p-4 flex flex-col w-full">
        <div className="font-semibold text-xl">{product.name}</div>
        <div className="text-gray-700 text-sm">{product.description}</div>
        <div className="text-3xl font-bold text-[#f15734] mb-2">₱{product.price}</div>
        <div
          className={`text-sm mb-4 ${
            product.quantity > 0
              ? 'text-[#f15734] font-semibold'
              : 'text-gray-700 font-semibold'
          }`}
        >
          {product.quantity > 0
            ? `${product.quantity} available`
            : 'Out of Stock'}
        </div>

        {itemInCart ? (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => changeQuantity(product._id, -1)}
              className="bg-white border-2 text-2xl border-[#f15734] text-[#f15734] rounded-full w-10 h-10 flex justify-center hover:bg-[#f15734] hover:text-white"
            >
              −
            </button>
            <span className="font-bold text-2xl mx-2 text-[#f15734]">
              {itemInCart.quantity}
            </span>
            <button
              onClick={() => changeQuantity(product._id, 1)}
              className={`border-2 border-[#f15734] w-10 h-10 rounded-full flex justify-center text-2xl text-[#f15734] ${
                itemInCart.quantity < product.quantity
                  ? 'bg-white hover:bg-[#f15734] hover:text-white'
                  : 'bg-white border-2 border-gray-700 cursor-not-allowed'
              }`}
              disabled={itemInCart.quantity >= product.quantity}
            >
              +
            </button>
          </div>
        ) : (
          <button
            className={`text-[#f15734] px-4 py-2 rounded-full w-full ${
              product.quantity > 0
                ? 'bg-[#fcefe9] border border-[#f15734] hover:bg-[#f15734] hover:text-white'
                : 'bg-white border border-gray-700 cursor-not-allowed text-gray-700 font-semibold'
            }`}
            onClick={() => addToOrder(product)}
            disabled={product.quantity === 0}
          >
            {product.quantity > 0 ? 'Add to cart' : 'Unavailable'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;