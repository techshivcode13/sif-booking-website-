// Booking page functionality

// --- 1. Global State & Constants ---
let currentBookingState = {
    roomType: '',
    price: 0
};

// ⚠️ TESTING PRICES - REVERT BEFORE PRODUCTION!
// Original prices: Standard/4 Beds: 2500, Shared/10 Beds: 2200, Advance Standard: 1000, Advance Dormitory: 600
const ROOM_PRICES = {
    'Standard Room': 2500,
    'Shared Dormitory': 2200,
    '4 Beds Room': 2500,
    '10 Beds Room': 2200,
    'Advance Standard Booking': 1000,
    'Advance Dormitory Booking': 600
};

// Global Supabase variable
let supabase = null;

// --- 2. Function Definitions (Must be defined before use) ---

function selectRoom(roomType) {
    currentBookingState.roomType = roomType;

    // Determine price based on room type
    if (ROOM_PRICES[roomType]) {
        currentBookingState.price = ROOM_PRICES[roomType];
    } else {
        const key = Object.keys(ROOM_PRICES).find(k => roomType.includes(k) || k.includes(roomType));
        currentBookingState.price = key ? ROOM_PRICES[key] : 0;
    }

    if (currentBookingState.price === 0) {
        console.warn('Room price not found for:', roomType);
    }

    // Update Modal Content
    const roomTypeElement = document.getElementById('modalRoomType');
    if (roomTypeElement) {
        roomTypeElement.textContent = `Booking for: ${roomType} (₹${currentBookingState.price.toLocaleString('en-IN')})`;
    }

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
// Make selectRoom global explicitly to avoid any scope issues
window.selectRoom = selectRoom;


function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            const form = document.getElementById('bookingForm');
            if (form) form.reset();
        }, 300);
    }
}
window.closeModal = closeModal;


async function handleBookingSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const mobile = document.getElementById('mobile').value;

    if (!name || !age || !mobile || mobile.length !== 10) {
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
        // 1. Create a Booking Record in Supabase (PENDING)
        const { data, error } = await supabase
            .from('bookings')
            .insert([
                {
                    name: name,
                    age: parseInt(age),
                    mobile: mobile,
                    room_type: currentBookingState.roomType,
                    amount: currentBookingState.price,
                    status: 'PENDING'
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to create booking record.');
        }

        const bookingId = data[0].id;

        // 2. Initiate Razorpay Payment
        const options = {
            "key": razorpayKey,
            "amount": currentBookingState.price * 100, // Amount in paise
            "currency": "INR",
            "name": "Sunyatee Retreat",
            "description": `Booking # ${bookingId} - ${currentBookingState.roomType}`,
            "image": "assets/logo.png",
            "handler": async function (response) {
                // 3. Payment Success - Update Supabase Status
                const { error: updateError } = await supabase
                    .from('bookings')
                    .update({
                        status: 'PAID',
                        payment_id: response.razorpay_payment_id
                    })
                    .eq('id', bookingId);

                if (updateError) {
                    console.error('Error updating booking status:', updateError);
                    alert(`Payment successful (ID: ${response.razorpay_payment_id}), but system update failed. Please contact support with this ID.`);
                } else {
                    alert(`Booking Confirmed! Payment ID: ${response.razorpay_payment_id}`);
                    closeModal();
                }
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            },
            "prefill": {
                "name": name,
                "contact": mobile
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
        rzp1.on('payment.failed', async function (response) {
            alert('Payment Failed: ' + response.error.description);
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        });

        rzp1.open();

    } catch (err) {
        console.error('Booking Process Error:', err);
        alert('Something went wrong. Please try again. ' + err.message);
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
