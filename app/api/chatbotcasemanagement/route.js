// app/api/chatbotcasemanagement/route.js
import { createItem } from "@/lib/Database/Utils-db";

const TABLE_NAME = process.env.CHATBOT_CASES_TABLE || 'chatbot_cases';

export async function POST(request) {
    try {
        const caseData = await request.json();
        console.log('Creating case with data:', caseData);

        // Validate required fields
        if (!caseData.intent) {
            caseData.intent = 'general'; // Default intent
        }

        // Generate case number
        const caseNumber = generateCaseNumber(caseData.intent);
        
        // Enhanced case record
        const caseRecord = {
            caseNumber,
            intent: caseData.intent,
            priority: caseData.priority || 'medium',
            status: 'open',
            collectedData: caseData.collectedData || {},
            userMessage: caseData.userMessage || caseData.message || '',
            conversationState: caseData.conversationState || {},
            estimatedResponse: calculateResolutionTime(caseData.intent),
            assignedAgent: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolvedAt: null,
            resolutionNotes: '',
            customerEmail: caseData.customerEmail || '',
            customerPhone: caseData.customerPhone || '',
            bookingReference: caseData.collectedData?.bookingReference || '',
            airport: caseData.collectedData?.airport || '',
            travelDates: caseData.collectedData?.dates || '',
            caseType: getCaseType(caseData.intent)
        };

        console.log('Final case record:', caseRecord);

        // Save to database
        const createdCase = await createItem(TABLE_NAME, caseRecord);

        return new Response(JSON.stringify({
            success: true,
            caseNumber: createdCase.caseNumber,
            message: 'Case created successfully',
            estimatedResponse: createdCase.estimatedResponse,
            data: createdCase
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error creating chatbot case:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to create case',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Utility functions
function generateCaseNumber(intent) {
    const prefix = {
        'booking': 'BK',
        'cancellation': 'CAN',
        'travel_update': 'TU',
        'complaint': 'COMP',
        'general': 'GEN'
    }[intent] || 'CASE';
    
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

function calculateResolutionTime(intent) {
    const times = {
        'complaint': '48 hours',
        'travel_update': '6 hours',
        'cancellation': '24 hours',
        'booking': 'immediate',
        'general': '24 hours'
    };
    return times[intent] || '24 hours';
}

function getCaseType(intent) {
    const types = {
        'booking': 'Booking Inquiry',
        'cancellation': 'Cancellation Request',
        'travel_update': 'Travel Update',
        'complaint': 'Customer Complaint',
        'general': 'General Inquiry'
    };
    return types[intent] || 'General Inquiry';
}