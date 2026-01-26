'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  useCart as useCartQuery,
  useCreateCart,
  useAddToCart,
  useRemoveFromCart,
  useUpdateCartLines,
} from '@finqu/storefront-sdk/react';
import type { Cart, CartLineItem } from '@finqu/storefront-types';

const CART_ID_COOKIE = 'finqu_cart_id';

/**
 * Get cart ID from cookies (returns string hash)
 */
function getCartIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${CART_ID_COOKIE}=([^;]+)`));
  return match ? match[2] : null;
}

/**
 * Set cart ID in cookies (30 day expiry)
 */
function setCartIdCookie(cartId: string) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `${CART_ID_COOKIE}=${cartId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Clear cart ID cookie
 */
function clearCartIdCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${CART_ID_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export interface CartContextValue {
  /** Current cart data */
  cart: Cart | null;
  /** Cart line items */
  items: CartLineItem[];
  /** Total number of items in cart */
  itemCount: number;
  /** Whether cart is loading */
  isLoading: boolean;
  /** Whether a cart operation is in progress */
  isUpdating: boolean;
  /** Whether the cart drawer is open */
  isOpen: boolean;
  /** Open the cart drawer */
  openCart: () => void;
  /** Close the cart drawer */
  closeCart: () => void;
  /** Toggle the cart drawer */
  toggleCart: () => void;
  /** Add item to cart */
  addItem: (variantId: number, quantity?: number) => Promise<void>;
  /** Update item quantity */
  updateItem: (lineId: number, quantity: number) => Promise<void>;
  /** Remove item from cart */
  removeItem: (lineId: number) => Promise<void>;
  /** Checkout URL */
  checkoutUrl: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart ID from cookie on mount
  useEffect(() => {
    const savedCartId = getCartIdFromCookie();
    if (savedCartId != null) {
      setCartId(savedCartId);
    }
    setIsInitialized(true);
  }, []);

  // Fetch cart data when we have a cart ID
  const {
    data: cartData,
    loading: isCartLoading,
    refetch: refetchCart,
  } = useCartQuery<Cart>(
    { cartId: cartId ?? '' },
    {
      skip: !cartId || !isInitialized,
      fetchPolicy: 'network-only',
    }
  );

  const cart = cartData?.cart ?? null;

  // Cart mutations - Apollo style [mutate, { loading }]
  const [createCartMutation, { loading: isCreating }] = useCreateCart<Cart>();
  const [addLinesMutation, { loading: isAdding }] = useAddToCart<Cart>();
  const [updateLinesMutation, { loading: isUpdatingLines }] = useUpdateCartLines<Cart>();
  const [removeLinesMutation, { loading: isRemoving }] = useRemoveFromCart<Cart>();

  const isUpdating = isCreating || isAdding || isUpdatingLines || isRemoving;

  // Derived state
  const items = useMemo(() => cart?.lines ?? [], [cart?.lines]);
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    [items]
  );

  // Cart drawer controls
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  // Add item to cart
  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      const merchandiseId = productId;
      if (merchandiseId == null) {
        console.error('Invalid product ID:', productId);
        return;
      }

      if (cartId == null) {
        // Create a new cart with the item
        const { data } = await createCartMutation({
          variables: {
            input: {
              lines: [{ merchandiseId, quantity }],
            },
          },
        });

        const newCartId = data?.cartCreate.cart?.id;
        if (newCartId) {
          setCartId(newCartId);
          setCartIdCookie(newCartId);
        }
      } else {
        // Add to existing cart
        await addLinesMutation({
          variables: {
            cartId,
            lines: [{ merchandiseId, quantity }],
          },
        });
        refetchCart();
      }
      // Open cart drawer after adding
      openCart();
    },
    [cartId, createCartMutation, addLinesMutation, openCart, refetchCart]
  );

  // Update item quantity
  const updateItem = useCallback(
    async (lineId: number, quantity: number) => {
      if (!cartId) return;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        await removeLinesMutation({
          variables: {
            cartId,
            lineIds: [lineId],
          },
        });
      } else {
        await updateLinesMutation({
          variables: {
            cartId,
            lines: [{ id: lineId, quantity }],
          },
        });
      }
      refetchCart();
    },
    [cartId, updateLinesMutation, removeLinesMutation, refetchCart]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (lineId: number) => {
      if (!cartId) return;
      await removeLinesMutation({
        variables: {
          cartId,
          lineIds: [lineId],
        },
      });
      refetchCart();
    },
    [cartId, removeLinesMutation, refetchCart]
  );

  const value: CartContextValue = {
    cart,
    items,
    itemCount,
    isLoading: !isInitialized || isCartLoading,
    isUpdating,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    updateItem,
    removeItem,
    checkoutUrl: cart?.checkoutUrl ?? null,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to access cart context
 * Must be used within a CartProvider
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
