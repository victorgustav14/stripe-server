// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // 🔒 Hämtar nyckeln från environment

app.use(express.json());
app.use(cors()); // Tillåter requests från din frontend (Brizy)

app.post('/create-checkout-session', async (req, res) => {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'No products provided' });
    }

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

            // ✅ Samla in leveransadress
            shipping_address_collection: {
                allowed_countries: ['SE'],
            },

            // ✅ Samla in telefonnummer (rekommenderas)
            phone_number_collection: {
                enabled: true,
            },

            // ✅ (Valfritt men bra) Lägg till fraktkostnad
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 7900, // 79 SEK
                            currency: 'sek',
                        },
                        display_name: 'Standardfrakt',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 2 },
                            maximum: { unit: 'business_day', value: 5 },
                        },
                    },
                },
            ],
        });

        res.json({ url: session.url });

    } catch (err) {
        console.error('Stripe error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server running');
    console.log('Stripe key prefix:', process.env.STRIPE_SECRET_KEY?.slice(0, 8));
});
