# Payment System Setup - Stripe for France

## Why Stripe?

Stripe is the **best choice for France** because:
- ✅ **Free test mode** - No charges for testing
- ✅ **Supports Euro (EUR)** - Native French currency support
- ✅ **Works in France** - Fully compliant with French regulations
- ✅ **Easy integration** - Well-documented and developer-friendly
- ✅ **Test cards available** - Use test cards without real payments

## Setup Instructions

### 1. Get Stripe Test Keys (FREE)

1. Go to https://dashboard.stripe.com/register
2. Create a free account (no credit card required for test mode)
3. Go to **Developers → API keys**
4. Copy your **Publishable key** (starts with `pk_test_...`)
5. Copy your **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

### 2. Configure Backend

Add to `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### 3. Configure Frontend (Optional - for Stripe Elements)

If you want to use Stripe Payment Elements UI, add to `frontend/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### 4. Test Cards (FREE - No Real Charges)

Use these test card numbers in Stripe test mode:

**Successful Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Failed Payment (to test errors):**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

More test cards: https://stripe.com/docs/testing

## Current Implementation

The system uses a **simplified payment flow**:

1. **Create Payment Intent** - Backend creates payment intent with Stripe
2. **Confirm Payment** - Backend confirms payment and creates order
3. **Order Created** - Order is saved with `paymentStatus: 'paid'`

## For Production

To add actual card collection in frontend:

1. Install `@stripe/react-stripe-js` (already installed)
2. Wrap checkout with `<Elements>` provider
3. Use `<PaymentElement>` to collect card details
4. Confirm payment client-side with Stripe.js

See: `frontend/src/components/payment/CheckoutForm.jsx` (created but not yet integrated)

## Alternative Payment Providers for France

If you want alternatives:

1. **Mollie** - European payment provider, supports France
2. **PayPal** - Available in France, test mode available
3. **Square** - Has European presence

**Recommendation:** Stick with Stripe - it's the most popular, well-documented, and easiest to use.

## Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Add items to cart
4. Go to checkout
5. Fill shipping address
6. Click "Place Order"
7. Payment will be processed automatically in test mode

## Currency

Currently set to **EUR (Euro)** for France. All amounts are displayed in Euros.

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Testing: https://stripe.com/docs/testing
- Stripe France: https://stripe.com/fr

