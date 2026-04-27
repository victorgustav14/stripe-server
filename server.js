// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(cors());

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { products } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'No products provided' });
        }

        const lineItems = products.map(p => ({
            price: p.priceId,
            quantity: p.quantity
        }));

        // 🔢 Räkna antal
        const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

        // 🚚 Dynamisk frakt
        let shippingAmount = 12000;

        if (totalQuantity >= 5) {
            shippingAmount = 25000;
        } else if (totalQuantity >= 3) {
            shippingAmount = 18000;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',

            success_url: 'https://techshelf.se/success',
            cancel_url: 'https://techshelf.se',

            shipping_address_collection: {
                allowed_countries: ['SE'],
            },

            phone_number_collection: {
                enabled: true,
            },

            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: shippingAmount,
                            currency: 'sek',
                        },
                        display_name: `Frakt (${totalQuantity} st)`,
                    },
                },
            ],
        });

        res.json({ url: session.url });

    } catch (err) {
        console.error('ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server running');
});
