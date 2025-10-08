// server.js
const express = require('express');
const app = express();
const stripe = require('stripe')('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'); // Sätt din Stripe Secret Key här
app.use(express.json());
app.use(require('cors')()); // Tillåter att Brizy skickar data

app.post('/create-checkout-session', async (req, res) => {
    const { products } = req.body; // Array med valda produkter och antal
    const lineItems = products.map(p => ({
        price: p.priceId,
        quantity: p.quantity
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'https://techshelf.se/success',
            cancel_url: 'https://techshelf.se/cancel',
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
