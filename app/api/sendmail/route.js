import axios from 'axios';
import { formatDate,formatTime } from '@/utils/formatting';

// This function sends a booking confirmation email using the Brevo API.
export async function POST(request) {
    try {
        const bookingDetails = await request.json();

        // Format dates and times
        const formattedData = {
            bookingDate: formatDate(bookingDetails.bookingDate),
            fromDate: formatDate(bookingDetails.fromDate),
            toDate: formatDate(bookingDetails.toDate),
            fromTime: formatTime(bookingDetails.fromTime || '00:00'),
            toTime: formatTime(bookingDetails.toTime || '00:00')
        };

        // Prepare email parameters to exactly match the template
        const emailParams = {
            customerName: bookingDetails.customerName,
            orderId: bookingDetails.orderId,
            ...formattedData,
            airport: bookingDetails.airport,
            carNumber: bookingDetails.carNumber,
            parkingSlot: bookingDetails.parkingSlot,
            paidAmount: bookingDetails.paidAmount,
            paymentMethod: bookingDetails.paymentMethod || 'Credit Card',
            Departure_Terminal: bookingDetails.departureTerminal || 'Not specified',
            Departure_Flight: bookingDetails.departureFlightNumber || 'Not specified',
            Arrival_Terminal: bookingDetails.arrivalTerminal || 'Not specified',
            Arrival_Flight: bookingDetails.returnFlightNumber || 'Not specified',
            customerInstruction: bookingDetails.customerInstruction || 'None',
            offerApplied: bookingDetails.offerApplied || 'None',
            couponApplied: bookingDetails.couponApplied || 'None',
            couponDetails: bookingDetails.couponDetails || 'None',
            offerDetails: bookingDetails.offerDetails || 'None'
        };

        const emailPayload = {
            sender: {
                email: process.env.SENDERMAIL,
                name: 'Compare my Parkings'
            },
            to: [
                {
                email: bookingDetails.customerEmail,
                name: bookingDetails.customerName
                }
            ],
            cc: [
                { email: 'kprathap1307@gmail.com', name: 'Devloper' },
                { email: 'sutharsanjeyakodi@gmail.com', name: 'Manager' }
            ],
            templateId: Number(process.env.EMAILTEMP),
            params: emailParams,
            headers: {
                'X-Mailin-custom': 'booking-confirmation'
            }
        };

        // Make the API call
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            emailPayload,
            {
                headers: {
                    'api-key': process.env.EMAILAPI,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 5000
            }
        );

        console.log("Email sent successfully.");
        return new Response(JSON.stringify({
            success: true,
            messageId: response.data.messageId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Email failed to send.");
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to send booking confirmation',
            details: error.message
        }), {
            status: error.response?.status || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
