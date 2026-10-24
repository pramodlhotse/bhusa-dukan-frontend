<script>
    import { cartCount } from '../stores/cartStore.js';
</script>

<header class="header">

    <div class="logo">
        <div class="logo-icon">🌾</div>

        <div class="logo-text">
            <strong>Bhusa</strong>
            <small>DUKAN</small>
        </div>
    </div>

    <nav>
        <a href="/">Home</a>
        <a href="/#products">Products</a>
        <a href="/#how">How It Works</a>
    </nav>

    <div class="actions">

        <a class="cart-button" href="/cart" title="Shopping Cart">
            🛒

            {#if $cartCount > 0}
        <span class="cart-count">
            {$cartCount}
        </span>
            {/if}
        </a>

        <a class="auth-nav" href="/register">Register</a>
        <a class="profile-button" href="/login" title="Login">
            👤
        </a>

    </div>

</header>

<style>
    .header {
        height: 78px;
        padding: 0 5%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #ffffff;
        border-bottom: 1px solid #e5e9df;
        position: sticky;
        top: 0;
        z-index: 1000;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 180px;
    }

    .logo-icon {
        font-size: 30px;
        line-height: 1;
    }

    .logo-text {
        display: flex;
        flex-direction: column;
        line-height: 1;
    }

    .logo-text strong {
        font-size: 22px;
        font-weight: 800;
        color: #123d28;
    }

    .logo-text small {
        margin-top: 5px;
        font-size: 10px;
        letter-spacing: 2px;
        font-weight: 700;
        color: #7d887d;
    }

    nav {
        display: flex;
        align-items: center;
        gap: 38px;
    }

    nav a {
        text-decoration: none;
        color: inherit;
        font-size: 15px;
        font-weight: 600;
        transition: color 0.2s ease;
    }

    nav a:hover {
        color: #287a3c;
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 180px;
        justify-content: flex-end;
    }

    .cart-button {
        position: relative;
        width: 42px;
        height: 42px;
        border: 1px solid #dfe5dc;
        border-radius: 12px;
        background: #ffffff;
        cursor: pointer;
        font-size: 19px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        text-decoration: none;
        color: inherit;
    }
    .cart-button:hover,
    .profile-button:hover {
        background: #f2f8ed;
        border-color: #b9d6af;
    }

    .profile-button {
        width: 42px;
        height: 42px;
        border: 1px solid #dfe5dc;
        border-radius: 12px;
        background: #ffffff;
        font-size: 19px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;
    }

    .auth-nav {
        text-decoration: none;
        color: #28683d;
        font-size: 14px;
        font-weight: 700;
        padding: 8px 10px;
    }

    .auth-nav:hover {
        text-decoration: underline;
    }

    .cart-count {
        position: absolute;
        top: -7px;
        right: -7px;
        min-width: 20px;
        height: 20px;
        padding: 0 5px;
        border-radius: 10px;
        background: #2f7d3c;
        color: white;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
    }

    @media (max-width: 768px) {

        .header {
            height: 68px;
            padding: 0 20px;
        }

        .logo {
            min-width: auto;
        }

        .logo-text strong {
            font-size: 18px;
        }

        nav {
            display: none;
        }

        .actions {
            min-width: auto;
        }

    }
</style>