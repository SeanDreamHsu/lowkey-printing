const { Redis } = require('@upstash/redis');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const redis = Redis.fromEnv();

// We need to disable body parsing for this route because we need the raw body
// for signature verification.
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function to read raw body
async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        let event;
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        try {
            if (!sig || !webhookSecret) {
                console.error('Webhook Error: Missing signature or secret');
                return res.status(400).send('Webhook Error: Missing signature or secret');
            }
            event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
        } catch (err) {
            console.error(`Webhook Signature Verification Failed: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            console.log('Payment successful for session:', session.id);

            // Create order object
            const order = {
                id: session.id,
                created: new Date().toISOString(),
                customer_email: session.customer_details?.email,
                amount_total: session.amount_total / 100, // Convert from cents
                currency: session.currency,
                payment_status: session.payment_status,
                shipping_details: session.shipping_details,
                line_items: await stripe.checkout.sessions.listLineItems(session.id),
            };

            try {
                // Save order to KV
                await redis.lpush('lowkey_orders', order);
                console.log('Order saved to KV');
            } catch (kvError) {
                console.error('Error saving order to KV:', kvError);
                // We still return 200 to Stripe because the webhook itself was received successfully.
                // In a production app, you might want to retry or log this to an error tracking service.
            }
        }

        res.json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};
