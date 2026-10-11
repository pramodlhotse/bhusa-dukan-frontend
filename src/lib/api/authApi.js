
const API_BASE_URL = 'http://localhost:8080/api';

async function requestJson(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        let message = `Request failed (${response.status})`;

        try {
            const errorBody = await response.json();
            message = errorBody.message || errorBody.detail || message;
        } catch {
            // Keep the default error message.
        }

        throw new Error(message);
    }

    return response.json();
}

export async function registerCustomer(customerData) {
    return requestJson('/auth/register', {
        method: 'POST',
        body: JSON.stringify(customerData)
    });
}

export async function loginCustomer(credentials) {
    const response = await requestJson('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });

    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('userId', String(response.userId));
    localStorage.setItem('userName', response.name);
    localStorage.setItem('userRole', response.role);

    if (response.email) {
        localStorage.setItem('userEmail', response.email);
    }

    return response;
}

export function logoutCustomer() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
}
