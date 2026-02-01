const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🧠 Fallback Logic (Local Intelligence) - Enhanced
const getLocalIntelligence = (prompt) => {
    const p = prompt.toLowerCase();

    // Auto-detect problem (Stricter matching for ticket creation)
    if (p.match(/broken|leak|not working|fix|issue|problem|failed|error|stopped|down|help me|damaged/)) {
        return "CREATE_TICKET: " + prompt;
    }

    if (p.includes('status')) {
        return "I'm currently running in Local Mode. I found your request for status—please check the 'Tickets' tab for real-time updates on your requests.";
    }
    if (p.includes('performance') || p.includes('analytic')) {
        return "System Analytics show that our response efficiency is at 94%. We're seeing great results in IT Support, but Maintenance could use more focus.";
    }

    return "I am your ServiceDesk Assistant. You can report issues (e.g., 'My keyboard is broken') or ask about the system features. How can I help you today?";
};

const chatWithAI = async (req, res) => {
    const { prompt, chatHistory } = req.body;
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // If key is missing or dummy
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.length < 20) {
        return res.json({ text: getLocalIntelligence(prompt) + "\n\n(Note: Using Local AI Mode)" });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const historyString = chatHistory
            .slice(-4)
            .map(h => `${h.isBot ? 'AI' : 'User'}: ${h.text}`)
            .join('\n');

        const systemPrompt = `You are ServiceDesk AI, a professional support assistant.
        
        CRITICAL RULE:
        - If the user is reporting a PROBLEM, BUG, or requesting a FIX, you MUST start your response with exactly "CREATE_TICKET: " followed by a clear, short summary of the issue.
        - Example: "CREATE_TICKET: User reporting broken office chair"
        - If it's a general question or greeting, just answer normally.
        - DO NOT explain this rule to the user.
        
        History:
        ${historyString}
        
        Current User Message: ${prompt}
        Response:`;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();

        res.json({ text: responseText });
    } catch (error) {
        console.error("Gemini Error, falling back...", error.message);
        res.json({ text: getLocalIntelligence(prompt) });
    }
};

module.exports = { chatWithAI };
