import { writable, derived } from 'svelte/store';

const STORAGE_KEY = 'bhusa-dukan-cart';

function loadCart() {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const savedCart = localStorage.getItem(STORAGE_KEY);

        return savedCart
            ? JSON.parse(savedCart)
            : [];
    } catch (error) {
        console.error('Unable to load cart:', error);
        return [];
    }
}

export const cart = writable(loadCart());

cart.subscribe((items) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(items)
        );
    } catch (error) {
        console.error('Unable to save cart:', error);
    }
});


export function addToCart(product) {

    cart.update((items) => {

        const existingItem = items.find(
            (item) => item.product.id === product.id
        );

        if (existingItem) {

            return items.map((item) =>
                item.product.id === product.id
                    ? {
                        ...item,
                        quantity:
                            item.quantity +
                            item.product.minimumQuantity
                    }
                    : item
            );

        }

        return [
            ...items,
            {
                product,
                quantity: product.minimumQuantity
            }
        ];

    });
}


export function increaseQuantity(productId) {

    cart.update((items) =>

        items.map((item) =>

            item.product.id === productId
                ? {
                    ...item,
                    quantity:
                        item.quantity +
                        item.product.minimumQuantity
                }
                : item

        )

    );
}


export function decreaseQuantity(productId) {

    cart.update((items) =>

        items
            .map((item) =>

                item.product.id === productId
                    ? {
                        ...item,
                        quantity:
                            item.quantity -
                            item.product.minimumQuantity
                    }
                    : item

            )
            .filter((item) => item.quantity > 0)

    );
}


export function removeFromCart(productId) {

    cart.update((items) =>
        items.filter(
            (item) => item.product.id !== productId
        )
    );

}


export function clearCart() {
    cart.set([]);
}


export const cartCount = derived(
    cart,
    ($cart) => $cart.length
);


export const cartSubtotal = derived(
    cart,
    ($cart) =>
        $cart.reduce(
            (total, item) =>
                total +
                Number(item.product.price) *
                item.quantity,
            0
        )
);