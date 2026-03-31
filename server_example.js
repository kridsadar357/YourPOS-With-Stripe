// Example Backend Logic for Stripe & PWA Display
// This snippet shows how to handle SSE, Payment Display Clients, and Stripe PromptPay.

const express = require('express');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
const app = express();
app.use(express.json());

// --- Payment Display SSE Logic ---

let paymentDisplayClients = [];
const activeDisplayStates = new Map(); // Cache latest state for reconnects

// SSE Endpoint for PWA
app.get('/api/payment-display/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const terminalId = req.query.terminalId || 'Display-1';
    const client = { res, terminalId };
    paymentDisplayClients.push(client);

    // Re-push latest cached state if available
    if (activeDisplayStates.has(terminalId)) {
        const cached = activeDisplayStates.get(terminalId);
        res.write(`event: ${cached.event}\ndata: ${cached.data}\n\n`);
    }

    req.on('close', () => {
        paymentDisplayClients = paymentDisplayClients.filter(c => c !== client);
    });
});

// Push QR to PWA
app.post('/api/payment-display/push', (req, res) => {
    const { url, amount, terminalId } = req.body;
    const data = JSON.stringify({ url, amount });
    const targetId = terminalId || 'Display-1';

    activeDisplayStates.set(targetId, { event: 'payment_pending', data });

    paymentDisplayClients
        .filter(c => c.terminalId === targetId)
        .forEach(c => c.res.write(`event: payment_pending\ndata: ${data}\n\n`));

    res.json({ success: true });
});

// Notify Success
app.post('/api/payment-display/success', (req, res) => {
    const { amount, terminalId } = req.body;
    const data = JSON.stringify({ amount });
    const targetId = terminalId || 'Display-1';

    activeDisplayStates.set(targetId, { event: 'payment_success', data });

    paymentDisplayClients
        .filter(c => c.terminalId === targetId)
        .forEach(c => c.res.write(`event: payment_success\ndata: ${data}\n\n`));

    res.json({ success: true });
});

// --- Stripe Logic ---

// Create PromptPay Intent
app.post('/api/stripe/create-promptpay', async (req, res) => {
    try {
        const { amount, description } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert to cents/satang
            currency: 'thb',
            payment_method_types: ['promptpay'],
            description: description || 'POS Payment'
        });

        res.json({
            paymentIntentId: paymentIntent.id,
            qrPayload: paymentIntent.next_action.promptpay_display_qr_code.data,
            amount: amount
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Check Status
app.get('/api/stripe/payment-status/:id', async (req, res) => {
    try {
        const intent = await stripe.paymentIntents.retrieve(req.params.id);
        res.json({ status: intent.status });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(3001, () => console.log('Server running on port 3001'));
