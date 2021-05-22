chrome.storage.local.get(
    ["initialized", "active", "account", "websites"],
    function (result) {
        if (result.initialized === true) {
            if (result.account.discordAuth === true) {
                if (result.active === true) {
                    console.log(
                        `%cHyperionScripts injected! Hi %c${result.account.discordUsername}!`,
                        "color: rgb(206, 182, 102); font-size: 15px",
                        "color: rgb(206, 182, 102); font-size: 15px; font-weight: bold"
                    );
                    if (result.websites.zalando.mode !== "OFF") {
                        if (result.websites.zalando.mode === "SAFE") {
                            safe.urlCheck();
                        } else if (
                            result.websites.zalando.mode === "REQUESTS"
                        ) {
                            requests.urlCheck();
                        }
                    }
                }
            } else {
                console.error(
                    `%cHyperionScripts - Could not verify your account, go to settings to log in.`,
                    "color: rgb(206, 182, 102); font-size: 15px"
                );
            }
        } else {
            console.error(
                `%cHyperionScripts - Could not verify your account, go to settings to log in.`,
                "color: rgb(206, 182, 102); font-size: 15px"
            );
        }
    }
);

const paths = {
    mainPage: "home/",
    login: "/login",
    product: "/p/",
    catalog: "/c/",
    cart: "/cart",
    ATC: "add-product?format=ajax",
    checkout: {
        path: "/checkout",
        login: "Checkout-Login",
        shipping: "/checkout?stage=shipping#shipping",
        payment: "/checkout?stage=payment#payment",
        placeOrder: "/checkout?stage=placeOrder#placeOrder",
    },
};

const global = {
    waitForDOM(callback, data) {
        document.addEventListener("DOMContentLoaded", callback(data));
    },
};

const safe = {
    urlCheck() {
        url = location.toString();
        if (url.includes(paths.mainPage)) {
            document
                .querySelector('[href="/myaccount/"]')
                .addEventListener("click", function () {
                    safe.login();
                });
        } else if (
            url.includes(paths.login) ||
            document.getElementsByClassName("reef-zds_modalContent")[0]
        ) {
            global.waitForDOM(safe.login);
        } else if (url.includes(paths.cart)) {
            chrome.storage.local.get(["settings"], function (result) {
                if (result.settings.features.preCart.generating === true) {
                    global.waitForDOM(safe.cart.deleteItem);
                }
            });
        } else if (url.includes(paths.ATC)) {
            global.waitForDOM();
        } else if (url.includes(paths.product)) {
            global.waitForDOM(safe.product.check404);
        } else if (url.includes(paths.checkout.path)) {
            global.waitForDOM(safe.saveItemInfo);
            if (url.toString().includes(paths.checkout.shipping)) {
                global.waitForDOM(safe.checkout.shipping);
            } else if (url.toString().includes(paths.checkout.payment)) {
                global.waitForDOM(safe.checkout.payment);
            } else if (url.toString().includes(paths.checkout.placeOrder)) {
                global.waitForDOM(safe.checkout.placeOrder);
            }
        }
    },
    saveItemInfo() {
        chrome.storage.local.get(["checkout", "websites"], function (result) {
            let checkoutFromStorage = result.checkout;
            let currentProduct = {
                brand: document
                    .getElementsByClassName("t-product-brand-name")[0]
                    .innerHTML.trim(),
                size: document
                    .getElementsByClassName(
                        "b-item-attribute b-item-attribute--size Size-"
                    )[0]
                    .getElementsByClassName("t-checkout-attr-value")[0]
                    .innerHTML,
                model: document
                    .getElementsByClassName("t-product-main-name")[0]
                    .innerHTML.trim(),
                website: location.hostname.replace("www.", ""),
                price: document
                    .getElementsByClassName("b-product-tile-price-item")[0]
                    .innerHTML.trim(),
                user: document.getElementById("dwfrm_contact_email").value,
                imageURL: document
                    .getElementsByClassName("b-dynamic_image_content")[0]
                    .getAttribute("data-src")
                    .trim(),
                payPalURL: "",
                mode: "SAFE",
                webhookMessageSent: false,
            };
            checkoutFromStorage.lastCheckout = currentProduct;
            chrome.storage.local.set({ checkout: checkoutFromStorage });
        });
    },
    login() {
        const waitForLoginPopup = setInterval(function () {
            if (document.getElementsByClassName("reef-zds_modalContent")[0]) {
                console.log("login popup detected");
                chrome.storage.local.get(["websites"], function (result) {
                    if (result.websites.zalando.profile) {
                        console.log(result.websites.zalando.profile);
                        const emailElement =
                                document.getElementById("login.email"),
                            passwordElement =
                                document.getElementById("login.password"),
                            loginButtonElement = document.querySelector(
                                '[data-testid="login_button"]'
                            );
                        emailElement.value =
                            result.websites.zalando.profile.email;
                        passwordElement.value =
                            result.websites.zalando.profile.password;
                        setTimeout(function () {
                            loginButtonElement.click();
                        }, 200);
                    }
                });
            } else if (location.toString().includes(paths.login)) {
                chrome.storage.local.get(["websites"], function (result) {
                    if (result.websites.zalando.profile) {
                        console.log(result.websites.zalando.profile);
                        const emailElement =
                                document.getElementById("login.email"),
                            passwordElement =
                                document.getElementById("login.password"),
                            loginButtonElement = document.querySelector(
                                '[data-testid="login_button"]'
                            );
                        emailElement.value =
                            result.websites.zalando.profile.email;
                        passwordElement.value =
                            result.websites.zalando.profile.password;
                        setTimeout(function () {
                            loginButtonElement.click();
                        }, 200);
                    }
                });
            }
        }, 200);
    },
    product: {
        check404() {
            if (!document.getElementsByClassName("t-error-page-title-exp")[0]) {
                safe.product.sizes.select();
            }
        },
        sizes: {
            anySelected: false,
            selectedNumber: undefined,
            list: [],
            available: {
                list: [],
                numbers: [],
            },
            soldOut: [],
            select() {
                const sizeQuerySelectorValues =
                    document.querySelectorAll("[data-attr-value]");
                sizeQuerySelectorValues.forEach((size) => {
                    if (size.className.includes("b-size-value")) {
                        safe.product.sizes.list.push(size);
                    }
                });

                this.list.forEach((size) => {
                    if (size.className.includes("b-swatch-value--selected")) {
                        this.anySelected = true;
                        return;
                    }
                });
                if (this.anySelected === true) {
                    safe.product.addToCart("safe");
                } else {
                    safe.product.sizes.list.forEach((size) => {
                        if (
                            size.className.includes(
                                "b-swatch-value--orderable"
                            ) &&
                            !size.className.includes("b-swatch-value--sold-out")
                        ) {
                            safe.product.sizes.available.list.push(size);
                        } else {
                            safe.product.sizes.soldOut.push(size);
                        }
                    });
                    safe.product.sizes.available.list.forEach((size) => {
                        safe.product.sizes.available.numbers.push(
                            size.getAttribute("data-attr-value")
                        );
                    });
                    chrome.storage.local.get(["websites"], function (result) {
                        const sizes = result.websites.zalando.sizes;
                        if (safe.product.sizes.available.list.length > 0) {
                            if (!sizes.length > 0) {
                                ("No preferred sizes detected, trying to select a random one.");
                                safe.product.sizes.available.list[0].click();
                                safe.product.addToCart("safe");
                            } else {
                                let success = false;
                                sizes.forEach((size) => {
                                    if (
                                        safe.product.sizes.available.numbers.includes(
                                            size.toString()
                                        ) &&
                                        success === false
                                    ) {
                                        safe.product.sizes.available.list.forEach(
                                            (sizeElement) => {
                                                if (
                                                    sizeElement.getAttribute(
                                                        "data-attr-value"
                                                    ) === size.toString()
                                                ) {
                                                    sizeElement.click();
                                                    safe.product.sizes.selectedNumber =
                                                        size;
                                                    success = true;
                                                    return;
                                                }
                                            }
                                        );
                                    }
                                });
                                if (success === false) {
                                    safe.product.sizes.available.list[0].click();
                                }
                                safe.product.addToCart("safe");
                            }
                        }
                    });
                }
            },
        },
        addToCart(mode) {
            chrome.runtime.onMessage.addListener(
                (message, sender, sendResponse) => {
                    if (
                        message.request.url.includes("zalando.com") &&
                        message.request.url.includes("add-product") &&
                        message.request.statusCode < 400
                    ) {
                        added = true;
                        clearInterval(ATCButtonClick);

                        if (mode === "safe") {
                            safe.checkout.redirect();
                        } else if (mode === "requests") {
                            requests.checkout.shipping.process();
                        }
                    }
                }
            );
            const ATCButtonClick = setInterval(function () {
                document
                    .getElementsByClassName(
                        "f-pdp-button f-pdp-button--active js-btn-add-to-cart"
                    )[0]
                    .click();
            }, 500);
        },
    },
    cart: {
        deleteItem() {
            const deleteItemButtonElement =
                document.getElementsByClassName("i-trash")[0];
            const deleteConfirmationButton = document.getElementsByClassName(
                "f-cart-remove-btn js-remove-confirmation-action f-button f-button--primary"
            )[0];
            deleteItemButtonElement.click();
            deleteConfirmationButton.click();
            chrome.storage.local.get(["settings"], function (result) {
                var oldSettings = result.settings;
                oldSettings.features.preCart.generated = true;
                chrome.storage.local.set({ settings: oldSettings });
            });
        },
    },
    checkout: {
        redirect() {
            chrome.storage.local.get(["settings"], function (result) {
                if (result.settings.features.preCart.generated !== true) {
                    location.replace(
                        location
                            .toString()
                            .slice(0, location.toString().indexOf("/p/")) +
                            paths.checkout.path
                    );
                } else {
                    location.replace(
                        location
                            .toString()
                            .slice(0, location.toString().indexOf("/p/")) +
                            paths.checkout.placeOrder
                    );
                }
            });
        },
        shipping() {
            chrome.runtime.onMessage.addListener(
                (message, sender, sendResponse) => {
                    if (
                        message.request.url.includes("zalando.com") &&
                        message.request.url.includes("shipping") &&
                        message.request.statusCode < 400
                    ) {
                        safe.checkout.payment();
                        safe.checkout.placeOrder();
                    }
                }
            );
            if (
                document.getElementsByClassName(
                    "b-shipment-selector js-home-delivery-tab"
                ).length > 0
            ) {
                if (
                    document.getElementById(
                        "dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress"
                    ).value !== true
                ) {
                    document
                        .getElementById(
                            "dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress"
                        )
                        .click();
                }
                document
                    .getElementsByClassName(
                        "f-button f-button--primary f-button--medium a-checkout-step-submit f-button--full-width js-checkout-step-submit"
                    )[0]
                    .click();
            } else {
                chrome.torage.local.get(["profiles"], function (result) {
                    const selectedProfile = result.websites.zalando.profile;
                    document.querySelectorAll('[data-value="Herr"]')[0].click();
                    document.getElementById(
                        "dwfrm_shipping_shippingAddress_addressFields_firstName"
                    ).value = selectedProfile.name;
                    document.getElementById(
                        "dwfrm_shipping_shippingAddress_addressFields_lastName"
                    ).value = selectedProfile.lastName;
                    document.getElementById(
                        "dwfrm_shipping_shippingAddress_addressFields_postalCode"
                    ).value = selectedProfile.zipCode;
                    document.getElementById(
                        "dwfrm_shipping_shippingAddress_addressFields_city"
                    ).value = selectedProfile.city;
                    document.getElementById(
                        "dwfrm_shipping_shippingAddress_addressFields_street"
                    ).value = selectedProfile.street;
                    document.getElementById(
                        "dwfrm_shipping_shippingAddress_addressFields_suite"
                    ).value = selectedProfile.streetNumber;
                    getElementById("dwfrm_contact_email").value =
                        selectedProfile.email;
                    document.getElementById("dwfrm_contact_phone").value =
                        selectedProfile.phone;
                });
            }
        },
        payment() {
            document.getElementById("paymentMethod_Paypal").click();
            document.getElementById("paymentMethod_Paypal").checked = true;

            var retryPaymentButtonClick = setInterval(function () {
                if (location.toString().includes(paths.checkout.payment)) {
                    document.querySelector("[value='submit-payment']").click();
                }
            }, 300);

            chrome.runtime.onMessage.addListener(
                (message, sender, sendResponse) => {
                    if (
                        message.request.url.includes("solebox.com") &&
                        message.request.url.includes("SubmitPayment") &&
                        message.request.statusCode < 400
                    ) {
                        clearInterval(retryPaymentButtonClick);
                        safe.checkout.placeOrder();
                    }
                }
            );
        },
        placeOrder() {
            const placeOrderButtonClick = setInterval(function () {
                document.querySelector("[value='place-order']").click();
            }, 500);

            chrome.runtime.onMessage.addListener(
                (message, sender, sendResponse) => {
                    if (
                        message.request.url.includes("solebox.") &&
                        message.request.url.includes("PlaceOrder")
                    ) {
                        if (message.request.statusCode === 429) {
                            clearInterval(placeOrderButtonClick);
                            window.open(
                                location
                                    .toString()
                                    .slice(
                                        0,
                                        location.toString().indexOf("/checkout")
                                    ) + paths.cart
                            );
                        }
                    }
                }
            );
        },
    },
};

const requests = {
    urlCheck() {
        url = location.toString();
        if (url.includes(paths.login) || url.includes(paths.checkout.login)) {
            global.waitForDOM(requests.login);
        } else if (url.includes(paths.cart)) {
            chrome.storage.local.get(["settings"], function (result) {
                if (result.settings.features.preCart.generating === true) {
                    global.waitForDOM(requests.cart.deleteItem);
                }
            });
        } else if (url.includes(paths.product)) {
            global.waitForDOM(requests.product.addToCart);
        } else if (url.includes(paths.checkout.path)) {
            global.waitForDOM(requests.checkout.shipping.process);
        }
    },
    generateCSRF(callback) {
        fetch(
            "https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CSRF-Generate?format=ajax",
            {
                headers: {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "en,ca;q=0.9,es;q=0.8",
                    "content-type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    "sec-ch-ua":
                        '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                },
                referrer: location.toString(),
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "POST",
                mode: "cors",
                credentials: "include",
            }
        )
            .then((response) => response.json())
            .then((data) => {
                requests.checkout.CSRFtoken = data.csrf.token;
                callback();
            });
    },
    saveItemInfo(itemInfo, itemImage, itemURL) {
        let user = "";
        chrome.storage.local.get(["websites"], function (result) {
            user = result.websites.solebox.profile.email;
        });
        chrome.storage.local.get(["checkout", "websites"], function (result) {
            let checkoutFromStorage = result.checkout;
            let currentProduct = {
                brand: itemInfo.brand,
                size: itemInfo.variant,
                model: itemInfo.name,
                website: location.hostname.replace("www.", ""),
                price: itemInfo.price.replace(".", ",").concat(" €"),
                user: user,
                imageURL: itemImage,
                itemPageURL: itemURL,
                payPalURL: "",
                mode: "REQUESTS",
                webhookMessageSent: false,
            };
            checkoutFromStorage.lastCheckout = currentProduct;
            chrome.storage.local.set({ checkout: checkoutFromStorage });
        });
    },
    login() {
        console.log(
            `%cHyperionScripts - Logging in...`,
            "color: rgb(206, 182, 102); font-size: 12px"
        );
        chrome.storage.local.get(["websites", "settings"], function (result) {
            fetch("https://www.zalando.es/api/reef/login", {
                headers: {
                    accept: "application/json",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    "content-type": "application/json",
                    dpr: "2",
                    "sec-ch-ua":
                        '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "757",
                    "x-flow-id": "Sh0d7svnECv50Xd0",
                    "x-xsrf-token":
                        "AAAAAPW8PVCVzIvoZN55xEVcwQempIQIgbE-nIoudWlbwFUt6JXMO7gH9z5NrSj-I4G02R7WPz71gXc0j-BOJJ5lvOU8AqGERVyck7gnaCAIt1FuLpgJQ7HAy_aUxrD0I430Cinh-HJ7kw-zNCUEmvM=",
                    "x-zalando-client-id":
                        "0ecf16e6-55d9-4242-bd96-52e4b1ba6c58",
                    "x-zalando-render-page-uri": "/mujer-home/",
                    "x-zalando-request-uri": "/mujer-home/",
                    "x-zalando-toggle-label": "THE_LABEL_IS_ENABLED",
                },
                referrer: location.toString(),
                referrerPolicy: "strict-origin-when-cross-origin",
                body: `{"username":"${result.websites.zalando.profile.email}","password":"${result.websites.zalando.profile.password}","wnaMode":"modal"}`,
                method: "POST",
                mode: "cors",
                credentials: "include",
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success === true) {
                        console.log(
                            `%cHyperionScripts - %cSuccessfully logged in!`,
                            "color: rgb(206, 182, 102); font-size: 12px",
                            "color: rgb(100, 200, 0); font-size: 12px"
                        );
                        if (
                            result.settings.features.autoLogin.solebox === true
                        ) {
                            chrome.storage.local.get(
                                ["features"],
                                function (result) {
                                    console.log(result);
                                    const oldSettings = result.settings;
                                    oldSettings.features.autoLogin.solebox = false;
                                    chrome.storage.local.set(
                                        { settings: oldSettings },
                                        function () {
                                            window.close();
                                        }
                                    );
                                }
                            );
                        }
                    }
                });
        });
    },
    product: {
        sizes: {
            anySelected: false,
            selectedNumber: undefined,
            list: [],
            available: {
                list: [],
                numbers: [],
            },
            soldOut: [],
            select() {
                console.log(
                    `%cHyperionScripts - Selecting sizes...`,
                    "color: rgb(206, 182, 102); font-size: 12px"
                );
                const sizeQuerySelectorValues =
                    document.querySelectorAll("[data-attr-value]");
                sizeQuerySelectorValues.forEach((size) => {
                    if (size.className.includes("b-size-value")) {
                        safe.product.sizes.list.push(size);
                    }
                });

                this.list.forEach((size) => {
                    if (size.className.includes("b-swatch-value--selected")) {
                        this.anySelected = true;
                        return;
                    }
                });
                if (this.anySelected === true) {
                    safe.product.addToCart("requests");
                } else {
                    safe.product.sizes.list.forEach((size) => {
                        if (
                            size.className.includes(
                                "b-swatch-value--orderable"
                            ) &&
                            !size.className.includes("b-swatch-value--sold-out")
                        ) {
                            safe.product.sizes.available.list.push(size);
                        } else {
                            safe.product.sizes.soldOut.push(size);
                        }
                    });
                    safe.product.sizes.available.list.forEach((size) => {
                        safe.product.sizes.available.numbers.push(
                            size.getAttribute("data-attr-value")
                        );
                    });
                    chrome.storage.local.get(["websites"], function (result) {
                        const sizes = result.websites.solebox.sizes;
                        if (safe.product.sizes.available.list.length > 0) {
                            if (!sizes.length > 0) {
                                ("No preferred sizes detected, trying to select a random one.");
                                safe.product.sizes.available.list[0].click();
                                safe.product.addToCart("requests");
                            } else {
                                let success = false;
                                sizes.forEach((size) => {
                                    if (
                                        safe.product.sizes.available.numbers.includes(
                                            size.toString()
                                        ) &&
                                        success === false
                                    ) {
                                        safe.product.sizes.available.list.forEach(
                                            (sizeElement) => {
                                                if (
                                                    sizeElement.getAttribute(
                                                        "data-attr-value"
                                                    ) === size.toString()
                                                ) {
                                                    sizeElement.click();
                                                    safe.product.sizes.selectedNumber =
                                                        size;
                                                    success = true;
                                                    return;
                                                }
                                            }
                                        );
                                    }
                                });
                                if (success === false) {
                                    safe.product.sizes.available.list[0].click();
                                }

                                const waitForSizePid = setInterval(function () {
                                    if (
                                        document
                                            .getElementsByClassName(
                                                "f-pdp-button f-pdp-button--active js-btn-add-to-cart"
                                            )[0]
                                            .getAttribute("data-pid").length >
                                        10
                                    ) {
                                        clearInterval(waitForSizePid);
                                        requests.product.addToCart(
                                            document
                                                .getElementsByClassName(
                                                    "f-pdp-button f-pdp-button--active js-btn-add-to-cart"
                                                )[0]
                                                .getAttribute("data-pid")
                                        );
                                    }
                                }, 300);
                                console.log(
                                    `%cHyperionScripts - %cSuccessfully selected size!`,
                                    "color: rgb(206, 182, 102); font-size: 12px",
                                    "color: rgb(100, 200, 0); font-size: 12px"
                                );
                            }
                        }
                    });
                }
            },
        },
        addToCart(selectedPid) {
            console.log(
                `%cHyperionScripts - Adding to cart...`,
                "color: rgb(206, 182, 102); font-size: 12px"
            );
            let pid = undefined;
            if (selectedPid) {
                pid = selectedPid;
            } else if (
                location
                    .toString()
                    .slice(
                        location.toString().lastIndexOf("-") + 1,
                        location.toString().lastIndexOf(".")
                    ).length > 10
            ) {
                pid = location
                    .toString()
                    .slice(
                        location.toString().lastIndexOf("-") + 1,
                        location.toString().lastIndexOf(".")
                    );
            }

            if (pid) {
                fetch("https://www.solebox.com/de_DE/add-product?format=ajax", {
                    headers: {
                        accept: "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "en,ca;q=0.9,es;q=0.8",
                        "content-type":
                            "application/x-www-form-urlencoded; charset=UTF-8",
                        "sec-ch-ua":
                            '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest",
                    },
                    referrer: location.toString(),
                    referrerPolicy: "strict-origin-when-cross-origin",
                    body: `pid=${pid}&quantity=1`,
                    method: "POST",
                    mode: "cors",
                    credentials: "include",
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (!data.error) {
                            console.log(
                                `%cHyperionScripts - %cSuccessfully added to cart!`,
                                "color: rgb(206, 182, 102); font-size: 12px",
                                "color: rgb(100, 200, 0); font-size: 12px"
                            );
                            requests.checkout.shipping.process();
                        }
                    });
            } else if (
                !document.getElementsByClassName("t-error-page-title-exp")[0]
            ) {
                requests.product.sizes.select();
            }
        },
    },
    cart: {
        deleteItem(pid) {
            fetch(
                `https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/Cart-RemoveProductLineItem?format=ajax&pid=0190033300000010&uuid=${uuid}`,
                {
                    headers: {
                        accept: "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "en,ca;q=0.9,es;q=0.8",
                        "content-type": "application/json",
                        "sec-ch-ua":
                            '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest",
                    },
                    referrer: "https://www.solebox.com/de_DE/cart",
                    referrerPolicy: "strict-origin-when-cross-origin",
                    body: null,
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                }
            );
        },
    },
    checkout: {
        CSRFtoken: "",
        fullProcess() {},
        redirect() {
            chrome.storage.local.get(["settings"], function (result) {
                if (result.settings.features.preCart.generated !== true) {
                    location.replace(
                        location
                            .toString()
                            .slice(0, location.toString().indexOf("/p/")) +
                            paths.checkout.path
                    );
                } else {
                    location.replace(
                        location
                            .toString()
                            .slice(0, location.toString().indexOf("/p/")) +
                            paths.checkout.placeOrder
                    );
                }
            });
        },
        shipping: {
            submitted: false,
            addressID: "",
            shipUUID: "",
            customerProfile: {},
            attempts: 0,
            process() {
                requests.generateCSRF(requests.checkout.shipping.getAddressID);
            },
            getAddressID() {
                console.log(
                    `%cHyperionScripts - Getting user addresses...`,
                    "color: rgb(206, 182, 102); font-size: 12px"
                );
                fetch(
                    "https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-SelectShippingMethod?format=ajax",
                    {
                        headers: {
                            accept: "application/json, text/javascript, */*; q=0.01",
                            "accept-language":
                                "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ja-FR;q=0.6,ja;q=0.5",
                            "content-type":
                                "application/x-www-form-urlencoded; charset=UTF-8",
                            "sec-ch-ua":
                                '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                            "sec-ch-ua-mobile": "?0",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "x-requested-with": "XMLHttpRequest",
                        },
                        referrer: location.toString(),
                        referrerPolicy: "strict-origin-when-cross-origin",
                        body: "methodID=home-delivery&shipmentUUID=",
                        method: "POST",
                        mode: "cors",
                        credentials: "include",
                    }
                )
                    .then((response) => response.json())
                    .then((data) => {
                        requests.checkout.shipping.customerProfile = {
                            ...data.customer.preferredAddress,
                            ...data.customer.profile,
                        };
                        if (data.customer.registeredUser) {
                            console.log(
                                `%cHyperionScripts - %cSuccessfully got user adresses!`,
                                "color: rgb(206, 182, 102); font-size: 12px",
                                "color: rgb(100, 200, 0); font-size: 12px"
                            );
                            requests.checkout.shipping.addressID =
                                data.customer.addresses[0].addressId;
                            requests.checkout.shipping.getRates();
                        } else {
                            console.error(
                                `%cHyperionScripts - User not logged in! Retrying in 3 seconds.`,
                                "color: rgb(206, 182, 102); font-size: 12px"
                            );
                            if (requests.checkout.shipping.attempts < 3) {
                                chrome.storage.local.get(
                                    ["settings"],
                                    function (result) {
                                        const oldSettings = result.settings;
                                        oldSettings.features.autoLogin.solebox = true;
                                        chrome.storage.local.set(
                                            { settings: oldSettings },
                                            function () {
                                                window.open(
                                                    location
                                                        .toString()
                                                        .slice(
                                                            0,
                                                            location
                                                                .toString()
                                                                .indexOf(
                                                                    "/",
                                                                    location
                                                                        .toString()
                                                                        .indexOf(
                                                                            "/",
                                                                            9
                                                                        ) + 1
                                                                )
                                                        ) + paths.login
                                                );
                                                requests.checkout.shipping
                                                    .attempts++;
                                            }
                                        );
                                    }
                                );
                            }

                            setTimeout(function () {
                                requests.checkout.shipping.process();
                            }, 3000);
                        }

                        requests.saveItemInfo(
                            data.order.items.items[0].gtm,
                            data.order.items.items[0].images[0].pdp.srcD,
                            data.order.items.items[0].urls.pdp
                        );
                    });
            },
            getRates() {
                console.log(
                    `%cHyperionScripts - Getting shipping rates...`,
                    "color: rgb(206, 182, 102); font-size: 12px"
                );
                chrome.storage.local.get(["websites"], function (result) {
                    let address2 = "";
                    if (
                        result.websites.solebox.profile.address2 != "" &&
                        result.websites.solebox.profile.address2 != undefined
                    ) {
                        address2 =
                            result.websites.solebox.profile.address2.replaceAll(
                                " ",
                                "+"
                            );
                    } else {
                        address2 = "";
                    }
                    fetch(
                        "https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-ShippingRates?format=ajax",
                        {
                            headers: {
                                accept: "application/json, text/javascript, */*; q=0.01",
                                "accept-language": "en,ca;q=0.9,es;q=0.8",
                                "content-type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                                "sec-ch-ua":
                                    '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                                "sec-ch-ua-mobile": "?0",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "x-requested-with": "XMLHttpRequest",
                            },
                            referrer: location.toString(),
                            referrerPolicy: "strict-origin-when-cross-origin",
                            body: `selected=true&id=${
                                requests.checkout.shipping.addressID
                            }&addressType=home-delivery&snipesStore=&postOfficeNumber=&packstationNumber=&postNumber=&postalCode=${
                                requests.checkout.shipping.customerProfile
                                    .postalCode
                            }&countryCode=${
                                requests.checkout.shipping.customerProfile
                                    .countryCode.value
                            }&suite=${
                                requests.checkout.shipping.customerProfile.suite
                            }&street=${requests.checkout.shipping.customerProfile.street.replaceAll(
                                " ",
                                "+"
                            )}&city=${requests.checkout.shipping.customerProfile.city.replaceAll(
                                " ",
                                "+"
                            )}&address2=${requests.checkout.shipping.customerProfile.address2.replaceAll(
                                " ",
                                "+"
                            )}&lastName=${requests.checkout.shipping.customerProfile.lastName.replaceAll(
                                " ",
                                "+"
                            )}&firstName=${requests.checkout.shipping.customerProfile.firstName.replaceAll(
                                " ",
                                "+"
                            )}&title=${
                                requests.checkout.shipping.customerProfile.title
                            }&csrf_token=${requests.checkout.CSRFtoken}`,
                            method: "POST",
                            mode: "cors",
                            credentials: "include",
                        }
                    )
                        .then((response) => response.json())
                        .then((data) => {
                            console.log(
                                `%cHyperionScripts - %cSuccessfully got shipping rates!`,
                                "color: rgb(206, 182, 102); font-size: 12px",
                                "color: rgb(100, 200, 0); font-size: 12px"
                            );
                            requests.checkout.shipping.shipUUID =
                                data.order.shipping[0].UUID;
                            requests.checkout.shipping.submit();
                            success = data.success;
                            fullResponse = data;
                        });
                });
            },
            submit() {
                console.log(
                    `%cHyperionScripts - Submitting shipping...`,
                    "color: rgb(206, 182, 102); font-size: 12px"
                );
                chrome.storage.local.get(["websites"], function (result) {
                    fetch(
                        `https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-SubmitShipping?region=europe&country=undefined&addressId=${requests.checkout.shipping.addressID}&format=ajax`,
                        {
                            headers: {
                                accept: "application/json, text/javascript, */*; q=0.01",
                                "accept-language": "en,ca;q=0.9,es;q=0.8",
                                "content-type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                                "sec-ch-ua":
                                    '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                                "sec-ch-ua-mobile": "?0",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "x-requested-with": "XMLHttpRequest",
                            },
                            referrer: location.toString(),
                            referrerPolicy: "strict-origin-when-cross-origin",
                            body: `originalShipmentUUID=${requests.checkout.shipping.shipUUID}&shipmentUUID=${requests.checkout.shipping.shipUUID}&dwfrm_shipping_shippingAddress_shippingMethodID=home-delivery_europe&address-selector=${requests.checkout.shipping.addressID}&dwfrm_shipping_shippingAddress_addressFields_title=${requests.checkout.shipping.customerProfile.title}&dwfrm_shipping_shippingAddress_addressFields_firstName=${requests.checkout.shipping.customerProfile.firstName}&dwfrm_shipping_shippingAddress_addressFields_lastName=${requests.checkout.shipping.customerProfile.lastName}&dwfrm_shipping_shippingAddress_addressFields_postalCode=${requests.checkout.shipping.customerProfile.postalCode}&dwfrm_shipping_shippingAddress_addressFields_city=${requests.checkout.shipping.customerProfile.city}&dwfrm_shipping_shippingAddress_addressFields_street=${requests.checkout.shipping.customerProfile.street}&dwfrm_shipping_shippingAddress_addressFields_suite=${requests.checkout.shipping.customerProfile.suite}&dwfrm_shipping_shippingAddress_addressFields_address1=${requests.checkout.shipping.customerProfile.address1}&dwfrm_shipping_shippingAddress_addressFields_address2=${requests.checkout.shipping.customerProfile.address2}&dwfrm_shipping_shippingAddress_addressFields_phone=${requests.checkout.shipping.customerProfile.phone}&dwfrm_shipping_shippingAddress_addressFields_countryCode=${requests.checkout.shipping.customerProfile.countryCode.value}&serviceShippingMethod=ups-standard&dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress=true&dwfrm_billing_billingAddress_addressFields_title=${requests.checkout.shipping.customerProfile.title}&dwfrm_billing_billingAddress_addressFields_firstName=${requests.checkout.shipping.customerProfile.firstName}&dwfrm_billing_billingAddress_addressFields_lastName=${requests.checkout.shipping.customerProfile.lastName}&dwfrm_billing_billingAddress_addressFields_postalCode=${requests.checkout.shipping.customerProfile.postalCode}&dwfrm_billing_billingAddress_addressFields_city=${requests.checkout.shipping.customerProfile.city}&dwfrm_billing_billingAddress_addressFields_street=${requests.checkout.shipping.customerProfile.street}&dwfrm_billing_billingAddress_addressFields_suite=${requests.checkout.shipping.customerProfile.suite}&dwfrm_billing_billingAddress_addressFields_address1=${requests.checkout.shipping.customerProfile.address1}&dwfrm_billing_billingAddress_addressFields_address2=${requests.checkout.shipping.customerProfile.address2}&dwfrm_billing_billingAddress_addressFields_countryCode=${requests.checkout.shipping.customerProfile.countryCode.value}&dwfrm_billing_billingAddress_addressFields_phone=${requests.checkout.shipping.customerProfile.phone}&dwfrm_contact_email=${requests.checkout.shipping.customerProfile.email}&dwfrm_contact_phone=${requests.checkout.shipping.customerProfile.phone}&csrf_token=${requests.checkout.CSRFtoken}`,
                            method: "POST",
                            mode: "cors",
                            credentials: "include",
                        }
                    )
                        .then((response) => response.json())
                        .then((data) => {
                            console.log(
                                `%cHyperionScripts - %cSuccessfully submitted shipping!`,
                                "color: rgb(206, 182, 102); font-size: 12px",
                                "color: rgb(100, 200, 0); font-size: 12px"
                            );
                            requests.checkout.shipping.submitted = true;
                            requests.checkout.payment.submit();
                        });
                });
            },
        },
        payment: {
            submitted: false,
            submit() {
                console.log(
                    `%cHyperionScripts - Submitting payment...`,
                    "color: rgb(206, 182, 102); font-size: 12px"
                );
                fetch(
                    "https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutServices-SubmitPayment?format=ajax",
                    {
                        headers: {
                            accept: "application/json, text/javascript, */*; q=0.01",
                            "accept-language": "en,ca;q=0.9,es;q=0.8",
                            "content-type":
                                "application/x-www-form-urlencoded; charset=UTF-8",
                            "sec-ch-ua":
                                '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                            "sec-ch-ua-mobile": "?0",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "x-requested-with": "XMLHttpRequest",
                        },
                        referrer: location.toString(),
                        referrerPolicy: "strict-origin-when-cross-origin",
                        body: `dwfrm_billing_paymentMethod=Paypal&csrf_token=${requests.checkout.CSRFtoken}`,
                        method: "POST",
                        mode: "cors",
                        credentials: "include",
                    }
                )
                    .then((response) => response.json())
                    .then((data) => {
                        if (!data.error) {
                            console.log(
                                `%cHyperionScripts - %cSuccessfully submitted payment!`,
                                "color: rgb(206, 182, 102); font-size: 12px",
                                "color: rgb(100, 200, 0); font-size: 12px"
                            );
                            requests.checkout.payment.submitted = true;
                            requests.checkout.placeOrder.submit();
                        }
                    });
            },
        },
        placeOrder: {
            submitted: false,
            cartOpened: false,
            submit() {
                console.log(
                    `%cHyperionScripts - Placing order...`,
                    "color: rgb(206, 182, 102); font-size: 12px"
                );
                fetch(
                    "https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutServices-PlaceOrder?format=ajax",
                    {
                        headers: {
                            accept: "application/json, text/javascript, */*; q=0.01",
                            "accept-language": "en,ca;q=0.9,es;q=0.8",
                            "content-type":
                                "application/x-www-form-urlencoded; charset=UTF-8",
                            "sec-ch-ua":
                                '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                            "sec-ch-ua-mobile": "?0",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "x-requested-with": "XMLHttpRequest",
                        },
                        referrer: location.toString(),
                        referrerPolicy: "strict-origin-when-cross-origin",
                        body: null,
                        method: "POST",
                        mode: "cors",
                        credentials: "include",
                    }
                )
                    .then((response) => response.json())
                    .then((data) => {
                        redText = data.error;
                        if (!redText && data.continueUrl) {
                            console.log(
                                `%cHyperionScripts - %cSuccessfully placed order!`,
                                "color: rgb(206, 182, 102); font-size: 12px",
                                "color: rgb(100, 200, 0); font-size: 12px"
                            );
                            console.log(
                                `%cHyperionScripts - %cPayPal link:\n${data.continueUrl}`,
                                "color: rgb(206, 182, 102); font-size: 12px",
                                "color: rgb(0, 156, 218); font-size: 12px"
                            );
                            window.open(data.continueUrl);
                        } else {
                            if (!requests.checkout.placeOrder.cartOpened) {
                                window.open(
                                    location
                                        .toString()
                                        .slice(
                                            0,
                                            location
                                                .toString()
                                                .indexOf(
                                                    "/",
                                                    location
                                                        .toString()
                                                        .indexOf("/", 9) + 1
                                                )
                                        ) + paths.cart
                                );
                            }
                        }
                    });
            },
        },
    },
};
