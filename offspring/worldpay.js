var url = location.toString();

const checkout = {
    cc: "532017120298290",
    cardHolder: "Joe Mama",
    month: "11",
    year: "23",
    cvv: "569",

    checkout() {
        
        // alert('THIS IS A TEST')
        const ccElement = document.getElementById(
            'cardNumber'
        );
        const monthElement = document.getElementById(
            'expiryMonth'
        );
        const yearElement = document.getElementById(
            'expiryYear'
        );
        const cvvElement = document.getElementById(
            'securityCode'
        );
        const savePaymentElement = document.getElementById(
            'saveCardDetailsApproved'
        );
        
        ccElement.click();
        ccElement.value = checkout.cc;
        monthElement.value = checkout.month;
        yearElement.value = checkout.year;
        cvvElement.value = checkout.cvv;

        // function checkCheckout() {
        //     const checkSubmitButton = setInterval(function () {
        //     if (document.getElementById('submitButton')) {
        //         submitCheckout();
        //         clearInterval(checkSubmitButton);
        //     }
        // }, 1500);
        // }
        // checkCheckout();



        // function submitCheckout() {
        //     const paymentSubmitElement = document.getElementById(
        //         'submitButton'
        //     );
        //     paymentSubmitElement.click();
        //     console.log('Successful Checkout');

        // }

        
   


},


};

checkout.checkout();

