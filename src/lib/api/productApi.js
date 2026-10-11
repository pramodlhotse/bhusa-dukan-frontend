const API_BASE_URL = 'http://localhost:8080/api';

export async function getProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
        throw new Error('Failed to load products');
    }

    return response.json();
}