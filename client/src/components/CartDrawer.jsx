import { Link } from "react-router-dom";
import useCartStore from "../store/useCartStore";

const CartDrawer = ({ isOpen, onClose }) => {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close cart drawer"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/45 transition-opacity ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 dark:border-gray-700 dark:bg-gray-800 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Shopping Cart
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {itemCount} item{itemCount === 1 ? "" : "s"} selected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-base font-medium text-gray-800 dark:text-gray-100">
              Your cart is empty.
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Add products from the shop, then review everything here or on the
              full cart page.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/shop"
                onClick={onClose}
                className="rounded bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
              >
                Browse Products
              </Link>
              <Link
                to="/cart"
                onClick={onClose}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cart Page
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                        {item.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item._id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        ${item.price.toFixed(2)} each
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Max {Math.max(item.stock, 1)} in stock
                      </p>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max={Math.max(item.stock, 1)}
                      value={item.quantity}
                      onChange={(e) =>
                        setItemQuantity(item._id, e.target.value)
                      }
                      className="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-center text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 text-sm dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">
                      Line total
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Clear
                </button>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="flex-1 rounded bg-indigo-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-600"
                >
                  Cart Page
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
