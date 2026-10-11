
<script>
    import { onMount } from 'svelte';
    import { getCustomerOrders } from '../api/orderApi.js';

    function getLoggedInCustomerId() {
        const userId = localStorage.getItem('userId');

        return userId ? Number(userId) : null;
    }

    let orders = [];
    let loading = true;
    let error = '';

    function formatDate(value) {
        if (!value) return '—';

        return new Date(value).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    function formatAmount(value) {
        return Number(value ?? 0).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        });
    }

    function statusClass(status) {
        return (status ?? 'unknown').toLowerCase().replaceAll('_', '-');
    }

    onMount(async () => {
        try {
            const customerId = getLoggedInCustomerId();

            if (!customerId || !Number.isSafeInteger(customerId) || customerId <= 0) {
                throw new Error('Your session is missing. Please log in again.');
            }

            orders = await getCustomerOrders(customerId);
        } catch (e) {
            console.error(e);
            error = e.message || 'Unable to load your orders.';
        } finally {
            loading = false;
        }
    });
</script>

<svelte:head>
    <title>My Orders | Bhusa Dukan</title>
</svelte:head>

<section class="orders-page">
    <div class="page-heading">
        <div>
            <label>YOUR ORDERS</label>
            <h1>My Orders</h1>
            <p>View your purchases and track your bhusa deliveries.</p>
        </div>

        <a class="continue-link" href="/">← Continue Shopping</a>
    </div>

    {#if loading}
        <div class="state">Loading your orders...</div>

    {:else if error}
        <div class="state error">
            <p>{error}</p>
            <button onclick={() => window.location.reload()}>
                Try Again
            </button>
        </div>

    {:else if orders.length === 0}
        <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Your orders will appear here after you place an order.</p>
            <a class="primary-button" href="/">Shop Bhusa</a>
        </div>

    {:else}
        <div class="orders-list">
            {#each orders as order (order.id)}
                <article class="order-card">
                    <div class="order-top">
                        <div>
                            <span class="muted">Order number</span>
                            <h2>{order.orderNumber}</h2>
                            <span class="muted">
                                Placed {formatDate(order.orderedAt)}
                            </span>
                        </div>

                        <span class="status-badge {statusClass(order.status)}">
                            {order.status?.replaceAll('_', ' ')}
                        </span>
                    </div>

                    <div class="order-items">
                        {#each (order.items ?? []) as item (item.id)}
                            <div class="order-item">
                                <span class="product-icon">
                                    {item.productName?.toLowerCase().includes('wheat')
                                        ? '🌾'
                                        : '🌿'}
                                </span>

                                <div class="item-details">
                                    <strong>{item.productName}</strong>
                                    <span>
                                        {item.orderedQuantity} KG ×
                                        {formatAmount(item.unitPrice)}
                                    </span>
                                </div>

                                <strong>
                                    {formatAmount(item.finalAmount ?? item.estimatedAmount)}
                                </strong>
                            </div>
                        {/each}
                    </div>

                    <div class="order-bottom">
                        <div class="amount">
                            <span class="muted">Order total</span>
                            <strong>{formatAmount(order.finalAmount)}</strong>
                            <span class="payment">
                                Payment: {order.paymentMethod ?? 'Not recorded'}
                                · {order.paymentStatus ?? 'Pending'}
                            </span>
                        </div>

                        <a
                                class="track-button"
                                href="/track-order?orderId={order.id}"
                        >
                            Track Order →
                        </a>
                    </div>
                </article>
            {/each}
        </div>
    {/if}
</section>

<style>
    .orders-page {
        max-width: 1150px;
        margin: 0 auto;
        padding: 55px 28px 80px;
    }

    .page-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        margin-bottom: 32px;
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

    .continue-link {
        color: #287a3c;
        text-decoration: none;
        font-weight: 700;
    }

    .orders-list {
        display: flex;
        flex-direction: column;
        gap: 22px;
    }

    .order-card {
        padding: 25px;
        border: 1px solid #e0e7dc;
        border-radius: 16px;
        background: white;
    }

    .order-top,
    .order-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
    }

    .order-top h2 {
        margin: 6px 0;
        color: #123d28;
        font-size: 20px;
        overflow-wrap: anywhere;
    }

    .muted {
        font-size: 13px;
    }

    .status-badge {
        padding: 8px 12px;
        border-radius: 30px;
        background: #edf2e8;
        color: #475b43;
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
    }

    .status-badge.placed,
    .status-badge.confirmed {
        background: #fff2d7;
        color: #8a5a00;
    }

    .status-badge.delivered {
        background: #e4f5e3;
        color: #237537;
    }

    .status-badge.cancelled,
    .status-badge.failed {
        background: #fde8e7;
        color: #b42318;
    }

    .order-items {
        margin: 20px 0;
        border-top: 1px solid #edf0eb;
        border-bottom: 1px solid #edf0eb;
    }

    .order-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 15px 0;
    }

    .product-icon {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        background: #edf6dc;
        font-size: 24px;
        flex-shrink: 0;
    }

    .item-details {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 5px;
        min-width: 0;
    }

    .item-details span {
        color: #68716a;
        font-size: 13px;
    }

    .item-details strong {
        color: #123d28;
    }

    .order-bottom {
        flex-wrap: wrap;
    }

    .amount {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .amount > strong {
        color: #123d28;
        font-size: 23px;
    }

    .payment {
        color: #68716a;
        font-size: 13px;
    }

    .track-button,
    .primary-button {
        display: inline-block;
        padding: 12px 20px;
        border-radius: 9px;
        background: #2f7d3c;
        color: white;
        text-decoration: none;
        font-weight: 700;
    }

    .state,
    .empty-state {
        padding: 55px 25px;
        border: 1px solid #e0e7dc;
        border-radius: 16px;
        text-align: center;
    }

    .empty-icon {
        font-size: 48px;
    }

    .empty-state h2 {
        color: #123d28;
    }

    .empty-state p {
        margin-bottom: 25px;
        color: #68716a;
    }

    .error {
        color: #b42318;
    }

    @media (max-width: 650px) {
        .orders-page {
            padding: 35px 16px 55px;
        }

        .page-heading {
            align-items: flex-start;
            flex-direction: column;
        }

        .page-heading h1 {
            font-size: 34px;
        }

        .order-card {
            padding: 18px;
        }

        .order-top {
            align-items: flex-start;
            flex-direction: column;
        }

        .order-item {
            flex-wrap: wrap;
        }

        .order-bottom {
            align-items: flex-start;
            flex-direction: column;
        }
    }
</style>
