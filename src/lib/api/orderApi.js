
const API_BASE_URL = 'http://localhost:8080/api';

function getAuthHeaders(additionalHeaders = {}) {
    const token = localStorage.getItem('accessToken');

    return {
        ...additionalHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: getAuthHeaders(options.headers)
    });

    if (!response.ok) {
        let message = `Request failed (${response.status})`;

        try {
            const errorBody = await response.json();
            message = errorBody.message || errorBody.detail || message;
        } catch {
            // Use the default message if the response isn't JSON.
        }

        if (response.status === 401) {
            throw new Error(
                'Your session has expired or you are not logged in. Please log in again.'
            );
        }

        if (response.status === 403) {
            throw new Error(
                'You are not authorized to perform this action.'
            );
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function createOrder(orderRequest) {
    return requestJson(`${API_BASE_URL}/orders`, {
method: 'POST',
    headers: {
    'Content-Type': 'application/json'
},
body: JSON.stringify(orderRequest)
});
}

export async function getCustomerOrders(customerId) {
    return requestJson(
        `${API_BASE_URL}/orders/customer/${customerId}`
    );
}

export async function getOrder(orderId) {
    return requestJson(`${API_BASE_URL}/orders/${orderId}`);
}

export async function getOrderStatusHistory(orderId) {
    return requestJson(
        `${API_BASE_URL}/orders/${orderId}/status-history`
    );
}
