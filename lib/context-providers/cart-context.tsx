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
  useApplyDiscountCode,
  useRemoveFromCart,
  useUpdateCartLines,
} from '@finqu/storefront-sdk/react';
import { getFirstUserError, type Cart, type CartLineItem } from '@finqu/storefront-types';

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

function getOperationError(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
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
  /** Apply a discount code to the cart */
  applyDiscountCode: (code: string) => Promise<boolean>;
  /** Latest cart query or mutation error */
  error: string | null;
  /** Clear the latest cart error */
  clearError: () => void;
  /** Checkout URL */
  checkoutUrl: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

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
    error: cartQueryError,
    loading: isCartLoading,
    refetch: refetchCart,
  } = useCartQuery<Cart>(
    { id: cartId ?? '' },
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
  const [applyDiscountMutation, { loading: isApplyingDiscount }] = useApplyDiscountCode<Cart>();

  const isUpdating = isCreating || isAdding || isUpdatingLines || isRemoving || isApplyingDiscount;

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
  const clearError = useCallback(() => setOperationError(null), []);

  // Add item to cart
  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      const merchandiseId = productId;
      if (merchandiseId == null) {
        console.error('Invalid product ID:', productId);
        return;
      }

      setOperationError(null);

      try {
        if (cartId == null) {
          // Create a new cart with the item
          const { data } = await createCartMutation({
            variables: {
              input: {
                lines: [{ merchandiseId, quantity }],
              },
            },
          });

          const mutationError = getFirstUserError(data?.cartCreate);
          if (mutationError) {
            throw new Error(mutationError);
          }

          const newCartId = data?.cartCreate.cart?.id;
          if (!newCartId) {
            throw new Error('The cart could not be created.');
          }
          setCartId(newCartId);
          setCartIdCookie(newCartId);
        } else {
          // Add to existing cart
          const { data } = await addLinesMutation({
            variables: {
              id: cartId,
              lines: [{ merchandiseId, quantity }],
            },
          });

          const mutationError = getFirstUserError(data?.cartLinesAdd);
          if (mutationError) {
            throw new Error(mutationError);
          }
          await refetchCart();
        }

        // Open cart drawer after adding
        openCart();
      } catch (error) {
        setOperationError(getOperationError(error, 'The item could not be added to the cart.'));
        openCart();
        throw error;
      }
    },
    [cartId, createCartMutation, addLinesMutation, openCart, refetchCart]
  );

  // Update item quantity
  const updateItem = useCallback(
    async (lineId: number, quantity: number) => {
      if (!cartId) return;

      setOperationError(null);

      try {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          const { data } = await removeLinesMutation({
            variables: {
              id: cartId,
              lineIds: [lineId],
            },
          });
          const mutationError = getFirstUserError(data?.cartLinesRemove);
          if (mutationError) {
            setOperationError(mutationError);
            return;
          }
        } else {
          const { data } = await updateLinesMutation({
            variables: {
              id: cartId,
              lines: [{ id: lineId, quantity }],
            },
          });
          const mutationError = getFirstUserError(data?.cartLinesUpdate);
          if (mutationError) {
            setOperationError(mutationError);
            return;
          }
        }
        await refetchCart();
      } catch (error) {
        setOperationError(getOperationError(error, 'The cart quantity could not be updated.'));
      }
    },
    [cartId, updateLinesMutation, removeLinesMutation, refetchCart]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (lineId: number) => {
      if (!cartId) return;

      setOperationError(null);

      try {
        const { data } = await removeLinesMutation({
          variables: {
            id: cartId,
            lineIds: [lineId],
          },
        });
        const mutationError = getFirstUserError(data?.cartLinesRemove);
        if (mutationError) {
          setOperationError(mutationError);
          return;
        }
        await refetchCart();
      } catch (error) {
        setOperationError(getOperationError(error, 'The item could not be removed.'));
      }
    },
    [cartId, removeLinesMutation, refetchCart]
  );

  // Apply a discount code while retaining any codes already on the cart
  const applyDiscountCode = useCallback(
    async (code: string) => {
      const normalizedCode = code.trim();
      if (!cartId || !normalizedCode) {
        setOperationError('Enter a discount code to apply.');
        return false;
      }

      setOperationError(null);

      const appliedCodes = (cart?.discounts ?? []).flatMap((discount) =>
        discount.code ? [discount.code] : []
      );
      const hasCode = appliedCodes.some(
        (discountCode) => discountCode.toLowerCase() === normalizedCode.toLowerCase()
      );

      if (hasCode) {
        return true;
      }

      try {
        const { data } = await applyDiscountMutation({
          variables: {
            id: cartId,
            discountCodes: [...appliedCodes, normalizedCode],
          },
        });
        const mutationError = getFirstUserError(data?.cartDiscountCodesUpdate);
        if (mutationError) {
          setOperationError(mutationError);
          return false;
        }
        await refetchCart();
        return true;
      } catch (error) {
        setOperationError(getOperationError(error, 'The discount code could not be applied.'));
        return false;
      }
    },
    [applyDiscountMutation, cart?.discounts, cartId, refetchCart]
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
    applyDiscountCode,
    error: operationError ?? cartQueryError?.message ?? null,
    clearError,
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
