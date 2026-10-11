<script>
    import {
        cart,
        cartSubtotal,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart
    } from '../stores/cartStore.js';
</script>

<section class="cart-page">

    <div class="cart-header">
        <div>
            <label>YOUR CART</label>
            <h1>Shopping Cart</h1>
        </div>

        <a href="/#products" class="continue-shopping">
            ← Continue Shopping
        </a>
    </div>


    {#if $cart.length === 0}

        <div class="empty-cart">

            <div class="empty-icon">🛒</div>

            <h2>Your cart is empty</h2>

            <p>
                Add some quality bhusa to your cart to continue.
            </p>

            <a href="/#products">
                Shop Bhusa
            </a>

        </div>

    {:else}

        <div class="cart-layout">

            <!-- CART ITEMS -->
            <div class="cart-items">

                {#each $cart as item}

                    <div class="cart-item">

                        <div class="product-icon">
                            {item.product.name.toLowerCase().includes('wheat')
                                ? '🌾'
                                : '🌿'}
                        </div>


                        <div class="product-info">

                            <h3>
                                {item.product.name}
                            </h3>

                            <p>
                                ₹{Number(item.product.price).toFixed(2)}
                                / {item.product.unit}
                            </p>


                            <div class="quantity-control">

                                <button
                                        on:click={() =>
                                        decreaseQuantity(item.product.id)}
                                >
                                    −
                                </button>

                                <strong>
                                    {item.quantity} KG
                                </strong>

                                <button
                                        on:click={() =>
                                        increaseQuantity(item.product.id)}
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        <div class="item-total">

                            <strong>
                                ₹{(
                                Number(item.product.price) *
                                item.quantity
                            ).toFixed(2)}
                            </strong>

                            <button
                                    class="remove"
                                    on:click={() =>
                                    removeFromCart(item.product.id)}
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                {/each}

            </div>


            <!-- ORDER SUMMARY -->
            <aside class="summary">

                <h2>Order Summary</h2>

                <div class="summary-row">
                    <span>Subtotal</span>

                    <strong>
                        ₹{$cartSubtotal.toFixed(2)}
                    </strong>
                </div>

                <div class="summary-row">
                    <span>Delivery</span>

                    <strong>Calculated at checkout</strong>
                </div>

                <hr />

                <div class="total-row">
                    <span>Total</span>

                    <strong>
                        ₹{$cartSubtotal.toFixed(2)}
                    </strong>
                </div>


                <a class="checkout" href="/checkout">
                    Proceed to Checkout
                </a>
            </aside>

        </div>

    {/if}

</section>


<style>
    .cart-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 70px 30px;
    }

    .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: end;
        margin-bottom: 40px;
    }

    label {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #287a3c;
    }

    h1 {
        margin: 8px 0 0;
        font-size: 42px;
        color: #123d28;
    }

    .continue-shopping {
        color: #287a3c;
        text-decoration: none;
        font-weight: 700;
    }

    .cart-layout {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 30px;
        align-items: start;
    }

    .cart-items {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .cart-item {
        display: grid;
        grid-template-columns: 90px 1fr auto;
        gap: 20px;
        align-items: center;
        padding: 20px;
        background: white;
        border: 1px solid #e2e8de;
        border-radius: 16px;
    }

    .product-icon {
        width: 80px;
        height: 80px;
        border-radius: 14px;
        background: #edf6dc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 38px;
    }

    .product-info h3 {
        margin: 0 0 6px;
        color: #123d28;
        font-size: 20px;
    }

    .product-info p {
        margin: 0 0 14px;
        color: #6d756e;
    }

    .quantity-control {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .quantity-control button {
        width: 32px;
        height: 32px;
        border: 1px solid #d5dfd0;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 20px;
    }

    .quantity-control button:hover {
        background: #edf6dc;
    }

    .item-total {
        text-align: right;
    }

    .item-total strong {
        display: block;
        font-size: 20px;
        color: #123d28;
        margin-bottom: 12px;
    }

    .remove {
        border: none;
        background: none;
        color: #c44747;
        cursor: pointer;
        font-weight: 600;
    }

    .summary {
        background: #f4f8ed;
        border-radius: 18px;
        padding: 28px;
        position: sticky;
        top: 100px;
    }

    .summary h2 {
        margin-top: 0;
        color: #123d28;
    }

    .summary-row,
    .total-row {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin: 20px 0;
    }

    .summary-row span,
    .summary-row strong {
        color: #68716a;
        font-size: 14px;
    }

    .total-row {
        font-size: 20px;
        color: #123d28;
    }

    .summary hr {
        border: none;
        border-top: 1px solid #dce5d7;
    }

    .checkout {
        width: 100%;
        margin-top: 15px;
        padding: 15px;
        border: none;
        border-radius: 10px;
        background: #2f7d3c;
        color: white;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        text-align: center;
        display: block;
    }

    .checkout:hover {
        background: #256631;
    }

    .empty-cart {
        text-align: center;
        padding: 90px 20px;
        border: 1px dashed #ccd8c7;
        border-radius: 20px;
    }

    .empty-icon {
        font-size: 55px;
        margin-bottom: 15px;
    }

    .empty-cart h2 {
        color: #123d28;
    }

    .empty-cart p {
        color: #6d756e;
        margin-bottom: 25px;
    }

    .empty-cart a {
        display: inline-block;
        padding: 12px 25px;
        background: #2f7d3c;
        color: white;
        text-decoration: none;
        border-radius: 9px;
        font-weight: 700;
    }

    @media (max-width: 800px) {

        .cart-page {
            padding: 40px 20px;
        }

        .cart-header {
            align-items: start;
            flex-direction: column;
            gap: 15px;
        }

        h1 {
            font-size: 34px;
        }

        .cart-layout {
            grid-template-columns: 1fr;
        }

        .cart-item {
            grid-template-columns: 70px 1fr;
        }

        .product-icon {
            width: 65px;
            height: 65px;
        }

        .item-total {
            grid-column: 2;
            text-align: left;
        }

        .summary {
            position: static;
        }
    }
</style>