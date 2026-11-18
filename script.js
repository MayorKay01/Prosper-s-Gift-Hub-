/* =========================================================
   PROSPER'S GIFT HUB AND MORE
   Complete Website Interaction System
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    const WHATSAPP_NUMBER = "2347033867656";

    const themeToggle = document.getElementById("themeToggle");
    const applyTheme = theme => {
        const selectedTheme = theme === "dark" ? "dark" : "light";
        document.documentElement.dataset.theme = selectedTheme;

        if (themeToggle) {
            const isDark = selectedTheme === "dark";
            const label = isDark ? "Switch to light mode" : "Switch to dark mode";
            themeToggle.setAttribute("aria-label", label);
            themeToggle.setAttribute("title", label);
            themeToggle.setAttribute("aria-pressed", String(isDark));
        }
    };

    applyTheme(document.documentElement.dataset.theme || "light");

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme =
                document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            applyTheme(nextTheme);

            try {
                localStorage.setItem("prosper-theme", nextTheme);
            } catch (error) {
                console.warn("Unable to save the theme preference.", error);
            }
        });
    }

    const contactForm = document.getElementById("contactForm");
    const contactFormFeedback = document.getElementById("contactFormFeedback");
    let contactFeedbackTimeout;

    if (contactForm && contactFormFeedback) {
        // Keep the fixed popup outside the animated contact section so it is
        // positioned relative to the viewport and cannot inherit its effects.
        document.body.appendChild(contactFormFeedback);

        contactForm.addEventListener("submit", async event => {
            event.preventDefault();

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.setAttribute("aria-busy", "true");
            submitButton.textContent = "Sending…";
            window.clearTimeout(contactFeedbackTimeout);
            contactFormFeedback.hidden = true;
            contactFormFeedback.className = "form-feedback";

            try {
                if (!navigator.onLine) {
                    throw new Error("offline");
                }

                const response = await fetch(contactForm.action, {
                    method: "POST",
                    body: new FormData(contactForm),
                    headers: { Accept: "application/json" }
                });

                if (!response.ok) throw new Error("Message could not be sent");

                contactForm.reset();
                contactFormFeedback.textContent = "Thank you! Your message has been sent successfully. We’ll be in touch soon.";
                contactFormFeedback.classList.add("success");
                contactFormFeedback.hidden = false;
                contactFeedbackTimeout = window.setTimeout(() => {
                    contactFormFeedback.hidden = true;
                }, 5000);
            } catch (error) {
                contactFormFeedback.textContent = navigator.onLine
                    ? "We couldn’t send your message. Please check your connection and try again, or contact us on WhatsApp."
                    : "No internet connection. Please reconnect and try sending your message again.";
                contactFormFeedback.classList.add("error");
                contactFormFeedback.hidden = false;
                contactFeedbackTimeout = window.setTimeout(() => {
                    contactFormFeedback.hidden = true;
                }, 5000);
            } finally {
                submitButton.disabled = false;
                submitButton.removeAttribute("aria-busy");
                submitButton.textContent = originalButtonText;
            }
        });
    }

    const formatCurrency = amount =>
        `₦${amount.toLocaleString("en-NG")}`;


    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    const menuButton = document.getElementById("menuButton");
    const navLinks = document.getElementById("navLinks");

    if (menuButton && navLinks) {

        menuButton.addEventListener("click", () => {

            const isOpen = navLinks.classList.toggle("active");

            menuButton.textContent = isOpen ? "✕" : "☰";
            menuButton.setAttribute("aria-expanded", String(isOpen));

        });

        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("active");
                menuButton.textContent = "☰";
                menuButton.setAttribute("aria-expanded", "false");

            });

        });

    }


    /* =====================================================
       PRODUCT FILTERS
       ===================================================== */

    const filterButtons = document.querySelectorAll(".filter");
    const productCards = document.querySelectorAll(".product-card");
    const clothesSubfilters = document.getElementById("clothesSubfilters");
    const emptyProducts = document.getElementById("emptyProducts");
    const filterAnimations = new WeakMap();
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const selectedCategory = button.dataset.filter;

            if (clothesSubfilters) {
                clothesSubfilters.hidden = selectedCategory !== "clothes" &&
                    !["men-wear", "female-wear"].includes(selectedCategory);
            }

            filterButtons.forEach(filter => {
                filter.classList.remove("active");
                filter.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            const shownInAll = new Set();
            let revealIndex = 0;

            productCards.forEach(card => {
                const category = card.dataset.category;
                const categoryGroup = category.startsWith("men-")
                    ? "men-wear"
                    : category.startsWith("female-")
                        ? "female-wear"
                        : category;

                let matches;

                if (selectedCategory === "all") {
                    matches = !shownInAll.has(categoryGroup);
                    shownInAll.add(categoryGroup);
                } else if (selectedCategory === "men-wear") {
                    matches = ["men-featured", "men-wear"].includes(category);
                } else if (selectedCategory === "female-wear") {
                    matches = ["female-featured", "female-wear"].includes(category);
                } else if (selectedCategory === "clothes") {
                    matches = ["clothes", "men-featured", "female-featured"].includes(category);
                } else {
                    matches = category === selectedCategory;
                }

                card.hidden = !matches;

                if (matches) {
                    card.classList.remove("filter-hidden");
                    card.classList.add("show");

                    filterAnimations.get(card)?.cancel();

                    if (!reduceMotion && typeof card.animate === "function") {
                        const animation = card.animate(
                            [
                                { opacity: 0, transform: "translateY(18px) scale(0.985)" },
                                { opacity: 1, transform: "translateY(0) scale(1)" }
                            ],
                            {
                                duration: 420,
                                delay: (revealIndex % 8) * 35,
                                easing: "cubic-bezier(0.22, 1, 0.36, 1)"
                            }
                        );

                        filterAnimations.set(card, animation);
                        animation.onfinish = () => {
                            if (filterAnimations.get(card) === animation) {
                                filterAnimations.delete(card);
                            }
                        };
                    }

                    revealIndex++;
                } else {
                    card.classList.add("filter-hidden");
                }

            });

            if (emptyProducts) {
                emptyProducts.hidden = Array.from(productCards).some(card => !card.hidden);
            }

        });

    });

    // Apply the All filter on page load so only the featured men's and women's
    // outfits appear alongside the other product categories.
    document.querySelector('.filter[data-filter="all"]')?.click();


    /* =====================================================
       SHOPPING CART ELEMENTS
       ===================================================== */

    const cartButton = document.getElementById("cartButton");
    const cartCount = document.getElementById("cartCount");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCartButton = document.getElementById("closeCart");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const checkoutButton = document.getElementById("checkoutButton");

    let cart = [];


    /* =====================================================
       OPEN AND CLOSE CART
       ===================================================== */

    function openCart() {

        if (!cartOverlay) return;

        cartOverlay.classList.add("active");
        document.body.style.overflow = "hidden";

        if (cartButton) {
            cartButton.setAttribute("aria-expanded", "true");
        }

    }

    function closeCart() {

        if (!cartOverlay) return;

        cartOverlay.classList.remove("active");
        document.body.style.overflow = "";

        if (cartButton) {
            cartButton.setAttribute("aria-expanded", "false");
        }

    }

    cartButton?.addEventListener("click", openCart);
    closeCartButton?.addEventListener("click", closeCart);

    cartOverlay?.addEventListener("click", event => {

        if (event.target === cartOverlay) {
            closeCart();
        }

    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeCart();
        }

    });


    /* =====================================================
       ADD PRODUCTS TO CART
       ===================================================== */

    document.querySelectorAll(".add-cart").forEach(button => {

        button.addEventListener("click", () => {

            const productCard = button.closest(".product-card");

            if (!productCard) return;

            const name =
                productCard.querySelector("h3")?.textContent.trim() ||
                "Product";

            const image =
                productCard.querySelector("img")?.getAttribute("src") || "";

            const rawPrice = String(button.dataset.price ?? "").replace(/,/g, "").trim();
            const parsedPrice = Number(rawPrice);
            const price = Number.isFinite(parsedPrice) && parsedPrice > 0
                ? parsedPrice
                : null;

            const existingProduct = cart.find(item =>
                item.name === name && item.image === image && item.price === price
            );

            if (existingProduct) {

                existingProduct.quantity++;

            } else {

                cart.push({
                    name,
                    image,
                    price,
                    quantity: 1
                });

            }

            renderCart();
            openCart();

        });

    });


    /* =====================================================
       RENDER CART
       ===================================================== */

    function renderCart() {

        if (!cartItems) return;

        cartItems.innerHTML = "";

        let total = 0;
        let quantityTotal = 0;

        if (cart.length === 0) {

            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty.</p>
                    <p>Add something beautiful ✨</p>
                </div>
            `;

        }

        cart.forEach((item, index) => {

            quantityTotal += item.quantity;

            if (item.price !== null) {
                total += item.price * item.quantity;fetch
            }

            const itemElement = document.createElement("div");

            itemElement.className = "cart-item";

            const imageElement = document.createElement("img");
            imageElement.src = item.image;
            imageElement.alt = item.name;

            const details = document.createElement("div");

            const name = document.createElement("h4");
            name.textContent = item.name;

            const price = document.createElement("p");
            price.textContent = item.price === null
                ? "Price to be confirmed"
                : formatCurrency(item.price);

            const controls = document.createElement("div");
            controls.className = "cart-controls";

            const decrease = document.createElement("button");
            decrease.textContent = "−";
            decrease.setAttribute("aria-label", `Decrease ${item.name} quantity`);
            decrease.addEventListener("click", () => changeQuantity(index, -1));

            const quantity = document.createElement("span");
            quantity.textContent = item.quantity;

            const increase = document.createElement("button");
            increase.textContent = "+";
            increase.setAttribute("aria-label", `Increase ${item.name} quantity`);
            increase.addEventListener("click", () => changeQuantity(index, 1));

            controls.append(decrease, quantity, increase);
            details.append(name, price, controls);

            const remove = document.createElement("button");
            remove.className = "remove-item";
            remove.textContent = "✕";
            remove.setAttribute("aria-label", `Remove ${item.name}`);
            remove.addEventListener("click", () => removeProduct(index));

            itemElement.append(imageElement, details, remove);
            cartItems.appendChild(itemElement);

        });

        if (cartCount) {
            cartCount.textContent = quantityTotal;
        }

        if (cartTotal) {
            cartTotal.textContent = formatCurrency(total);
        }

    }


    /* =====================================================
       CHANGE PRODUCT QUANTITY
       ===================================================== */

    function changeQuantity(index, amount) {

        if (!cart[index]) return;

        cart[index].quantity += amount;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        renderCart();

    }


    /* =====================================================
       REMOVE PRODUCT
       ===================================================== */

    function removeProduct(index) {

        cart.splice(index, 1);
        renderCart();

    }


    /* =====================================================
       WHATSAPP CHECKOUT
       ===================================================== */

    checkoutButton?.addEventListener("click", () => {

        if (cart.length === 0) {

            alert("Your cart is empty. Please add a product first.");
            return;

        }

        let message =
            "Hello Prosper's Gift Hub and More! 👋\n\n" +
            "I would like to order the following:\n\n";

        let total = 0;
        let hasUnpricedItems = false;

        cart.forEach(item => {

            if (item.price === null) {

                message += `• ${item.name} x${item.quantity} — Price to be confirmed\n`;
                hasUnpricedItems = true;

            } else {

                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                message +=
                    `• ${item.name} x${item.quantity} — ${formatCurrency(itemTotal)}\n`;

            }

        });

        message += `\nEstimated priced items total: ${formatCurrency(total)}`;

        if (hasUnpricedItems) {
            message += "\nSome product prices still need confirmation.";
        }

        message +=
            "\n\nPlease confirm availability, delivery fee and payment details.";

        const whatsappURL =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, "_blank");

    });


    /* =====================================================
       SCROLL REVEAL ANIMATIONS
       ===================================================== */

    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");
                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -30px 0px"
            }
        );

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("show");
        });

    }


    /* =====================================================
       HEADER SCROLL EFFECT
       ===================================================== */

    const header = document.querySelector(".header");

    window.addEventListener("scroll", () => {

        if (!header) return;

        header.style.boxShadow = window.scrollY > 30
            ? "0 8px 25px rgba(40, 20, 25, 0.08)"
            : "none";

    }, { passive: true });


    /* =====================================================
       AUTOMATIC FOOTER YEAR
       ===================================================== */

    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    /* =====================================================
       INITIALISE CART
       ===================================================== */

    renderCart();

    console.log("Prosper's Gift Hub website is ready.");

});
