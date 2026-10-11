
<script>
    import { onMount } from 'svelte';
    import {
        getOrder,
        getOrderStatusHistory
    } from '../api/orderApi.js';
    import { getDeliveryByOrderId } from '../api/deliveryApi.js';
    import { getCustomerAddresses } from '../api/addressApi.js';
    let order = null;
    let history = [];
    let loading = true;
    let error = '';
    let refreshing = false;
    let lastUpdated = null;
    let delivery = null;
    let deliveryUnavailable = false;
    let deliveryAddress = null;

    async function refreshTracking(showError = true) {
        const orderId = getOrderId();
        if (!orderId || refreshing) return;

        refreshing = true;

        try {
            const [orderData, historyData] = await Promise.all([
                await  getOrder(orderId),
                getOrderStatusHistory(orderId)
            ]);

            order = orderData;
            history = historyData;
            error = '';

            try {
                await loadDeliveryAddress(order);
            } catch (addressError) {
                console.error('Unable to load delivery address:', addressError);
                deliveryAddress = null;
            }

            try {
                delivery = await getDeliveryByOrderId(orderId);
                deliveryUnavailable = false;
            } catch (e) {
                // An order may not have a delivery assigned yet.
                delivery = null;
                deliveryUnavailable = true;
            }

            lastUpdated = new Date();
        } catch (e) {
            console.error('Unable to refresh order tracking:', e);

            if (showError && !order) {
                error = e.message || 'Unable to load order tracking.';
            }
        } finally {
            refreshing = false;
            loading = false;
        }
    }

    const steps = [
        { status: 'PLACED', title: 'Order Placed', icon: '🛒' },
        { status: 'CONFIRMED', title: 'Order Confirmed', icon: '✓' },
        { status: 'WEIGHING', title: 'Weight Verification', icon: '⚖️' },
        { status: 'PACKED', title: 'Packed', icon: '📦' },
        { status: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', icon: '🚚' },
        { status: 'DELIVERED', title: 'Delivered', icon: '🏠' }
    ];
    async function loadDeliveryAddress(order) {
        deliveryAddress = null;

        if (!order?.deliveryAddressId) return;

        const customerId = localStorage.getItem('userId');
        if (!customerId) return;

        const addresses = await getCustomerAddresses(Number(customerId));
        deliveryAddress = addresses.find(
            address => Number(address.id) === Number(order.deliveryAddressId)
        ) ?? null;
    }

    function formatDeliveryAddress(address) {
        if (!address) return '';

        return [
            address.addressLine1,
            address.addressLine2,
            address.village,
            address.city,
            address.district,
            address.state,
            address.pincode ? `PIN ${address.pincode}` : null
        ].filter(Boolean).join(', ');
    }

    function getWeightDifference(item) {
        if (item?.actualQuantity == null || item?.orderedQuantity == null) {
            return null;
        }

        return Number(
            (Number(item.actualQuantity) - Number(item.orderedQuantity)).toFixed(3)
        );
    }

    function getWeightVerification(item) {
        if (item?.actualQuantity == null) {
            return {
                label: 'Awaiting weight verification',
                kind: 'pending'
            };
        }

        const difference = getWeightDifference(item);

        if (difference === 0) {
            return {
                label: 'Weight verified',
                kind: 'verified'
            };
        }

        return {
            label: difference > 0
                ? `Over by ${difference} KG`
                : `Short by ${Math.abs(difference)} KG`,
            kind: 'difference'
        };
    }

    function getOrderId() {
        return new URLSearchParams(window.location.search).get('orderId');
    }

    function formatDate(value) {
        if (!value) return '—';

        return new Date(value).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    function stepIndex(status) {
        return steps.findIndex((step) => step.status === status);
    }

    function currentStepIndex() {
        return stepIndex(order?.status);
    }

    function stepIsComplete(index) {
        const current = currentStepIndex();

        if (order?.status === 'DELIVERED') return true;
        if (order?.status === 'CANCELLED') return false;

        return current >= 0 && index <= current;
    }

    onMount(() => {
        const orderId = getOrderId();

        if (!orderId || !/^\d+$/.test(orderId)) {
            error = 'A valid order ID is required.';
            loading = false;
            return;
        }

        refreshTracking();

        const timer = setInterval(() => {
            if (
                order?.status !== 'DELIVERED' &&
                order?.status !== 'CANCELLED'
            ) {
                refreshTracking(false);
            }
        }, 20000);

        return () => clearInterval(timer);
    });
</script>

<svelte:head>
    <title>Track Order | Bhusa Dukan</title>
</svelte:head>

<section class="tracking-page">
    <div class="page-heading">
        <label>ORDER TRACKING</label>
        <h1>Track Your Order</h1>
        <p>Follow your bhusa order from placement to delivery.</p>
    </div>

    {#if loading}
        <div class="state">Loading order tracking...</div>

    {:else if error}
        <div class="state error">
            <p>{error}</p>
            <a href="/my-orders">Back to My Orders</a>
        </div>

    {:else if order}
        <article class="order-summary">
            <div>
                <span class="muted">Order number</span>
                <h2>{order.orderNumber}</h2>
                <span class="muted">
            Placed {formatDate(order.orderedAt)}
        </span>
            </div>

            <div class="summary-status">
                <span class="muted">Order Status</span>
                <strong class:cancelled={order.status === 'CANCELLED'}>
                    {order.status?.replaceAll('_', ' ') ?? 'Unknown'}
                </strong>
            </div>

            <div class="summary-total">
                <span class="muted">Order Total</span>
                <strong>
                    {Number(order.finalAmount ?? 0).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 2
                    })}
                </strong>
            </div>

            {#if delivery && order.status !== 'CANCELLED'}
                <section class="delivery-details">
                    <h2>Delivery Details</h2>

                    <div class="delivery-address-block">
                        <span>Delivery Address</span>
                        {#if deliveryAddress}
                            <p>{formatDeliveryAddress(deliveryAddress)}</p>
                            {#if deliveryAddress.landmark}
                                <p class="address-landmark">Landmark: {deliveryAddress.landmark}</p>
                            {/if}
                        {:else}
                            <p class="muted">
                                {order.deliveryAddressId
                                    ? 'Delivery address could not be loaded.'
                                    : 'No delivery address is linked to this order.'}
                            </p>
                        {/if}
                    </div>

                    <div class="delivery-grid">
                        <div>
                            <span>Delivery Status</span>
                            <strong>{delivery.status?.replaceAll('_', ' ') ?? '—'}</strong>
                        </div>

                        <div>
                            <span>Delivery Person</span>
                            <strong>{delivery.deliveryPersonName ?? 'Not assigned yet'}</strong>
                        </div>

                        <div>
                            <span>Vehicle Number</span>
                            <strong>{delivery.vehicleNumber ?? 'Not assigned yet'}</strong>
                        </div>

                        <div>
                            <span>Assigned At</span>
                            <strong>{formatDate(delivery.assignedAt)}</strong>
                        </div>

                        <div>
                            <span>Dispatched At</span>
                            <strong>{formatDate(delivery.dispatchedAt)}</strong>
                        </div>

                        <div>
                            <span>Delivered At</span>
                            <strong>{formatDate(delivery.deliveredAt)}</strong>
                        </div>

                        <div>
                            <span>Customer Confirmation</span>
                            <strong>
                                {delivery.customerConfirmed ? 'Confirmed' : 'Awaiting confirmation'}
                            </strong>
                        </div>

                        {#if delivery.failureReason}
                            <div class="delivery-failure">
                                <span>Delivery Issue</span>
                                <strong>{delivery.failureReason}</strong>
                            </div>
                        {/if}

                        {#if delivery.remarks}
                            <div>
                                <span>Delivery Remarks</span>
                                <strong>{delivery.remarks}</strong>
                            </div>
                        {/if}
                    </div>
                </section>
            {:else if deliveryUnavailable && order.status !== 'CANCELLED'}
                <section class="delivery-details">
                    <h2>Delivery Details</h2>
                    <p>Delivery has not been assigned yet.</p>

                    <div class="delivery-address-block">
                        <span>Delivery Address</span>
                        {#if deliveryAddress}
                            <p>{formatDeliveryAddress(deliveryAddress)}</p>
                            {#if deliveryAddress.landmark}
                                <p class="address-landmark">Landmark: {deliveryAddress.landmark}</p>
                            {/if}
                        {:else}
                            <p class="muted">
                                {order.deliveryAddressId
                                    ? 'Delivery address could not be loaded.'
                                    : 'No delivery address is linked to this order.'}
                            </p>
                        {/if}
                    </div>
                </section>
            {/if}

        </article>




        <section class="tracking-card order-items-section">
            <h2>Order Items</h2>

            {#if order.items?.length}
                <div class="tracking-items">
                    {#each order.items as item (item.id)}
                        <article class="tracking-item">
                            <div class="tracking-item-details">
                                <strong>{item.productName}</strong>

                                <span>
                            Ordered: {item.orderedQuantity ?? 0} KG
                        </span>

                                {#if item.actualQuantity != null}
                                    <span>
                                        Actual weight: {item.actualQuantity} KG
                                    </span>
                                {:else}
                                    <span>
                                        Actual weight: Not recorded yet
                                    </span>
                                {/if}

                                <span
                                        class="weight-verification"
                                        class:weight-verified={item.actualQuantity != null && Number(item.actualQuantity) === Number(item.orderedQuantity)}
                                        class:weight-pending={item.actualQuantity == null}
                                        class:weight-difference={item.actualQuantity != null && Number(item.actualQuantity) !== Number(item.orderedQuantity)}
                                >
                                    {#if item.actualQuantity == null}
                                        Awaiting weight verification
                                    {:else if Number(item.actualQuantity) === Number(item.orderedQuantity)}
                                        Weight verified
                                    {:else if Number(item.actualQuantity) > Number(item.orderedQuantity)}
                                        Over by {Number((Number(item.actualQuantity) - Number(item.orderedQuantity)).toFixed(3))} KG
                                    {:else}
                                        Short by {Number((Number(item.orderedQuantity) - Number(item.actualQuantity)).toFixed(3))} KG
                                    {/if}
                                </span>

                                <span>
                            Unit price: {Number(item.unitPrice ?? 0).toLocaleString('en-IN', {
                                    style: 'currency',
                                    currency: 'INR'
                                })}/KG
                        </span>
                            </div>

                            <strong class="tracking-item-amount">
                                {Number(
                                    item.finalAmount ?? item.estimatedAmount ?? 0
                                ).toLocaleString('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    minimumFractionDigits: 2
                                })}
                            </strong>
                        </article>
                    {/each}
                </div>
            {:else}
                <p class="muted">No order items are available.</p>
            {/if}
        </section>




        {#if order.status === 'CANCELLED'}
            <div class="notice cancelled-notice">
                <strong>Order Cancelled</strong>
                <p>This order will not proceed to delivery.</p>
            </div>
        {:else}
            <section class="tracking-card">
                <div class="tracking-heading">
                    <h2>Delivery Progress</h2>

                    <button
                            class="refresh-button"
                            onclick={() => refreshTracking()}
                            disabled={refreshing}
                    >
                        {refreshing ? 'Refreshing...' : '↻ Refresh Status'}
                    </button>
                </div>

                {#if lastUpdated}
                    <p class="last-updated">
                        Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
                    </p>
                {/if}

                <div class="timeline">
                    {#each steps as step, index (step.status)}
                        <div class="timeline-step">
                            <div
                                    class="timeline-icon"
                                    class:complete={stepIsComplete(index)}
                                    class:current={order.status === step.status}
                            >
                                {stepIsComplete(index) ? '✓' : step.icon}
                            </div>

                            <div class="timeline-content">
                                <strong>{step.title}</strong>

                                {#if order.status === step.status}
                                    <span class="current-label">
                                        Current status
                                    </span>
                                {/if}

                                {#each history.filter((event) => event.newStatus === step.status) as event (event.id)}
                                    <small>{formatDate(event.createdAt)}</small>
                                    {#if event.remarks}
                                        <small>{event.remarks}</small>
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}

        <section class="history-card">
            <h2>Status History</h2>

            {#if history.length === 0}
                <p>No status history is available.</p>
            {:else}
                <div class="history-list">
                    {#each history as event (event.id)}
                        <div class="history-row">
                            <div class="history-dot"></div>

                            <div class="history-details">
                                <strong>
                                    {event.newStatus?.replaceAll('_', ' ')}
                                </strong>
                                <span>{formatDate(event.createdAt)}</span>

                                {#if event.remarks}
                                    <small>{event.remarks}</small>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </section>

        <a class="back-button" href="/my-orders">
            ← Back to My Orders
        </a>
    {/if}
</section>

<style>

    .delivery-details {
        margin-bottom: 22px;
        padding: 25px;
        border: 1px solid #e0e7dc;
        border-radius: 16px;
        background: white;
    }

    .delivery-details h2 {
        margin-top: 0;
        color: #123d28;
    }

    .delivery-address-block {
        margin: 0 0 22px;
        padding: 14px 16px;
        border-radius: 10px;
        background: #f7faf4;
    }

    .delivery-address-block > span {
        color: #68716a;
        font-size: 13px;
        font-weight: 700;
    }

    .delivery-address-block p {
        margin: 7px 0 0;
        color: #123d28;
        line-height: 1.5;
        overflow-wrap: anywhere;
    }

    .delivery-address-block .address-landmark {
        color: #68716a;
        font-size: 13px;
    }

    .delivery-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 22px;
    }

    .delivery-grid > div {
        display: flex;
        flex-direction: column;
        gap: 7px;
    }

    .delivery-grid span {
        color: #68716a;
        font-size: 13px;
    }

    .delivery-grid strong {
        color: #123d28;
        overflow-wrap: anywhere;
    }

    .delivery-failure strong {
        color: #b42318;
    }

    @media (max-width: 600px) {
        .delivery-grid {
            grid-template-columns: 1fr;
        }

        .delivery-details {
            padding: 20px;
        }
    }

    .weight-verification {
        display: inline-flex;
        align-self: flex-start;
        width: fit-content;
        padding: 5px 9px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
    }

    .weight-verified {
        background: #e4f5e3;
        color: #237537 !important;
    }

    .weight-pending {
        background: #fff2d7;
        color: #8a5a00 !important;
    }

    .weight-difference {
        background: #fde8e7;
        color: #b42318 !important;
    }

    .tracking-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .tracking-heading h2 {
        margin-bottom: 0;
    }

    .refresh-button {
        border: 1px solid #2f7d3c;
        border-radius: 8px;
        background: white;
        color: #287a3c;
        padding: 10px 14px;
        font-weight: 700;
        cursor: pointer;
    }

    .refresh-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .last-updated {
        margin: 12px 0 20px;
        color: #68716a;
        font-size: 12px;
    }
    .tracking-page {
        max-width: 1000px;
        margin: 0 auto;
        padding: 55px 28px 80px;
    }

    .page-heading {
        margin-bottom: 30px;
    }

    .page-heading label {
        color: #287a3c;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 2px;
    }

    .page-heading h1 {
        margin: 8px 0;
        color: #123d28;
        font-size: 42px;
    }

    .page-heading p,
    .muted {
        color: #68716a;
    }

    .muted {
        font-size: 13px;
    }

    .order-summary,
    .tracking-card,
    .history-card,
    .state {
        padding: 25px;
        border: 1px solid #e0e7dc;
        border-radius: 16px;
        background: white;
        margin-bottom: 22px;
    }

    .order-summary {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        gap: 25px;
    }

    .order-summary h2 {
        color: #123d28;
        overflow-wrap: anywhere;
    }

    .summary-status,
    .summary-total {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .summary-status strong {
        color: #287a3c;
    }

    .summary-status strong.cancelled {
        color: #b42318;
    }

    .summary-total strong {
        color: #123d28;
        font-size: 22px;
    }

    .tracking-card h2,
    .history-card h2 {
        margin-top: 0;
        color: #123d28;
    }

    .timeline {
        margin-top: 25px;
    }

    .timeline-step {
        display: flex;
        gap: 18px;
        min-height: 95px;
        position: relative;
    }

    .timeline-step:not(:last-child)::before {
        content: '';
        position: absolute;
        left: 21px;
        top: 44px;
        height: calc(100% - 42px);
        border-left: 2px solid #dce5d7;
    }

    .timeline-icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: #edf2e8;
        color: #65715f;
        font-size: 20px;
        flex-shrink: 0;
        z-index: 1;
    }

    .timeline-icon.complete {
        background: #e4f5e3;
        color: #237537;
    }

    .timeline-icon.current {
        border: 2px solid #2f7d3c;
    }

    .timeline-content {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-bottom: 20px;
    }

    .timeline-content strong {
        color: #68716a;
    }

    .timeline-icon.complete + .timeline-content strong {
        color: #123d28;
    }

    .timeline-content small,
    .history-details span,
    .history-details small {
        color: #68716a;
        font-size: 13px;
    }

    .current-label {
        color: #287a3c;
        font-size: 12px;
        font-weight: 800;
    }

    .history-list {
        margin-top: 20px;
    }

    .history-row {
        display: flex;
        gap: 14px;
        padding: 12px 0;
        border-bottom: 1px solid #edf0eb;
    }

    .history-row:last-child {
        border-bottom: none;
    }

    .history-dot {
        width: 10px;
        height: 10px;
        margin-top: 5px;
        border-radius: 50%;
        background: #2f7d3c;
        flex-shrink: 0;
    }

    .history-details {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .back-button {
        display: inline-block;
        margin-top: 5px;
        color: #287a3c;
        text-decoration: none;
        font-weight: 700;
    }

    .state {
        text-align: center;
    }

    .error {
        color: #b42318;
    }

    .cancelled-notice {
        padding: 20px;
        margin-bottom: 22px;
        border-radius: 12px;
        background: #fde8e7;
        color: #b42318;
    }

    .cancelled-notice p {
        margin-bottom: 0;
    }

    @media (max-width: 700px) {
        .tracking-page {
            padding: 35px 16px 55px;
        }

        .page-heading h1 {
            font-size: 34px;
        }

        .order-summary {
            grid-template-columns: 1fr;
            gap: 18px;
        }

        .order-summary,
        .tracking-card,
        .history-card {
            padding: 20px;
        }
    }

    .order-items-section h2 {
        margin-top: 0;
        color: #123d28;
    }

    .tracking-items {
        border-top: 1px solid #edf0eb;
    }

    .tracking-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        padding: 16px 0;
        border-bottom: 1px solid #edf0eb;
    }

    .tracking-item-details {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .tracking-item-details strong {
        color: #123d28;
    }

    .tracking-item-details span {
        color: #68716a;
        font-size: 13px;
    }

    .tracking-item-amount {
        color: #123d28;
        white-space: nowrap;
    }

    @media (max-width: 600px) {
        .tracking-item {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
        }
    }


</style>
