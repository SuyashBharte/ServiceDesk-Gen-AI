import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaCircle } from 'react-icons/fa';
import axios from '../api/axios';

const AIChatbot = ({ onTicketCreated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I am your real-time AI Helpdesk Assistant. I am now powered by Generative AI. How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 🧠 REAL AI INTEGRATION
    const getAIResponse = async (prompt, history) => {
        try {
            const { data } = await axios.post('/ai/chat', {
                prompt,
                chatHistory: history.slice(-5) // Send last 5 messages for context
            });
            return data.text;
        } catch (error) {
            console.error("AI Error:", error);
            const errMsg = error.response?.data?.message || "I'm having trouble connecting to my central brain.";
            return `⚠️ ${errMsg}`;
        }
    };

    // ⌨️ Streaming Effect (Simulating ChatGPT typing)
    const streamResponse = (fullText, originalPrompt) => {
        let currentText = "";
        const words = fullText.includes("CREATE_TICKET:")
            ? fullText.replace("CREATE_TICKET:", "📝 I've identified this as a ticket request. Creating it now...\n\n").split(" ")
            : fullText.split(" ");

        let i = 0;
        setMessages(prev => [...prev, { text: "", isBot: true, isStreaming: true }]);

        const interval = setInterval(async () => {
            if (i < words.length) {
                currentText += words[i] + " ";
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = currentText;
                    return newMessages;
                });
                i++;
            } else {
                setIsStreaming(false);
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].isStreaming = false;
                    return newMessages;
                });
                clearInterval(interval);

                // If AI decided to create a ticket (Case-insensitive check)
                const upperText = fullText.toUpperCase();
                if (upperText.includes("CREATE_TICKET:")) {
                    const ticketSummary = fullText.split(/CREATE_TICKET:/i)[1].trim();
                    try {
                        const { data: newTicket } = await axios.post('/tickets', {
                            title: ticketSummary,
                            description: `Raised via AI Chat: ${originalPrompt || 'User Request'}`
                        });

                        setMessages(prev => [...prev, {
                            text: `✅ Ticket Raised Successfully!\n🎫 Ticket ID: #${newTicket._id.substring(18)}\n⚡ Priority: ${newTicket.priority}\n📁 Category: ${newTicket.category}`,
                            isBot: true
                        }]);

                        // Trigger immediate refresh on dashboard
                        if (onTicketCreated) onTicketCreated();
                    } catch (e) {
                        console.error("Ticket creation error", e);
                        setMessages(prev => [...prev, { text: "⚠️ I tried to create a ticket but had a technical issue. Please try again or use the 'New Ticket' button.", isBot: true }]);
                    }
                }
            }
        }, 50);
    };

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return;

        const userMsg = input;
        setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
        setInput('');
        setIsStreaming(true);

        const aiResponse = await getAIResponse(userMsg, messages);

        // Pass the original user message to the streaming/ticket logic
        streamResponse(aiResponse, userMsg);
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            {isOpen ? (
                <div className="card animate-fade-in" style={{
                    width: '400px',
                    height: '550px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                        padding: '18px',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div className="flex items-center gap-3">
                            <div style={{ position: 'relative' }}>
                                <FaRobot size={24} />
                                <FaCircle color="#4ade80" size={8} style={{ position: 'absolute', bottom: 0, right: 0 }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold', lineHeight: 1.2 }}>ServiceDesk Gen-AI</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Powered by Google Gemini</div>
                            </div>
                        </div>
                        <FaTimes onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', opacity: 0.7 }} title="Close" />
                    </div>

                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: '#fdfdfd' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.isBot ? 'flex-start' : 'flex-end',
                                background: m.isBot ? '#ffffff' : '#6366f1',
                                color: m.isBot ? '#1e293b' : 'white',
                                padding: '12px 16px',
                                borderRadius: m.isBot ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
                                maxWidth: '85%',
                                fontSize: '0.95rem',
                                lineHeight: 1.5,
                                whiteSpace: 'pre-line',
                                boxShadow: m.isBot ? '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' : '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                                border: m.isBot ? '1px solid #e2e8f0' : 'none'
                            }}>
                                {m.text}
                                {m.isStreaming && <span className="animate-pulse" style={{ display: 'inline-block', width: '2px', height: '15px', background: '#6366f1', marginLeft: '2px', verticalAlign: 'middle' }}>|</span>}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', background: 'white' }}>
                        <input
                            className="input"
                            placeholder={isStreaming ? "AI is thinking..." : "Ask Gemini Anything..."}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            disabled={isStreaming}
                            style={{
                                height: '45px',
                                border: '1px solid #e2e8f0',
                                background: isStreaming ? '#f8fafc' : 'white',
                                color: '#0f172a',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                        />
                        <button
                            className={`btn ${isStreaming ? 'btn-ghost' : 'btn-primary'}`}
                            onClick={handleSend}
                            disabled={isStreaming}
                            style={{ width: '45px', height: '45px', padding: 0 }}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="btn btn-primary animate-bounce-slow"
                    style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <FaRobot size={32} />
                    <div style={{ position: 'absolute', top: 5, right: 5, width: '15px', height: '15px', background: '#4ade80', borderRadius: '50%', border: '3px solid #0f172a' }}></div>
                </button>
            )}
        </div>
    );
};

export default AIChatbot;
