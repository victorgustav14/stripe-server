// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // 🔒 Hämtar nyckeln säkert från Render Environment

app.use(express.json());
app.use(cors()); // Tillåter att Brizy skickar data

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
        console.error('Stripe error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server running');
    console.log('Stripe key prefix:', process.env.STRIPE_SECRET_KEY?.slice(0, 8)); // 👀 Debug – visar bara "sk_live_"
});
