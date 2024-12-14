import React from "react";
import axios from "axios";

const PayPalButton = () => {
  const handlePayment = async () => {
    // Step 1: Create the order
    const orderResponse = await axios.post("/api/create-order", {
      amount: "10.00",
    });
    const orderId = orderResponse.data.id;

    // Step 2: Render PayPal button
    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return orderId; // Return the order ID
        },
        onApprove: async (data, actions) => {
          // Step 3: Capture the order
          const captureResponse = await axios.post("/api/capture-order", {
            orderId: orderId,
          });
          console.log("Capture result:", captureResponse.data);
          alert("Payment successful!");
        },
        onError: (err) => {
          console.error("PayPal Checkout onError", err);
          alert("An error occurred during the payment process.");
        },
      })
      .render("#paypal-button-container");
  };

  return (
    <div>
      <button onClick={handlePayment}>Pay with PayPal</button>
      <div id="paypal-button-container"></div>
    </div>
  );
};

export default PayPalButton;
