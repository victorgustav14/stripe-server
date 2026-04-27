app.post('/create-checkout-session', async (req, res) => {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'No products provided' });
    }

    const lineItems = products.map(p => ({
        price: p.priceId,
        quantity: p.quantity
    }));

    // ✅ Räkna totalt antal produkter
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

    // ✅ Dynamisk fraktlogik
    let shippingAmount = 12000; // default 120 kr

    if (totalQuantity >= 5) {
        shippingAmount = 25000;
    } else if (totalQuantity >= 3) {
        shippingAmount = 18000;
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',

            success_url: 'https://techshelf.se/success',
            cancel_url: 'https://techshelf.se/cancel',

            shipping_address_collection: {
                allowed_countries: ['SE'],
            },

            phone_number_collection: {
                enabled: true,
            },

            // ✅ Dynamisk frakt
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
        console.error('Stripe error:', err.message);
        res.status(500).json({ error: err.message });
    }
});
