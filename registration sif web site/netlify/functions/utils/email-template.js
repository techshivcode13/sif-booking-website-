/**
 * Email template for booking confirmation
 * @param {Object} bookingData - Booking information
 * @returns {string} HTML email content
 */
function getEmailTemplate(bookingData) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8da399 0%, #6b8e7f 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                                🙏 Booking Confirmed!
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 16px;">
                                Welcome to Sunyatee Retreat Shantivan
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Dear <strong>${bookingData.name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                                Thank you for booking with Sunyatee Retreat! We're delighted to confirm your reservation. Your payment has been successfully processed.
                            </p>

                            <!-- Booking Details Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-left: 4px solid #8da399; margin: 25px 0; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 12px 0; color: #8da399; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Booking Details
                                        </p>
                                        
                                        <table width="100%" cellpadding="6" cellspacing="0">
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; width: 40%;">Room Type:</td>
                                                <td style="color: #333333; font-size: 14px; font-weight: 600;">${bookingData.roomType}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;">Retreat Dates:</td>
                                                <td style="color: #333333; font-size: 14px; font-weight: 600;">20 Feb 2026 to 23 Feb 2026</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;">Amount Paid:</td>
                                                <td style="color: #28a745; font-size: 16px; font-weight: 700;">₹${bookingData.amount.toLocaleString('en-IN')}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px;">Payment ID:</td>
                                                <td style="color: #333333; font-size: 13px; font-family: monospace;">${bookingData.transactionId}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 25px 0 15px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                                📎 <strong>Your official receipt is attached to this email.</strong> Please save it for your records.
                            </p>

                            <p style="margin: 0 0 20px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                                We look forward to welcoming you to a transformative journey of inner peace and self-discovery at Sunyatee Retreat Shantivan.
                            </p>

                            <!-- What to Bring Section -->
                            <div style="background-color: #fff9e6; border-radius: 6px; padding: 20px; margin: 25px 0;">
                                <p style="margin: 0 0 10px 0; color: #8a6d3b; font-size: 14px; font-weight: 600;">
                                    📋 What to Bring:
                                </p>
                                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                                    <li>Comfortable meditation clothing</li>
                                    <li>Personal toiletries</li>
                                    <li>Water bottle</li>
                                    <li>Any prescribed medications</li>
                                    <li>An open mind and peaceful heart 🧘</li>
                                </ul>
                            </div>

                        </td>
                    </tr>

                    <!-- Contact Section -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 12px 0; color: #333333; font-size: 14px; font-weight: 600;">
                                Need Help?
                            </p>
                            <p style="margin: 0; color: #666666; font-size: 13px; line-height: 1.6;">
                                📧 Email: <a href="mailto:info@sifworld.com" style="color: #8da399; text-decoration: none;">info@sifworld.com</a><br>
                                🌐 Website: <a href="https://www.sifworld.com" style="color: #8da399; text-decoration: none;">www.sifworld.com</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #2c3e50; padding: 20px 30px; text-align: center;">
                            <p style="margin: 0; color: #ecf0f1; font-size: 12px;">
                                © 2026 Sunyatee International Foundation. All rights reserved.
                            </p>
                            <p style="margin: 8px 0 0 0; color: #95a5a6; font-size: 11px;">
                                SY. NO 1128, Beside Ayyappa Temple, Siddipet, Telangana - 502103
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

module.exports = { getEmailTemplate };
