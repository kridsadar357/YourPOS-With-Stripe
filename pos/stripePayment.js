// API Utilities for Stripe Payment in POS
const API_BASE_URL = 'http://localhost:3001'; // Update to your Server IP

/**
 * Create a Stripe PromptPay PaymentIntent
 * @param {number} amount - Amount in THB
 * @param {string} description - Payment description
 */
export async function createStripePromptPayIntent(amount, description = 'POS Payment') {
    const response = await fetch(`${API_BASE_URL}/api/stripe/create-promptpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Stripe PromptPay creation failed');
    }

    return await response.json();
}

/**
 * Check the status of a Stripe PaymentIntent
 * @param {string} paymentIntentId
 */
export async function checkStripePaymentStatus(paymentIntentId) {
    const response = await fetch(`${API_BASE_URL}/api/stripe/payment-status/${paymentIntentId}`);
    if (!response.ok) throw new Error('Failed to check payment status');
    return await response.json();
}

/**
 * Push QR Payload to the Customer Display PWA
 * @param {string} qrPayload - The QR string from Stripe
 * @param {number} amount - Amount to display
 * @param {string} terminalId - Target display ID
 */
export async function pushToDisplay(qrPayload, amount, terminalId) {
    const response = await fetch(`${API_BASE_URL}/api/payment-display/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            url: qrPayload, 
            amount, 
            terminalId 
        })
    });
    return await response.json();
}
