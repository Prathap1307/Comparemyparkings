export const runtime = "nodejs";

// app/api/chat/ai/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { message, context, conversationState } = await request.json();
        
        console.log('AI API Received:', { message, context, conversationState });

        // First try the enhanced fallback response
        const fallbackResponse = getEnhancedFallbackResponse(message, conversationState);
        
        // If we have Gemini API key, try AI, otherwise use fallback
        if (process.env.GEMINIAPI) {
            try {
                const aiResponse = await callGeminiAI(message, context, conversationState);
                console.log('Gemini Response:', aiResponse);
                
                if (aiResponse && aiResponse.trim().length > 0) {
                    return NextResponse.json({ 
                        response: aiResponse,
                        success: true,
                        source: 'gemini'
                    });
                }
            } catch (aiError) {
                console.error('Gemini AI failed, using fallback:', aiError);
            }
        }

        console.log('Using fallback response:', fallbackResponse);
        
        return NextResponse.json({ 
            response: fallbackResponse,
            success: true,
            source: 'fallback'
        });

    } catch (error) {
        console.error('AI API error:', error);
        const fallbackResponse = getEnhancedFallbackResponse(message, {});
        return NextResponse.json({ 
            response: fallbackResponse,
            success: false,
            source: 'error_fallback'
        });
    }
}

async function callGeminiAI(userMessage, context, conversationState) {
    const API_KEY = process.env.GEMINIAPI;
    
    if (!API_KEY) {
        throw new Error('Gemini API key not found');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    const prompt = createConversationPrompt(userMessage, context, conversationState);
    console.log('Sending prompt to Gemini:', prompt);

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.8,
            topK: 40
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini raw response:', data);
    
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts[0].text) {
        
        const cleanedResponse = data.candidates[0].content.parts[0].text.trim();
        return cleanedResponse;
    } else {
        console.error('Unexpected Gemini response structure:', data);
        throw new Error('Invalid response structure from Gemini');
    }
}

function createConversationPrompt(userMessage, context, conversationState = {}) {
    const state = conversationState || {};
    
    return `
You are ParkAssist, the official customer service assistant for Compare My Parkings.

COMPANY: Compare My Parkings
SERVICE: Airport parking comparison across 74+ secure providers
WEBSITE: comparemyparkings.co.uk

IMPORTANT TERMS & POLICIES:
- We act as booking agent only - parking contract is with the provider
- Cancellation policy: 
  * Within 48 hours: Full refund
  * Within 24 hours: 80% refund  
  * Within 12 hours: 50% refund
  * Within 6 hours: No refund
- Car extensions: Based on availability, extra charges apply
- Complaints: Categorized into car damage, behavior, late pickup/drop, tickets/penalties

CURRENT CONVERSATION:
- User Intent: ${state.intent || 'not detected'}
- Conversation Step: ${state.step || 'initial'}
- Collected Data: ${JSON.stringify(state.collectedData || {})}

USER'S MESSAGE: "${userMessage}"

RESPONSE GUIDELINES:
1. Be friendly, professional, and conversational - use natural dialogue
2. Follow the specific workflow steps for each intent
3. For cancellations: collect email, booking ID, date, then ask reason (optional)
4. For extensions: ask arrival/departure first, then collect details
5. For complaints: categorize and provide appropriate response
6. Always generate case IDs for tracking
7. Keep responses conversational and natural
8. Always emphasize we'll contact within 48 hours via email
9. Use the exact conversation style from the example flows provided
10. Show empathy where appropriate (sorry for issues, happy to help for bookings)
11. Provide specific details when possible (mention terminals, example prices for booking)

IMPORTANT: Respond in a natural, conversational tone exactly like the example conversations. Do not use markdown. Keep response under 200 words.

Now respond to the user's message appropriately:
`;
}

function getEnhancedFallbackResponse(userMessage, conversationState = {}) {
    const msg = userMessage.toLowerCase();
    const state = conversationState || {};
    const intent = state.intent;
    const step = state.step;

    console.log('Fallback analysis:', { msg, intent, step });

    // Handle greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "Hello! I'm ParkAssist, your parking assistant from Compare My Parkings. I can help you find and manage your airport parking across 74+ secure providers. How can I assist you today?";
    }

    // Handle casual conversation
    if (msg.includes('how are you')) {
        return "I'm doing great, thanks for asking! I'm here and ready to help you with all your parking needs. What can I assist you with today?";
    }

    // Handle booking intent - UPDATED CONVERSATIONAL STYLE
    if (intent === 'booking') {
        switch (step) {
            case 'ask_airport':
                return "Hello! I'm ParkAssist, your parking assistant. I can help you find a spot. All our parking providers are 100% verified. Which airport do you need parking at?";
            case 'ask_dates':
                return `Great. Let me compare our providers for ${state.collectedData?.airport || 'that airport'}. Please confirm your travel dates and times (arrival and departure).`;
            case 'ask_passengers':
                return "Understood. Please confirm how many passengers and any special requirements you have?";
            case 'provide_booking_link':
                const airport = state.collectedData?.airport || 'your airport';
                const dates = state.collectedData?.dates || 'your dates';
                return `Understood. I see several options for ${airport}. Remember that you should read the specific parking provider's terms before booking. You can compare all options and make your booking at comparemyparkings.co.uk. We have meet-and-greet services and secured park-and-ride options available.`;
            default:
                return "Hello! I'm ParkAssist, your parking assistant. I can help you find a spot. All our parking providers are 100% verified. Which airport do you need parking at?";
        }
    }

    // Handle cancellation intent - UPDATED CONVERSATIONAL STYLE
    if (intent === 'cancellation') {
        switch (step) {
            case 'ask_email':
                return "I'm sorry to hear that. To process your cancellation, could you please confirm your email address associated with the booking?";
            case 'ask_booking_id':
                return "Thank you. Could you please provide your booking ID?";
            case 'ask_booking_date':
                return "Got it. What was the date of your original booking?";
            case 'ask_cancellation_reason':
                const caseId = generateCaseId();
                return `Thank you for the details. May I ask why you need to cancel? (This is optional, but it helps us improve our service.)\n\nI've created cancellation case ${caseId} for tracking.`;
            case 'process_cancellation':
                const refundPolicy = "Our standard policy is: if you cancel more than 48 hours before your drop-off time, there is a £15 admin fee deducted from the refund. Unfortunately, cancellations within 48 hours of drop-off are non-refundable.";
                const finalCaseId = generateCaseId();
                return `I've noted your reason. ${refundPolicy}\n\nI'll now complete your cancellation. Done! I've created cancellation case ${finalCaseId} and the refund is being processed. You'll receive a confirmation email shortly. Thank you for booking with us.`;
            default:
                return "I'm sorry to hear that. To process your cancellation, could you please confirm your email address associated with the booking?";
        }
    }

    // Handle extension intent - UPDATED CONVERSATIONAL STYLE
    if (intent === 'extension') {
        switch (step) {
            case 'ask_arrival_departure':
                return "No problem! Let's update your return time. Are you planning to pick up the car later than your original time, or are you updating your arrival?";
            case 'ask_booking_id':
                return "Thank you. Please provide your booking ID.";
            case 'ask_time_change_type':
                return "Understood. Is this a late arrival, early arrival, late departure, or early departure?";
            case 'ask_new_details':
                return "Okay, please give me the new date and time, your flight's terminal (if available), and a contact number.";
            case 'ask_contact_details':
                return "Thank you. Finally, please provide your contact details so we can update you on the extension request.";
            case 'process_extension':
                const extensionCaseId = generateCaseId();
                return `Thank you! I've updated your details and created case ${extensionCaseId}. Please be aware: if you stay beyond your booked time, the provider may charge an additional fee. They typically handle this based on availability. You'll receive an updated confirmation email shortly. Safe travels!`;
            default:
                return "No problem! Let's update your return time. Are you planning to pick up the car later than your original time, or are you updating your arrival?";
        }
    }

    // Handle complaint intent - UPDATED CONVERSATIONAL STYLE
    if (intent === 'complaint') {
        switch (step) {
            case 'ask_complaint_type':
                return "I'm sorry to hear that you had an issue. To help me categorize your complaint, could you briefly explain what happened?";
            case 'ask_complaint_details':
                // Simulate AI analysis with conversational tone
                const complaintType = analyzeComplaint(state.collectedData?.complaintDetails || '');
                return `Thank you for explaining. Based on what you described, it sounds like a ${complaintType.toLowerCase()} complaint. Is that correct?`;
            case 'categorize_complaint':
                return "I apologize for the confusion. Please choose the correct category from: Car Damage, Staff Behavior, Late Pickup/Dropoff, Tickets & Penalties, or Other.";
            case 'confirm_category':
                return "Got it. Please describe what happened in more detail so I can better assist you.";
            case 'ask_contact_info':
                return "Thank you for the information. Could I have your booking ID and contact email? One of our representatives will review your case and contact you within 48 hours by email.";
            case 'process_complaint':
                const complaintCaseId = generateCaseId();
                const category = state.collectedData?.complaintType || 'General';
                return `Thank you. Your complaint has been recorded under '${category}'. We will forward this to the parking provider responsible for the lot; they are accountable for handling such incidents. We have logged this under case ${complaintCaseId}. You will hear from us within 48 hours by email. Again, I apologize for the inconvenience.`;
            default:
                return "I'm sorry to hear that you had an issue. To help me categorize your complaint, could you briefly explain what happened?";
        }
    }

    // Handle general booking inquiries - MORE CONVERSATIONAL
    if (msg.includes('book') || msg.includes('reserve') || msg.includes('parking')) {
        return "Hello! I'm ParkAssist, your parking assistant. I can help you find a spot across 74+ secure parking providers. All our providers are 100% verified. Which airport are you traveling from?";
    }

    // Handle cancellation inquiries - MORE CONVERSATIONAL
    if (msg.includes('cancel') || msg.includes('refund')) {
        return "I'm sorry to hear you need to cancel. I can help with that. To process your cancellation, could you please confirm your email address associated with the booking?";
    }

    // Handle extension inquiries - MORE CONVERSATIONAL
    if (msg.includes('extend') || msg.includes('longer') || msg.includes('more time') || msg.includes('stay longer')) {
        return "No problem! I can help you extend your parking stay. Let's update your return time. Are you planning to pick up the car later than your original time?";
    }

    // Handle complaint inquiries - MORE CONVERSATIONAL
    if (msg.includes('complaint') || msg.includes('issue') || msg.includes('problem') || msg.includes('damage') || msg.includes('late')) {
        return "I'm sorry to hear that you're experiencing an issue. To help me categorize your complaint, could you briefly explain what happened?";
    }

    // Default response - MORE CONVERSATIONAL
    return "Hello! I'm ParkAssist from Compare My Parkings. We compare 74+ secure parking providers across UK airports. How can I assist you with your parking needs today?";
}

// Helper function to generate case IDs - SIMPLIFIED
function generateCaseId() {
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return random;
}

// Helper function to analyze and categorize complaints - MATCHING EXAMPLE CATEGORIES
function analyzeComplaint(complaintText) {
    const text = complaintText.toLowerCase();
    
    if (text.includes('scratch') || text.includes('dent') || text.includes('damage') || text.includes('broken')) {
        return 'Car Damage';
    } else if (text.includes('rude') || text.includes('behavior') || text.includes('staff') || text.includes('attitude') || text.includes('driver')) {
        return 'Staff Behavior';
    } else if (text.includes('late') || text.includes('wait') || text.includes('delay') || text.includes('pickup') || text.includes('drop')) {
        return 'Late Pickup/Dropoff';
    } else if (text.includes('ticket') || text.includes('fine') || text.includes('penalty') || text.includes('charge')) {
        return 'Tickets & Penalties';
    } else {
        return 'Other';
    }
}

// GET endpoint for testing
export async function GET() {
    return NextResponse.json({ 
        status: 'AI Chat API is running',
        geminiConfigured: !!process.env.GEMINIAPI,
        timestamp: new Date().toISOString()
    });
}
