const API_BASE_URL = 'http://localhost:8080/api';

async function requestJson(url, options = {}) {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        let message = `Address request failed (${response.status})`;

        try {
            const body = await response.json();
            message = body.message || body.detail || message;
        } catch {
            // Keep the default message.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function getCustomerAddresses(customerId) {
    return requestJson(
        `${API_BASE_URL}/customers/${customerId}/addresses`
    );
}

export async function createCustomerAddress(customerId, address) {
    return requestJson(
        `${API_BASE_URL}/customers/${customerId}/addresses`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(address)
        }
    );
}

export async function updateCustomerAddress(
    customerId,
    addressId,
    address
) {
    return requestJson(
        `${API_BASE_URL}/customers/${customerId}/addresses/${addressId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(address)
        }
    );
}

export async function setDefaultCustomerAddress(
    customerId,
    addressId
) {
    return requestJson(
        `${API_BASE_URL}/customers/${customerId}/addresses/${addressId}/default`,
        { method: 'PUT' }
    );
}