// Stripe Configuration
// Publishable key for Stripe (test mode)
// This key is safe to expose in the frontend

// Stripe publishable key - remove any spaces
// ⚠️ CRITICAL: Your secret key starts with: sk_test_51SqroIQ1lh1OBKoTJMLoFJebo...
// Your publishable key MUST start with: pk_test_51SqroIQ1lh1OBKoTJMLoFJebo... (same prefix!)
// Get the correct key from: https://dashboard.stripe.com/test/apikeys
// 
// CURRENT KEY IS WRONG - it starts with pk_test_51SqroIQ1lh1OBKoTbmb4kahUM... (doesn't match!)
// You need to get the publishable key that matches your secret key from Stripe Dashboard
const rawKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51SqroIQ1lh1OBKoTbmb4kahUMkxkjF3VaDgn3WOGtfOZkOBh1czCvFWCzsAGuheIl2tOKvSYRuKAxGMZgWfHjmjZ00ccDi25XB';

// Remove any spaces or newlines from the key
const cleanedKey = rawKey.replace(/\s+/g, '').trim();

// Validate key format
if (!cleanedKey.startsWith('pk_test_') && !cleanedKey.startsWith('pk_live_')) {
  console.error('❌ CRITICAL: Stripe publishable key format is incorrect! Should start with pk_test_ or pk_live_');
}

// Validate key matches secret key prefix
// Secret key: sk_test_51SqroIQ1lh1OBKoTJMLoFJebo...
// Publishable should: pk_test_51SqroIQ1lh1OBKoTJMLoFJebo...
const expectedPrefix = 'pk_test_51SqroIQ1lh1OBKoTJMLoFJebo';
const currentPrefix = cleanedKey.substring(0, expectedPrefix.length);
if (cleanedKey.startsWith('pk_test_') && !cleanedKey.startsWith(expectedPrefix)) {
  console.error('');
  console.error('❌❌❌ CRITICAL ERROR: Keys DO NOT MATCH! ❌❌❌');
  console.error('');
  console.error('   Your SECRET key:    sk_test_51SqroIQ1lh1OBKoTJMLoFJebo...');
  console.error('   Current PUBLISHABLE: ' + currentPrefix + '...');
  console.error('   Expected PUBLISHABLE: ' + expectedPrefix + '...');
  console.error('');
  console.error('   ⚠️  The keys are from DIFFERENT Stripe accounts!');
  console.error('   ⚠️  This will cause 401 Unauthorized errors!');
  console.error('');
  console.error('🔧 SOLUTION:');
  console.error('   1. Go to: https://dashboard.stripe.com/test/apikeys');
  console.error('   2. Make sure you are logged into the SAME account');
  console.error('   3. Find the publishable key that starts with: pk_test_51SqroIQ1lh1OBKoTJMLoFJebo...');
  console.error('   4. Copy that key and update this file');
  console.error('');
}

export const STRIPE_PUBLISHABLE_KEY = cleanedKey;

// Log key info (first 20 chars only for security)
console.log('🔑 Stripe Publishable Key loaded:', {
  prefix: cleanedKey.substring(0, 20) + '...',
  length: cleanedKey.length,
  isValidFormat: cleanedKey.startsWith('pk_test_') || cleanedKey.startsWith('pk_live_')
});

// Test card numbers for Stripe testing
export const TEST_CARDS = {
  success: {
    number: '4242 4242 4242 4242',
    description: 'Visa - Success (any future date, any CVC)'
  },
  decline: {
    number: '4000 0000 0000 0002',
    description: 'Visa - Declined (any future date, any CVC)'
  },
  requiresAuth: {
    number: '4000 0025 0000 3155',
    description: 'Visa - Requires Authentication (any future date, any CVC)'
  }
};

export default STRIPE_PUBLISHABLE_KEY;

