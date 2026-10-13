
<script>
    import { updateActualWeight } from '../../lib/api/orderApi.js';

    let orderId = '';
    let orderItemId = '';
    let actualQuantity = '';
    let loading = false;
    let successMessage = '';
    let errorMessage = '';

    async function saveWeight() {
        successMessage = '';
        errorMessage = '';

        if (!orderId || !orderItemId || !actualQuantity) {
            errorMessage = 'Please enter the order ID, item ID, and actual weight.';
            return;
        }

        const quantity = Number(actualQuantity);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            errorMessage = 'Actual weight must be greater than zero.';
            return;
        }

        loading = true;

        try {
            await updateActualWeight(
                Number(orderId),
                Number(orderItemId),
                quantity
            );

            successMessage = 'Actual weight updated successfully.';
            actualQuantity = '';
        } catch (error) {
            errorMessage = error.message || 'Unable to update actual weight.';
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Update Actual Weight | Bhusa Dukan</title>
    <meta
        name="description"
        content="Record actual weighed quantity for a Bhusa Dukan order."
    />
</svelte:head>

<section class="weight-page">
    <div class="page-heading">
        <span class="eyebrow">ADMIN / STAFF</span>
        <h1>Update Actual Weight</h1>
        <p>Enter the measured quantity for an order item.</p>
    </div>

    <form class="weight-card" onsubmit={(event) => {
        event.preventDefault();
        saveWeight();
    }}>
        <div class="field">
            <label for="orderId">Order ID</label>
            <input
                id="orderId"
                type="number"
                min="1"
                step="1"
                bind:value={orderId}
                placeholder="Enter order ID"
                required
            />
        </div>

        <div class="field">
            <label for="orderItemId">Order Item ID</label>
            <input
                id="orderItemId"
                type="number"
                min="1"
                step="1"
                bind:value={orderItemId}
                placeholder="Enter order item ID"
                required
            />
        </div>

        <div class="field">
            <label for="actualQuantity">Actual Weight (kg)</label>
            <div class="weight-input">
                <input
                    id="actualQuantity"
                    type="number"
                    min="0.001"
                    step="0.001"
                    bind:value={actualQuantity}
                    placeholder="e.g. 48.500"
                    required
                />
                <span>kg</span>
            </div>
        </div>

        {#if successMessage}
            <p class="message success" role="status">{successMessage}</p>
        {/if}

        {#if errorMessage}
            <p class="message error" role="alert">{errorMessage}</p>
        {/if}

        <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Actual Weight'}
        </button>
    </form>
</section>

<style>
    .weight-page {
        max-width: 680px;
        margin: 40px auto;
        padding: 24px;
    }

    .page-heading {
        margin-bottom: 24px;
    }

    .eyebrow {
        color: #166534;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1.2px;
    }

    h1 {
        margin: 8px 0;
        color: #172b20;
        font-size: 30px;
    }

    .page-heading p {
        color: #647067;
        margin: 0;
    }

    .weight-card {
        display: grid;
        gap: 20px;
        padding: 28px;
        border: 1px solid #e0e7e1;
        border-radius: 16px;
        background: white;
        box-shadow: 0 8px 24px rgb(0 0 0 / 5%);
    }

    .field {
        display: grid;
        gap: 8px;
    }

    label {
        color: #29382e;
        font-weight: 600;
    }

    input {
        box-sizing: border-box;
        width: 100%;
        padding: 12px 14px;
        border: 1px solid #cbd5ce;
        border-radius: 8px;
        font: inherit;
    }

    input:focus {
        border-color: #15803d;
        outline: 2px solid #dcfce7;
    }

    .weight-input {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .weight-input span {
        color: #475569;
        font-weight: 600;
    }

    button {
        padding: 14px;
        border: 0;
        border-radius: 8px;
        background: #166534;
        color: white;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }

    button:disabled {
        cursor: wait;
        opacity: 0.65;
    }

    .message {
        margin: 0;
        padding: 12px;
        border-radius: 8px;
    }

    .success {
        background: #f0fdf4;
        color: #166534;
    }

    .error {
        background: #fef2f2;
        color: #b91c1c;
    }

    @media (max-width: 600px) {
        .weight-page {
            margin: 16px auto;
            padding: 16px;
        }

        .weight-card {
            padding: 20px;
        }

        h1 {
            font-size: 25px;
        }
    }
</style>
