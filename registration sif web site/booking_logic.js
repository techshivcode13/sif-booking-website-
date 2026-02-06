// Booking page functionality

// --- 1. Global State & Constants ---
let currentBookingState = {
    roomType: '',
    basePrice: 0,
    paymentType: 'full', // 'full' or 'advance'
    finalPrice: 0
};

const ROOM_PRICES = {
    'Standard Room': 2600, // Updated Price
    'Shared Dormitory': 2200,
    '4 Beds Room': 2500,
    '10 Beds Room': 2200
};

// Global Supabase variable
let supabase = null;

// --- 2. Function Definitions ---

function selectRoom(roomType) {
    currentBookingState.roomType = roomType;
    currentBookingState.paymentType = 'full'; // Default to full

    // Determine Base Price
    if (ROOM_PRICES[roomType]) {
        currentBookingState.basePrice = ROOM_PRICES[roomType];
    } else {
        const key = Object.keys(ROOM_PRICES).find(k => roomType.includes(k) || k.includes(roomType));
        currentBookingState.basePrice = key ? ROOM_PRICES[key] : 0;
    }

    if (currentBookingState.basePrice === 0) {
        console.warn('Room price not found for:', roomType);
    }

    // Initialize UI
    renderPaymentOptions(roomType);
    updatePriceBreakdown();

    // Show modal
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    } else {
        console.error('Modal element not found!');
    }
}
window.selectRoom = selectRoom;


function renderPaymentOptions(roomType) {
    console.log('Rendering Payment Options for:', roomType);
    const container = document.getElementById('paymentOptionsContainer');
    const breakdownContainer = document.getElementById('priceBreakdownContainer');
    const roomInfo = document.getElementById('modalRoomType');

    if (!container) {
        console.error('CRITICAL ERROR: paymentOptionsContainer not found in DOM!');
        return;
    }
    if (!breakdownContainer) {
        console.error('CRITICAL ERROR: priceBreakdownContainer not found in DOM!');
        return;
    }

    if (roomType === 'Standard Room') {
        console.log('Standard Room detected. Injecting specific HTML...');
        // Hide default room info, we show it in breakdown/header
        if (roomInfo) roomInfo.style.display = 'none';

        container.innerHTML = `
            <div class="payment-options-container">
                <div class="payment-option-card" id="option-advance" onclick="selectPaymentType('advance')">
                    <input type="radio" name="paymentType" value="advance" class="payment-radio-input">
                    <div class="payment-option-header">
                        <span class="option-title">Advance Payment</span>
                        <span class="option-badge">50% Now</span>
                    </div>
                    <div class="option-price">₹1,300</div>
                    <div class="option-desc">Pay rest at arrival</div>
                </div>

                <div class="payment-option-card selected" id="option-full" onclick="selectPaymentType('full')">
                    <input type="radio" name="paymentType" value="full" class="payment-radio-input" checked>
                    <div class="payment-option-header">
                        <span class="option-title">Full Payment</span>
                        <span class="option-badge">5% OFF</span>
                    </div>
                    <div class="option-price">₹2,470</div>
                    <div class="option-desc">Save ₹130</div>
                </div>
            </div>
        `;
        // Ensure breakdown is visible
        breakdownContainer.style.display = 'block';
        console.log('Payment options injected.');
    } else {
        console.log('Other room detected. Clearing options...');
        // Normal Flow for other rooms
        if (roomInfo) {
            roomInfo.style.display = 'block';
            roomInfo.textContent = `Booking for: ${roomType}`;
        }
        container.innerHTML = '';
        // Simple breakdown for normal rooms
        breakdownContainer.innerHTML = `
             <div class="price-breakdown">
                <div class="breakdown-row total">
                    <span>Total Amount</span>
                    <span>₹${currentBookingState.basePrice.toLocaleString('en-IN')}</span>
                </div>
            </div>
        `;
        // Set state to full naturally
        currentBookingState.paymentType = 'full';
        currentBookingState.finalPrice = currentBookingState.basePrice;
    }
}

function selectPaymentType(type) {
    currentBookingState.paymentType = type;

    // Update UI Cards
    document.querySelectorAll('.payment-option-card').forEach(card => card.classList.remove('selected'));
    document.getElementById(`option-${type}`).classList.add('selected');
    document.querySelector(`input[value="${type}"]`).checked = true;

    updatePriceBreakdown();
}
window.selectPaymentType = selectPaymentType;

function updatePriceBreakdown() {
    if (currentBookingState.roomType !== 'Standard Room') return;

    const basePrice = 2600;
    let finalPayload = {};

    if (currentBookingState.paymentType === 'advance') {
        finalPayload = {
            total: basePrice,
            discount: 0,
            toPay: 1300,
            remaining: 1300,
            label: 'Advance (50%)'
        };
    } else {
        // Full Payment - 5% Discount
        const discountPromise = basePrice * 0.05; // 130
        const finalAmount = basePrice - discountPromise; // 2470
        finalPayload = {
            total: basePrice,
            discount: discountPromise,
            toPay: finalAmount,
            remaining: 0,
            label: 'Full Payment'
        };
    }

    currentBookingState.finalPrice = finalPayload.toPay;

    const container = document.getElementById('priceBreakdownContainer');
    container.innerHTML = `
        <div class="price-breakdown">
            <div class="breakdown-row">
                <span>Room Price</span>
                <span>₹${finalPayload.total.toLocaleString('en-IN')}</span>
            </div>
            ${finalPayload.discount > 0 ? `
            <div class="breakdown-row discount">
                <span>Discount (5%)</span>
                <span>-₹${finalPayload.discount}</span>
            </div>` : ''}
            
            <div class="breakdown-row total">
                <span>To Pay Now</span>
                <span class="highlight">₹${finalPayload.toPay.toLocaleString('en-IN')}</span>
            </div>
            
            ${finalPayload.remaining > 0 ? `
            <div class="breakdown-row">
                <span>Remaining (Pay at property)</span>
                <span>₹${finalPayload.remaining.toLocaleString('en-IN')}</span>
            </div>` : ''}
        </div>
    `;
}


function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            const form = document.getElementById('bookingForm');
            if (form) form.reset();
            // Reset Payment Container
            document.getElementById('paymentOptionsContainer').innerHTML = '';
            document.getElementById('priceBreakdownContainer').innerHTML = '';
        }, 300);
    }
}
window.closeModal = closeModal;


async function handleBookingSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const age = document.getElementById('age').value;
    const mobile = document.getElementById('mobile').value;

    if (!name || !email || !age || !mobile || mobile.length !== 10) {
        alert('Please fill in all fields correctly.');
        return;
    }

    if (!supabase) {
        alert('System Error: Database not connected. Please refresh the page.');
        return;
    }

    const submitBtn = document.querySelector('.btn-confirm');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    // Get Keys from CONFIG
    const razorpayKey = (window.CONFIG && window.CONFIG.RAZORPAY_KEY_ID) ? window.CONFIG.RAZORPAY_KEY_ID : '';

    try {
        // Call create-payment function
        const response = await fetch('/.netlify/functions/create-payment', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                age,
                mobile,
                roomType: currentBookingState.roomType,
                amount: currentBookingState.finalPrice,
                paymentType: currentBookingState.paymentType // 'advance' or 'full'
            })
        });

        const paymentData = await response.json();

        if (!response.ok) {
            throw new Error(paymentData.error || 'Failed to initiate payment');
        }

        const options = {
            "key": paymentData.keyId,
            "amount": paymentData.amount, // In paise
            "currency": paymentData.currency,
            "order_id": paymentData.orderId,
            "name": "Sunyatee Retreat",
            "description": `Booking # ${paymentData.bookingId} - ${currentBookingState.roomType}`,
            "image": "assets/logo.png",
            "handler": async function (response) {
                // Verify Payment
                try {
                    const verifyRes = await fetch('/.netlify/functions/verify-booking', {
                        method: 'POST',
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            booking_id: paymentData.bookingId
                        })
                    });

                    const verifyResult = await verifyRes.json();
                    if (!verifyRes.ok) {
                        throw new Error(verifyResult.error || 'Payment Verification Failed');
                    }

                    // Success
                    console.log('Verified:', verifyResult);
                    document.getElementById('scName').textContent = name;
                    document.getElementById('scID').textContent = response.razorpay_payment_id;

                    document.getElementById('bookingForm').style.display = 'none';
                    // Hide options/breakdown on success
                    document.getElementById('paymentOptionsContainer').style.display = 'none';
                    document.getElementById('priceBreakdownContainer').style.display = 'none';

                    document.getElementById('successCard').style.display = 'block';
                    document.querySelector('.modal-header h2').textContent = 'Success!';
                    document.querySelector('.close-modal').style.display = 'none';

                } catch (verifyErr) {
                    console.error(verifyErr);
                    alert('Payment successful but verification failed. Please contact support.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            },
            "prefill": {
                "name": name,
                "contact": mobile,
                "email": email
            },
            "theme": {
                "color": "#8da399"
            },
            "modal": {
                "ondismiss": function () {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            alert('Payment Failed: ' + response.error.description);
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        });
        rzp1.open();

    } catch (err) {
        console.error('Booking Process Error:', err);
        alert('Error: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}
window.handleBookingSubmit = handleBookingSubmit;


// --- 3. Initialization Logic (Runs after DOM is ready) ---

document.addEventListener('DOMContentLoaded', () => {
    // A. Fade In Animation
    const cards = document.querySelectorAll('.room-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
        }, index * 150);
    });

    // B. Close Modal clicking outside
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'bookingModal') {
                closeModal();
            }
        });
    }

    // C. Initialize Supabase
    try {
        let config = window.CONFIG;
        if (!config && typeof CONFIG !== 'undefined') config = CONFIG; // Fallback

        if (config && window.supabase) {
            supabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
            console.log('Supabase Initialized Successfully');
        } else {
            console.warn('Supabase initialization failed: Missing Config or SDK');
        }
    } catch (e) {
        console.error('Supabase Init Error:', e);
    }
});
