// server.js
const express = require('express');
const app = express();
const stripe = require('stripe')('DIN_STRIPE_SECRET_KEY'); // Sätt din Stripe Secret Key här
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
            success_url: 'https://dinhemsida.se/success',
            cancel_url: 'https://dinhemsida.se/cancel',
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
