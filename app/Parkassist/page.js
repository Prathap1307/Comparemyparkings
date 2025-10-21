'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Clock, AlertTriangle, User, Shield, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ParkAssist() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm ParkAssist, your AI parking assistant from Compare My Parkings. We compare 74+ secure parking providers across UK airports. How can I help you with your parking needs today?",
            sender: 'bot',
            timestamp: new Date(),
            type: 'greeting'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [caseCreated, setCaseCreated] = useState(false);
    const [caseNumber, setCaseNumber] = useState('');
    const [escalated, setEscalated] = useState(false);
    const [conversationState, setConversationState] = useState({
        step: 'initial',
        collectedData: {},
        intent: null
    });
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Enhanced intent analysis
    const analyzeMessagePriority = (message) => {
        const msg = message.toLowerCase();
        
        if (msg.includes('complaint') || msg.includes('issue') || msg.includes('problem') || msg.includes('not working')) {
            return { priority: 'high', type: 'complaint', responseTime: '48 hours' };
        }
        if (msg.includes('departure') || msg.includes('arrival') || msg.includes('flight') || msg.includes('travel')) {
            const isUrgent = checkTravelUrgency(msg);
            return { 
                priority: isUrgent ? 'urgent' : 'high', 
                type: 'travel_update', 
                responseTime: isUrgent ? '2 hours' : '6 hours' 
            };
        }
        if (msg.includes('cancel') || msg.includes('refund')) {
            return { priority: 'medium', type: 'cancellation', responseTime: '24 hours' };
        }
        if (msg.includes('book') || msg.includes('reserve')) {
            return { priority: 'medium', type: 'booking', responseTime: '12 hours' };
        }
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
            return { priority: 'low', type: 'greeting', responseTime: 'immediate' };
        }
        if (msg.includes('how are you')) {
            return { priority: 'low', type: 'casual', responseTime: 'immediate' };
        }
        
        return { priority: 'low', type: 'general', responseTime: '24 hours' };
    };

    const checkTravelUrgency = (message) => {
        if (message.includes('today') || message.includes('tomorrow') || message.match(/\b\d{1,2}\/\d{1,2}\b/)) {
            return true;
        }
        return false;
    };

    // Enhanced conversation flow handler
    const handleConversationFlow = (userMessage, currentState) => {
        const msg = userMessage.toLowerCase();
        let newState = { ...currentState };

        // Reset if new intent detected
        if (newState.step === 'complete' || isNewIntent(msg, newState.intent)) {
            newState = {
                step: 'initial',
                collectedData: {},
                intent: null
            };
        }

        // Detect primary intent
        if (!newState.intent) {
            if (msg.includes('book') || msg.includes('reserve')) {
                newState.intent = 'booking';
                newState.step = 'ask_airport';
            } else if (msg.includes('cancel') || msg.includes('refund')) {
                newState.intent = 'cancellation';
                newState.step = 'ask_booking_reference';
            } else if (msg.includes('update') || msg.includes('change') || msg.includes('departure') || msg.includes('arrival')) {
                newState.intent = 'travel_update';
                newState.step = 'ask_booking_reference';
            } else if (msg.includes('complaint') || msg.includes('issue')) {
                newState.intent = 'complaint';
                newState.step = 'ask_complaint_details';
            } else if (msg.includes('hello') || msg.includes('hi')) {
                newState.intent = 'greeting';
                newState.step = 'greeting_response';
            } else if (msg.includes('how are you')) {
                newState.intent = 'casual';
                newState.step = 'casual_response';
            } else {
                newState.intent = 'general';
                newState.step = 'general_response';
            }
            return newState;
        }

        // Continue existing conversation
        return continueConversationFlow(msg, newState);
    };

    const isNewIntent = (message, currentIntent) => {
        const intents = ['book', 'cancel', 'update', 'complaint', 'hello', 'hi'];
        return intents.some(intent => message.includes(intent)) && 
               !message.includes('yes') && 
               !message.includes('no') &&
               !message.includes('ok');
    };

    const continueConversationFlow = (message, state) => {
        switch (state.intent) {
            case 'cancellation':
                return handleCancellationFlow(message, state);
            case 'booking':
                return handleBookingFlow(message, state);
            case 'travel_update':
                return handleTravelUpdateFlow(message, state);
            case 'complaint':
                return handleComplaintFlow(message, state);
            default:
                return state;
        }
    };

    const handleCancellationFlow = (message, state) => {
        if (state.step === 'ask_booking_reference' && message.length > 3) {
            state.collectedData.bookingReference = message;
            state.step = 'ask_booking_date';
            return state;
        }
        if (state.step === 'ask_booking_date' && message.length > 5) {
            state.collectedData.bookingDate = message;
            state.step = 'explain_cancellation_policy';
            return state;
        }
        if (state.step === 'explain_cancellation_policy' && (message.includes('yes') || message.includes('proceed'))) {
            state.step = 'create_cancellation_case';
            return state;
        }
        return state;
    };

    const handleBookingFlow = (message, state) => {
        if (state.step === 'ask_airport' && message.length > 2) {
            state.collectedData.airport = message;
            state.step = 'ask_dates';
            return state;
        }
        if (state.step === 'ask_dates' && message.length > 5) {
            state.collectedData.dates = message;
            state.step = 'provide_booking_link';
            return state;
        }
        return state;
    };

    const handleTravelUpdateFlow = (message, state) => {
        if (state.step === 'ask_booking_reference' && message.length > 5) {
            state.collectedData.bookingReference = message;
            state.step = 'ask_update_type';
            return state;
        }
        if (state.step === 'ask_update_type' && (message.includes('departure') || message.includes('arrival'))) {
            state.collectedData.updateType = message.includes('departure') ? 'departure' : 'arrival';
            state.step = 'ask_new_date';
            return state;
        }
        if (state.step === 'ask_new_date' && message.length > 5) {
            state.collectedData.newDate = message;
            state.step = 'create_travel_update_case';
            return state;
        }
        return state;
    };

    const handleComplaintFlow = (message, state) => {
        if (state.step === 'ask_complaint_details' && message.length > 10) {
            state.collectedData.complaintDetails = message;
            state.step = 'ask_booking_reference_complaint';
            return state;
        }
        if (state.step === 'ask_booking_reference_complaint' && message.length > 5) {
            state.collectedData.bookingReference = message;
            state.step = 'create_complaint_case';
            return state;
        }
        return state;
    };

    const getFallbackResponse = (userMessage, state) => {
        const msg = userMessage.toLowerCase();
        const intent = state.intent;
        const step = state.step;

        // Handle greeting and casual conversation
        if (intent === 'greeting') {
            return "Hello! I'm ParkAssist from Compare My Parkings. We compare 74+ secure parking providers across UK airports. How can I help you with your parking needs today?";
        }

        if (intent === 'casual') {
            return "I'm doing great, thank you for asking! Ready to help you find the perfect secure parking solution. What can I assist you with today?";
        }

        // Handle cancellation flow
        if (intent === 'cancellation') {
            switch (step) {
                case 'ask_booking_reference':
                    return "I'd be happy to help with your cancellation. Could you please provide your booking reference number?";
                case 'ask_booking_date':
                    return "Thank you. What was your original booking date and time?";
                case 'explain_cancellation_policy':
                    return `I understand you want to cancel booking ${state.collectedData.bookingReference}. 

Here's our cancellation policy:
• Free cancellation up to 24 hours before booking
• Cancellations within 24 hours may incur charges
• Requests must be made in writing to cancellations@comparemyparkings.co.uk

Would you like me to proceed with your cancellation request?`;
                case 'create_cancellation_case':
                    return `Perfect! I'm creating your cancellation case now. Please email cancellations@comparemyparkings.co.uk with your booking reference ${state.collectedData.bookingReference} and our team will process your request within 24 hours.`;
                default:
                    return "I'd be happy to help with your cancellation. Could you please provide your booking reference number?";
            }
        }

        // Handle booking flow
        if (intent === 'booking') {
            switch (step) {
                case 'ask_airport':
                    return "Great! I can help you compare parking options across 74+ secure providers. Which airport do you need parking at?";
                case 'ask_dates':
                    return `Perfect for ${state.collectedData.airport} airport! What are your travel dates (arrival and departure)?`;
                case 'provide_booking_link':
                    return `Excellent! For ${state.collectedData.airport} on ${state.collectedData.dates}, visit comparemyparkings.co.uk to compare real-time prices across 74+ secure parking providers and make your booking. You'll find the best deals for your specific dates!`;
                default:
                    return "I'd be happy to help you book parking! Which airport do you need parking at?";
            }
        }

        // Handle general responses
        if (msg.includes('secure') || msg.includes('safe')) {
            return "All our partner parking companies are 100% secured and thoroughly vetted. We only work with trusted providers who meet our security standards. Your vehicle's safety is our top priority!";
        }

        return "Thank you for your message. At Compare My Parkings, we compare 74+ secure parking providers across UK airports. How can I assist you with your parking needs today?";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            text: inputMessage,
            sender: 'user',
            timestamp: new Date(),
            type: 'user_query'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Update conversation state
        const newConversationState = handleConversationFlow(inputMessage, conversationState);
        setConversationState(newConversationState);

        // Analyze message priority
        const analysis = analyzeMessagePriority(inputMessage);

        // Simulate AI processing with enhanced fallback
        setTimeout(async () => {
            let botResponse;

            try {
                // Try AI API first
                const response = await fetch('/api/chat/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: inputMessage,
                        context: {
                            company: 'Compare My Parkings',
                            caseNumber: caseNumber,
                            priority: analysis.priority, // FIXED: analysis is now defined
                            type: analysis.type,
                            website: 'https://www.comparemyparkings.co.uk'
                        },
                        conversationState: newConversationState,
                        conversationId: 'user-' + Date.now()
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    botResponse = result.response;
                } else {
                    throw new Error('API failed');
                }
            } catch (error) {
                // Use enhanced fallback
                botResponse = getFallbackResponse(inputMessage, newConversationState);
            }

            // Create case if needed
            if (newConversationState.step.includes('create_') && !caseCreated) {
                try {
                    const caseResponse = await fetch('/api/chatbotcasemanagement', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            intent: newConversationState.intent,
                            collectedData: newConversationState.collectedData,
                            userMessage: inputMessage,
                            priority: analysis.priority,
                            conversationState: newConversationState
                        })
                    });

                    const caseResult = await caseResponse.json();
                    if (caseResult.success) {
                        setCaseNumber(caseResult.caseNumber);
                        setCaseCreated(true);
                        botResponse += `\n\n📋 Case Created: ${caseResult.caseNumber}`;
                    }
                } catch (caseError) {
                    console.error('Case creation failed:', caseError);
                }
            }

            const botMessage = {
                id: messages.length + 2,
                text: botResponse,
                sender: 'bot',
                timestamp: new Date(),
                type: newConversationState.intent,
                priority: analysis.priority
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);

        }, 1500);
    };

    const handleHumanSupport = () => {
        setInputMessage("I would like to speak with a human support agent");
        setTimeout(() => {
            handleSendMessage({ preventDefault: () => {} });
        }, 100);
    };

    const quickActions = [
        { label: "📋 Make Booking", query: "I want to book parking" },
        { label: "🔄 Cancel Booking", query: "I need to cancel my reservation" },
        { label: "📝 Update Travel", query: "Update my departure/arrival details" },
        { label: "⚠️ File Complaint", query: "I have a complaint about service" },
        { label: "💰 Pricing Info", query: "What are your parking rates?" },
        { label: "📄 Terms & Conditions", query: "Show me terms and conditions" }
    ];

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-grow py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Page Header */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                    <Send className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-800">ParkAssist AI</h1>
                                    <p className="text-gray-600">Compare My Parkings</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                Intelligent parking assistance with case management and priority support
                            </p>
                        </div>

                        {/* Case Status Banner */}
                        {caseCreated && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText className="w-5 h-5 text-blue-600 mr-2" />
                                        <span className="font-semibold text-blue-800">
                                            Case: {caseNumber}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <button 
                                            onClick={handleHumanSupport}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            Request Human Agent
                                        </button>
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                                            <Shield className="w-4 h-4 mr-1" />
                                            Privacy Policy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chat Container */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Chat Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                                            <Send className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">ParkAssist AI Support</h2>
                                            <p className="text-blue-100 text-sm">Case Management Enabled • Priority Routing</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-300 text-sm font-medium">● Online</div>
                                        <div className="text-blue-200 text-xs">AI + Human Support</div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="h-96 overflow-y-auto p-6 bg-gray-50">
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                                    message.sender === 'user'
                                                        ? 'bg-blue-600 text-white rounded-br-none'
                                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                                <p className={`text-xs mt-1 ${
                                                    message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                                                }`}>
                                                    {formatTime(message.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    </div>
                                                    <span className="text-gray-500 text-sm">Thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="border-t border-gray-200 p-4 bg-white">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setInputMessage(action.query)}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center"
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-gray-200 p-4 bg-white">
                                <form onSubmit={handleSendMessage} className="flex space-x-4">
                                    <div className="flex-grow relative">
                                        <input
                                            type="text"
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            placeholder="Describe your parking inquiry..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-black"
                                            disabled={isTyping}
                                        />
                                        {escalated && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!inputMessage.trim() || isTyping}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-medium transition-colors duration-200 flex items-center"
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Business Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                            <div className="bg-white p-4 rounded-lg shadow-md text-center">
                                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Case Management</h3>
                                <p className="text-gray-600 text-xs">Automated ticket creation & tracking</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-md text-center">
                                <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Priority Routing</h3>
                                <p className="text-gray-600 text-xs">Smart escalation to human agents</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-md text-center">
                                <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Live Support</h3>
                                <p className="text-gray-600 text-xs">Seamless human agent handoff</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-md text-center">
                                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Compliance Ready</h3>
                                <p className="text-gray-600 text-xs">GDPR & data protection compliant</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}