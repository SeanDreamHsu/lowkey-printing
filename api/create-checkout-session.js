const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const { product, price, quantity = 1 } = req.body;

            // Create Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: product.name,
                                description: product.desc,
                                images: product.images && product.images.length > 0 ? product.images : [product.image],
                            },
                            unit_amount: Math.round(price * 100), // Stripe expects cents
                        },
                        quantity: quantity,
                    },
                ],
                mode: 'payment',
                success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/product.html?id=${product.id}`,
            });

            res.status(200).json({ id: session.id, url: session.url });
        } catch (err) {
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};
