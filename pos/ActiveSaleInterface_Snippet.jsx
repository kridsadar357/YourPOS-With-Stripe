// Example Component Logic for Stripe Payment Integration (React)
import React, { useState, useEffect } from 'react';
import { createStripePromptPayIntent, checkStripePaymentStatus, pushToDisplay } from './stripePayment';

const PaymentComponent = ({ amount }) => {
    const [selectedDisplay, setSelectedDisplay] = useState('Display-1');
    const [paymentIntentId, setPaymentIntentId] = useState(null);
    const [status, setStatus] = useState('idle');

    // 1. Start Payment Process
    const startPayment = async () => {
        try {
            setStatus('creating_intent');
            // Create Stripe PromptPay Intent
            const res = await createStripePromptPayIntent(amount, 'POS Sale');
            setPaymentIntentId(res.paymentIntentId);

            // 2. Push to Display
            await pushToDisplay(res.qrPayload, amount, selectedDisplay);
            setStatus('waiting_for_payment');
        } catch (err) {
            console.error('Payment Error:', err);
            setStatus('error');
        }
    };

    // 3. Status Polling (Every 3 seconds)
    useEffect(() => {
        let interval;
        if (status === 'waiting_for_payment' && paymentIntentId) {
            interval = setInterval(async () => {
                const res = await checkStripePaymentStatus(paymentIntentId);
                if (res.status === 'succeeded') {
                    setStatus('success');
                    clearInterval(interval);
                    // Notify Display of SUCCESS
                    await fetch('/api/payment-display/success', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount, terminalId: selectedDisplay })
                    });
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [status, paymentIntentId, amount, selectedDisplay]);

    return (
        <div>
            <h2>Pay Online: {amount} THB</h2>
            <p>Status: {status}</p>
            <button onClick={startPayment} disabled={status !== 'idle'}>
                Send to Customer Display ({selectedDisplay})
            </button>
        </div>
    );
};

export default PaymentComponent;
