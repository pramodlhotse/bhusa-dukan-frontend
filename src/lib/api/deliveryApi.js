
const API_BASE_URL = 'http://localhost:8080/api';

export async function getDeliveryByOrderId(orderId) {
    const response = await fetch(
        `${API_BASE_URL}/deliveries/order/${orderId}`
    );

    if (!response.ok) {
        let message = `Unable to load delivery details (${response.status})`;

        try {
            const body = await response.json();
            message = body.message || body.detail || message;
        } catch {
            // Keep the default error message.
        }

        throw new Error(message);
    }

    return response.json();
}
