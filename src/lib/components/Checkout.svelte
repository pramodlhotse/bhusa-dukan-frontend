
<script>
    import { onMount } from 'svelte';
    import {
        cart,
        cartSubtotal,
        clearCart
    } from '../stores/cartStore.js';
    import { getCustomerAddresses } from '../api/addressApi.js';
    import { createOrder } from '../api/orderApi.js';
    import { createCustomerAddress } from '../api/addressApi.js';
    function getLoggedInCustomerId() {
        const storedUserId = localStorage.getItem('userId');
        const customerId = Number(storedUserId);

        if (
            !storedUserId ||
            !Number.isSafeInteger(customerId) ||
            customerId <= 0
        ) {
            return null;
        }

        return customerId;
    }

    let addresses = [];
    let selectedAddressId = null;
    let loadingAddresses = true;
    let paymentMethod = 'CASH';
    let customerNotes = '';
    let submitting = false;
    let orderError = '';
    let orderResult = null;
    let showAddressForm = false;
    let addressSaving = false;
    let loadError = '';
    let addressError = '';
    let addressSuccess = '';
    let canManageAddresses = false;

    let addressForm = {
        addressLine1: '',
        addressLine2: '',
        village: '',
        city: '',
        district: '',
        state: 'Bihar',
        pincode: '',
        landmark: '',
        defaultAddress: false
    };

    function resetAddressForm() {
        addressForm = {
            addressLine1: '',
            addressLine2: '',
            village: '',
            city: '',
            district: '',
            state: 'Bihar',
            pincode: '',
            landmark: '',
            defaultAddress: false
        };
    }

    async function saveNewAddress() {
        addressError = '';
        addressSuccess = '';

        const storedUserId = localStorage.getItem('userId');
        const customerId = getLoggedInCustomerId();

        if (customerId === null) {
            addressError = 'Please log in again to save your address.';
            return;
        }

        if (!storedUserId || !Number.isSafeInteger(customerId) || customerId <= 0) {
            addressError = 'Please log in again to save your address.';
            return;
        }

        addressSaving = true;

        try {
            const savedAddress = await createCustomerAddress(
                customerId,
                addressForm
            );

            const updatedAddresses = await getCustomerAddresses(customerId);
            addresses = updatedAddresses;

            selectedAddressId = savedAddress.id;
            showAddressForm = false;
            addressSuccess = 'Address added successfully.';
            resetAddressForm();
        } catch (error) {
            addressError = error.message || 'Unable to save address.';
        } finally {
            addressSaving = false;
        }
    }

    onMount(async () => {
        const customerId = getLoggedInCustomerId();

        if (customerId === null) {
            loadError = 'Please log in to view your delivery addresses.';
            canManageAddresses = false;
            loadingAddresses = false;
            return;
        }

        canManageAddresses = true;

        try {
            addresses = await getCustomerAddresses(customerId);

            const defaultAddress = addresses.find(
                (address) => address.defaultAddress
            );

            selectedAddressId = defaultAddress?.id ?? null;
            showAddressForm = addresses.length === 0;
        } catch (error) {
            console.error(error);
            loadError =
                error.message || 'Unable to load addresses. Please try again.';
            showAddressForm = true;
        } finally {
            loadingAddresses = false;
        }
    });
    async function placeOrder() {
        orderError = '';

        if ($cart.length === 0) {
            orderError = 'Your cart is empty.';
            return;
        }

        if (selectedAddressId === null) {
            orderError = 'Please select a delivery address.';
            return;
        }

        submitting = true;

        try {
            const request = {
                deliveryAddressId: Number(selectedAddressId),
                paymentMethod,
                items: $cart.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity
                })),
                customerNotes: customerNotes.trim()
            };

            orderResult = await createOrder(request);
            clearCart();
        } catch (error) {
            console.error(error);
            orderError = error.message || 'Unable to place your order.';
        } finally {
            submitting = false;
        }
    }
</script>

<svelte:head>
    <title>
        {orderResult ? 'Order Confirmed | Bhusa Dukan' : 'Checkout | Bhusa Dukan'}
    </title>
</svelte:head>

{#if orderResult}

    <!-- ORDER SUCCESS SCREEN -->
    <section class="checkout-page">
        <div class="checkout-card order-success">
            <div class="success-icon">✓</div>

            <h1>Order Placed Successfully!</h1>
            <p>Your bhusa order has been created.</p>

            <div class="success-details">
                <p>Order number</p>
                <strong>
                    {orderResult.orderNumber ?? orderResult.id}
                </strong>

                <p>Payment method</p>
                <strong>
                    {paymentMethod === 'CASH'
                        ? 'Cash on Delivery'
                        : paymentMethod}
                </strong>

                <p>Order total</p>
                <strong>
                    ₹{Number(orderResult.finalAmount ?? $cartSubtotal).toFixed(2)}
                </strong>
            </div>

            <a href="/" class="home-button">Continue Shopping</a>
        </div>
    </section>

{:else}

    <!-- CHECKOUT FORM -->
    <section class="checkout-page">

        <div class="checkout-header">
            <label>CHECKOUT</label>
            <h1>Complete Your Order</h1>
            <p>Confirm your delivery details and payment method.</p>
        </div>

        <div class="checkout-layout">

            <div class="checkout-main">

                <!-- DELIVERY ADDRESS -->
                <div class="checkout-card">
                    <h2>Delivery Address</h2>
                    <p class="helper">
                        Select where you want your bhusa delivered.
                    </p>

                    {#if loadingAddresses}
                        <p>Loading saved addresses...</p>

                    {:else}
                        {#if loadError}
                            <p class="error-message">{loadError}</p>
                        {/if}

                        {#if addresses.length === 0}
                            <div class="address-placeholder">
                                <div class="address-icon">📍</div>
                                <div>
                                    <strong>No saved addresses found</strong>
                                    <span>
                                        Please add a delivery address before ordering.
                                    </span>
                                </div>
                            </div>
                        {:else}
                            <div class="address-list">
                                {#each addresses as address (address.id)}
                                    <label
                                            class="address-option"
                                            class:selected={selectedAddressId === address.id}
                                    >
                                        <input
                                                type="radio"
                                                name="deliveryAddress"
                                                value={address.id}
                                                bind:group={selectedAddressId}
                                        />

                                        <span class="address-details">
                                            <strong>
                                                {address.addressLine1}
                                                {#if address.addressLine2}
                                                    , {address.addressLine2}
                                                {/if}
                                            </strong>

                                            <span>
                                                {#if address.village}
                                                    {address.village},
                                                {/if}
                                                {address.city}, {address.district},
                                                {address.state} - {address.pincode}
                                            </span>

                                            {#if address.landmark}
                                                <span>
                                                    Landmark: {address.landmark}
                                                </span>
                                            {/if}

                                            {#if address.defaultAddress}
                                                <small class="default-badge">
                                                    Default address
                                                </small>
                                            {/if}
                                        </span>
                                    </label>
                                {/each}
                            </div>
                        {/if}

                        {#if canManageAddresses}
                            <div class="add-address-actions">
                                <button
                                        type="button"
                                        class="add-address-button"
                                        onclick={() => {
                                            showAddressForm = !showAddressForm;
                                            addressError = '';
                                            addressSuccess = '';
                                        }}
                                >
                                    {showAddressForm ? 'Cancel' : '+ Add New Address'}
                                </button>
                            </div>

                            {#if addressSuccess}
                                <p class="address-success" role="status">{addressSuccess}</p>
                            {/if}

                            {#if showAddressForm}
                                <form
                                        class="address-form"
                                        onsubmit={(event) => {
                                            event.preventDefault();
                                            saveNewAddress();
                                        }}
                                >
                                    <label for="addressLine1">Address line 1 *</label>
                                    <input id="addressLine1" bind:value={addressForm.addressLine1}
                                           maxlength="255" required />

                                    <label for="addressLine2">Address line 2</label>
                                    <input id="addressLine2" bind:value={addressForm.addressLine2}
                                           maxlength="255" />

                                    <label for="village">Village</label>
                                    <input id="village" bind:value={addressForm.village}
                                           maxlength="100" />

                                    <label for="city">City *</label>
                                    <input id="city" bind:value={addressForm.city}
                                           maxlength="100" required />

                                    <label for="district">District *</label>
                                    <input id="district" bind:value={addressForm.district}
                                           maxlength="100" required />

                                    <label for="state">State</label>
                                    <input id="state" bind:value={addressForm.state}
                                           maxlength="100" />
                                    <label for="pincode">PIN code *</label>
                                    <input
                                            id="pincode"
                                            type="text"
                                            bind:value={addressForm.pincode}
                                            inputmode="numeric"
                                            maxlength="6"
                                            minlength="6"
                                            required
                                    />

                                    <label for="landmark">Landmark</label>
                                    <input id="landmark" bind:value={addressForm.landmark}
                                           maxlength="255" />

                                    <label class="default-address-option">
                                        <input type="checkbox" bind:checked={addressForm.defaultAddress} />
                                        Set as default address
                                    </label>

                                    {#if addressError}
                                        <p class="address-error" role="alert">{addressError}</p>
                                    {/if}

                                    <button type="submit" disabled={addressSaving}>
                                        {addressSaving ? 'Saving...' : 'Save Address'}
                                    </button>
                                </form>
                            {/if}
                        {/if}
                    {/if}
                </div>

                <!-- PAYMENT METHOD -->
                <div class="checkout-card">
                    <h2>Payment Method</h2>
                    <p class="helper">Choose how you would like to pay.</p>

                    <label class:selected={paymentMethod === 'CASH'}>
                        <input
                                type="radio"
                                name="paymentMethod"
                                bind:group={paymentMethod}
                                value="CASH"
                        />
                        <span>
                            <strong>Cash on Delivery</strong>
                            <small>Pay when your order is delivered.</small>
                        </span>
                    </label>

                    <label class:selected={paymentMethod === 'UPI'}>
                        <input
                                type="radio"
                                name="paymentMethod"
                                bind:group={paymentMethod}
                                value="UPI"
                        />
                        <span>
                            <strong>UPI</strong>
                            <small>Pay using UPI.</small>
                        </span>
                    </label>

                    <label class:selected={paymentMethod === 'ONLINE'}>
                        <input
                                type="radio"
                                name="paymentMethod"
                                bind:group={paymentMethod}
                                value="ONLINE"
                        />
                        <span>
                            <strong>Online Payment</strong>
                            <small>Pay securely online.</small>
                        </span>
                    </label>

                    <p class="helper payment-note">
                        Payment processing will be connected separately.
                        Selecting a method here does not charge you.
                    </p>
                </div>

                <!-- ORDER ITEMS -->
                <div class="checkout-card">
                    <h2>Order Items</h2>

                    {#each $cart as item (item.product.id)}
                        <div class="order-item">
                            <div class="item-icon">
                                {item.product.name.toLowerCase().includes('wheat')
                                    ? '🌾'
                                    : '🌿'}
                            </div>

                            <div class="item-info">
                                <strong>{item.product.name}</strong>
                                <span>
                                    {item.quantity} KG ×
                                    ₹{Number(item.product.price).toFixed(2)}
                                    / KG
                                </span>
                            </div>

                            <strong>
                                ₹{(
                                Number(item.product.price) * item.quantity
                            ).toFixed(2)}
                            </strong>
                        </div>
                    {/each}

                    <label class="notes-label" for="customerNotes">
                        Order notes (optional)
                    </label>
                    <textarea
                            id="customerNotes"
                            bind:value={customerNotes}
                            rows="3"
                            placeholder="Delivery instructions or other notes"
                    ></textarea>
                </div>

            </div>

            <!-- ORDER SUMMARY -->
            <aside class="summary">
                <h2>Order Summary</h2>

                <div class="summary-row">
                    <span>Subtotal</span>
                    <strong>₹{$cartSubtotal.toFixed(2)}</strong>
                </div>

                <div class="summary-row">
                    <span>Delivery</span>
                    <strong>Calculated at checkout</strong>
                </div>

                <hr />

                <div class="total-row">
                    <span>Total</span>
                    <strong>₹{$cartSubtotal.toFixed(2)}</strong>
                </div>

                {#if orderError}
                    <p class="error-message">{orderError}</p>
                {/if}

                <button
                        class="place-order"
                        onclick={placeOrder}
                        disabled={
                        submitting ||
                        loadingAddresses ||
                        $cart.length === 0 ||
                        addresses.length === 0
                    }
                >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                </button>

                <p class="secure-note">
                    Your order will be submitted to Bhusa Dukan.
                </p>
            </aside>

        </div>
    </section>

{/if}

<style>
    .checkout-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 65px 30px;
    }

    .checkout-header {
        margin-bottom: 35px;
    }

    .checkout-header label {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #287a3c;
    }

    .checkout-header h1,
    .order-success h1 {
        margin: 8px 0;
        font-size: 42px;
        color: #123d28;
    }

    .checkout-header p,
    .order-success > p {
        color: #68716a;
        margin: 0;
    }

    .checkout-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 30px;
        align-items: start;
    }

    .checkout-main {
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-width: 0;
    }

    .checkout-card {
        padding: 28px;
        border: 1px solid #e0e7dc;
        border-radius: 16px;
        background: white;
    }

    .checkout-card h2,
    .summary h2 {
        margin: 0 0 6px;
        color: #123d28;
        font-size: 22px;
    }

    .helper {
        margin: 0 0 22px;
        color: #737b74;
        font-size: 14px;
    }

    .address-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .address-option {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 18px;
        border: 1px solid #e0e7dc;
        border-radius: 12px;
        cursor: pointer;
    }

    .address-option.selected,
    .checkout-card > label.selected {
        border-color: #2f7d3c;
        background: #f2f8ed;
    }

    .address-option input,
    .checkout-card > label input {
        margin-top: 4px;
        accent-color: #2f7d3c;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
    }

    .address-details {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .address-details span {
        color: #68716a;
        font-size: 14px;
        overflow-wrap: anywhere;
    }

    .default-badge {
        color: #287a3c;
        font-weight: 700;
    }

    .checkout-card > label {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        margin-top: 10px;
        border: 1px solid #e0e7dc;
        border-radius: 10px;
        cursor: pointer;
    }

    .checkout-card label span {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .checkout-card label small {
        color: #747b75;
    }

    .payment-note {
        margin: 18px 0 0;
    }

    .order-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #edf0eb;
    }

    .order-item:last-child {
        border-bottom: none;
    }

    .item-icon {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        background: #edf6dc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 25px;
        flex-shrink: 0;
    }

    .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 0;
    }

    .item-info span {
        color: #747b75;
        font-size: 13px;
    }

    .notes-label {
        display: block;
        margin-top: 20px;
        font-weight: 600;
        color: #123d28;
    }

    textarea {
        width: 100%;
        box-sizing: border-box;
        margin-top: 8px;
        padding: 12px;
        border: 1px solid #dce5d7;
        border-radius: 8px;
        font: inherit;
        resize: vertical;
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
    }

    .summary-row,
    .total-row {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin: 20px 0;
    }

    .summary-row {
        color: #68716a;
        font-size: 14px;
    }

    .summary-row strong {
        text-align: right;
    }

    .summary hr {
        border: none;
        border-top: 1px solid #dce5d7;
    }

    .total-row {
        font-size: 20px;
        color: #123d28;
    }

    .place-order,
    .home-button {
        width: 100%;
        box-sizing: border-box;
        margin-top: 15px;
        padding: 15px;
        border: none;
        border-radius: 10px;
        background: #2f7d3c;
        color: white;
        font-size: 16px;
        font-weight: 700;
        text-align: center;
        text-decoration: none;
        display: block;
    }

    .place-order {
        cursor: pointer;
    }

    .place-order:hover,
    .home-button:hover {
        background: #256631;
    }

    .place-order:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .secure-note {
        color: #68716a;
        font-size: 12px;
        text-align: center;
    }

    .error-message {
        color: #c44747;
        font-size: 14px;
    }

    .order-success {
        max-width: 650px;
        margin: 30px auto;
        text-align: center;
        padding: 45px 28px;
    }

    .success-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 20px;
        border-radius: 50%;
        background: #e5f5df;
        color: #287a3c;
        font-size: 38px;
        display: grid;
        place-items: center;
    }

    .success-details {
        margin: 25px 0;
        padding: 20px;
        border-radius: 12px;
        background: #f4f8ed;
    }

    .success-details p {
        margin: 14px 0 5px;
        color: #68716a;
    }

    .success-details strong {
        color: #123d28;
        overflow-wrap: anywhere;
    }

    @media (max-width: 800px) {
        .checkout-page {
            padding: 40px 20px;
        }

        .checkout-header h1,
        .order-success h1 {
            font-size: 34px;
        }

        .checkout-layout {
            grid-template-columns: 1fr;
        }

        .summary {
            position: static;
        }

        .checkout-card {
            padding: 20px;
        }
    }
</style>
