<script>
    import { onMount } from 'svelte';
    import Header from './lib/components/Header.svelte';
    import Cart from './lib/components/Cart.svelte';
    import { getProducts } from './lib/api/productApi.js';
    import {
        addToCart as addProductToCart,
        cartCount
    } from './lib/stores/cartStore.js';
    import Checkout from "./lib/components/Checkout.svelte";
    import MyOrders from './lib/components/MyOrders.svelte';
    import OrderTracking from './lib/components/OrderTracking.svelte';
    import { loginCustomer, registerCustomer } from './lib/api/authApi.js';
    let currentPath = window.location.pathname;
    let searchParams = new URLSearchParams(window.location.search);

    let products = [];
    let loading = true;
    let error = '';
    let addedMessage = '';
    let loginIdentifier = '';
    let loginPassword = '';
    let loginError = '';
    let loginLoading = false;
    let registeredSuccess = searchParams.get('registered') === '1';
    let registerName = '';
    let registerMobile = '';
    let registerEmail = '';
    let registerPassword = '';
    let registerConfirmPassword = '';
    let registerError = '';
    let registerLoading = false;
    async function handleLogin(event) {
        event.preventDefault();

        loginError = '';
        loginLoading = true;

        try {
            await loginCustomer({
                identifier: loginIdentifier.trim(),
                password: loginPassword
            });

            window.location.href = '/my-orders';
        } catch (error) {
            loginError = error.message || 'Unable to log in. Please try again.';
        } finally {
            loginLoading = false;
        }
    }

    async function handleRegister(event) {
        event.preventDefault();

        registerError = '';
        registerLoading = true;

        const name = registerName.trim();
        const mobile = registerMobile.trim();
        const email = registerEmail.trim();

        try {
            if (!/^[0-9]{10,15}$/.test(mobile)) {
                throw new Error('Mobile number must contain 10 to 15 digits');
            }

            if (registerPassword.length < 8 || registerPassword.length > 72) {
                throw new Error('Password must contain 8 to 72 characters');
            }

            if (registerPassword !== registerConfirmPassword) {
                throw new Error('Passwords do not match');
            }

            await registerCustomer({
                name,
                mobile,
                email,
                password: registerPassword
            });

            window.location.href = '/login?registered=1';
        } catch (error) {
            registerError = error.message || 'Unable to register. Please try again.';
        } finally {
            registerLoading = false;
        }
    }

    onMount(async () => {
        try {
            products = await getProducts();
        } catch (e) {
            console.error(e);
            error = 'Unable to load products. Please try again.';
        } finally {
            loading = false;
        }
    });

    function addToCart(product) {
        addProductToCart(product);

        addedMessage = `${product.name} added to cart`;

        setTimeout(() => {
            addedMessage = '';
        }, 1800);
    }

    function getProductIcon(product) {
        return product.name?.toLowerCase().includes('wheat')
            ? '🌾'
            : '🌿';
    }
</script>

<svelte:head>
    <title>Bhusa Dukan | Quality Bhusa Delivered</title>
</svelte:head>

{#if currentPath === '/login'}

    <Header />

    <main class="auth-page">
        <section class="auth-card">
            <div class="auth-icon">🌾</div>

            <h1>Welcome Back</h1>
            <p>Log in to manage your Bhusa Dukan orders.</p>

            <form on:submit|preventDefault={handleLogin}>
                <label for="loginIdentifier">Email or mobile number</label>
                <input
                        id="loginIdentifier"
                        type="text"
                        bind:value={loginIdentifier}
                        placeholder="Enter email or mobile number"
                        autocomplete="username"
                        required
                />

                <label for="loginPassword">Password</label>
                <input
                        id="loginPassword"
                        type="password"
                        bind:value={loginPassword}
                        placeholder="Enter your password"
                        autocomplete="current-password"
                        required
                />

                {#if registeredSuccess}
                    <p class="auth-success" role="status">
                        Account created. Please log in to continue.
                    </p>
                {/if}

                {#if loginError}
                    <p class="auth-error" role="alert">{loginError}</p>
                {/if}

                <button type="submit" disabled={loginLoading}>
                    {loginLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p class="auth-note">
                New customer? <a href="/register">Create an account</a>
            </p>

            <a class="auth-home" href="/">Back to home</a>
        </section>
    </main>



{:else if currentPath === '/register'}

    <Header />

    <main class="auth-page">
        <section class="auth-card">
            <div class="auth-icon">🌾</div>

            <h1>Create Account</h1>
            <p>Register to order bhusa and track deliveries.</p>

            <form on:submit|preventDefault={handleRegister}>
                <label for="registerName">Full name</label>
                <input
                        id="registerName"
                        type="text"
                        bind:value={registerName}
                        placeholder="Enter your full name"
                        autocomplete="name"
                        maxlength="100"
                        required
                />

                <label for="registerMobile">Mobile number</label>
                <input
                        id="registerMobile"
                        type="tel"
                        bind:value={registerMobile}
                        placeholder="10 to 15 digit mobile number"
                        autocomplete="tel"
                        inputmode="numeric"
                        required
                />

                <label for="registerEmail">Email</label>
                <input
                        id="registerEmail"
                        type="email"
                        bind:value={registerEmail}
                        placeholder="Enter your email address"
                        autocomplete="email"
                        maxlength="150"
                        required
                />

                <label for="registerPassword">Password</label>
                <input
                        id="registerPassword"
                        type="password"
                        bind:value={registerPassword}
                        placeholder="At least 8 characters"
                        autocomplete="new-password"
                        minlength="8"
                        maxlength="72"
                        required
                />

                <label for="registerConfirmPassword">Confirm password</label>
                <input
                        id="registerConfirmPassword"
                        type="password"
                        bind:value={registerConfirmPassword}
                        placeholder="Re-enter your password"
                        autocomplete="new-password"
                        minlength="8"
                        maxlength="72"
                        required
                />

                {#if registerError}
                    <p class="auth-error" role="alert">{registerError}</p>
                {/if}

                <button type="submit" disabled={registerLoading}>
                    {registerLoading ? 'Creating account...' : 'Register'}
                </button>
            </form>

            <p class="auth-note">
                Already have an account? <a href="/login">Log in</a>
            </p>

            <a class="auth-home" href="/">Back to home</a>
        </section>
    </main>



{:else if currentPath === '/cart'}

    <Header />

    <Cart />

{:else if currentPath === '/checkout'}

    <Header />

    <Checkout />
{:else if currentPath === '/my-orders'}

    <Header />

    <MyOrders />
{:else if currentPath === '/track-order'}

    <Header />
    <OrderTracking />
{:else}

    <!-- ========================= -->
    <!-- HOME PAGE -->
    <!-- ========================= -->

    <Header />


    <main>

        <!-- HERO -->
        <section class="hero">

            <div class="hero-in">

                <div>

                    <label>🌾 TRUSTED BHUSA DELIVERY</label>

                    <h1>
                        Quality Bhusa,
                        <br />
                        <em>Delivered to Your Door</em>
                    </h1>

                    <p>
                        Order clean, quality bhusa with transparent
                        weighing, fair pricing and reliable home delivery.
                    </p>

                    <div class="buttons">

                        <a href="#products">
                            Shop Bhusa
                        </a>

                        <a class="outline" href="#how">
                            How it works
                        </a>

                    </div>

                    <div class="trust">
                        ✓ Accurate Weight
                        ✓ Home Delivery
                        ✓ UPI & COD
                    </div>

                </div>


                <div class="visual">

                    <div class="card">

                        🌾

                        <div>
                            <strong>Fresh Bhusa</strong>
                            <small>Quality checked</small>
                        </div>

                    </div>


                    <div class="card second">

                        ⚖️

                        <div>
                            <strong>Transparent Weight</strong>
                            <small>Verified before delivery</small>
                        </div>

                    </div>

                </div>

            </div>

        </section>


        <!-- PRODUCTS -->
        <section id="products" class="section">

            <div class="heading">

                <div>

                    <label>OUR PRODUCTS</label>

                    <h2>
                        Popular Bhusa
                    </h2>

                </div>


                <p>
                    Choose the bhusa you need and order from the comfort
                    of your home.
                </p>

            </div>


            {#if loading}

                <div class="state">
                    Loading products...
                </div>


            {:else if error}

                <div class="state error">
                    {error}
                </div>


            {:else if products.length === 0}

                <div class="state">
                    No products available.
                </div>


            {:else}

                <div class="grid">

                    {#each products as product}

                        <article>

                            <div class="pic">

                                <span>
                                    {getProductIcon(product)}
                                </span>

                                <small>
                                    Quality Checked
                                </small>

                            </div>


                            <div class="body">

                                <h3>
                                    {product.name}
                                </h3>


                                <p>
                                    Quality
                                    {product.name.toLowerCase()}
                                    for your cattle.
                                </p>


                                <div class="price">

                                    <div>

                                        <strong>
                                            ₹{Number(product.price).toFixed(2)}
                                        </strong>

                                        <span>
                                            / {product.unit}
                                        </span>

                                    </div>


                                    <small>
                                        Min. {product.minimumQuantity} KG
                                    </small>

                                </div>


                                <button
                                        on:click={() => addToCart(product)}
                                >
                                    Add to Cart
                                </button>

                            </div>

                        </article>

                    {/each}

                </div>

            {/if}

        </section>


        <!-- HOW IT WORKS -->
        <section id="how" class="section">

            <div class="center">

                <label>
                    SIMPLE PROCESS
                </label>

                <h2>
                    How Bhusa Dukan Works
                </h2>

                <p>
                    From ordering to delivery, we keep everything
                    simple and transparent.
                </p>

            </div>


            <div class="steps">

                <div>

                    <i>🛒</i>

                    <strong>
                        Place Order
                    </strong>

                    <span>
                        Select bhusa and quantity.
                    </span>

                </div>


                <div>

                    <i>⚖️</i>

                    <strong>
                        Weigh
                    </strong>

                    <span>
                        Actual quantity is verified.
                    </span>

                </div>


                <div>

                    <i>📦</i>

                    <strong>
                        Pack & Dispatch
                    </strong>

                    <span>
                        Your order is prepared.
                    </span>

                </div>


                <div>

                    <i>🚚</i>

                    <strong>
                        Deliver
                    </strong>

                    <span>
                        Track and confirm delivery.
                    </span>

                </div>

            </div>

        </section>


        <!-- BENEFITS -->
        <section class="benefits">

            <div>

                ⚖️

                <span>

                    <strong>
                        Transparent Weight
                    </strong>

                    <small>
                        Pay for actual quantity
                    </small>

                </span>

            </div>


            <div>

                🚚

                <span>

                    <strong>
                        Home Delivery
                    </strong>

                    <small>
                        Convenient delivery
                    </small>

                </span>

            </div>


            <div>

                💳

                <span>

                    <strong>
                        Flexible Payment
                    </strong>

                    <small>
                        UPI, Online or COD
                    </small>

                </span>

            </div>

        </section>

    </main>


    <footer>

        <div>

            🌾

            <strong>
                Bhusa Dukan
            </strong>

        </div>

        <span>
            Quality bhusa, transparent weighing and reliable delivery.
        </span>

        <small>
            © 2026 Bhusa Dukan
        </small>

    </footer>


    {#if addedMessage}

        <div class="toast">
            ✓ {addedMessage}
        </div>

    {/if}

{/if}