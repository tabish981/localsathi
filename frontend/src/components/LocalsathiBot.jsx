import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";
import "./LocalsathiBot.css";
import { mumbaiPlaces } from "../data/localData";

const LocalsathiBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! Welcome to LocalSathi. I'm your local guide for Mumbai. What would you like to explore today?",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateLocalResponse = (query) => {
    const low = query.toLowerCase();
    
    // 1. Direct Name Match
    const place = mumbaiPlaces.find(p => low.includes(p.name.toLowerCase()));
    if (place) {
      return `**${place.name}**\n\n📌 Location: ${place.location} (${place.area})\n⏰ Timing: ${place.timing}\n💰 Entry: ${place.price}\n⭐ Rating: ${place.rating}\n\n${place.description}`;
    }

    // 2. Category Search
    if (low.includes("beach")) {
      const beaches = mumbaiPlaces.filter(p => p.type === "beach").map(p => p.name).join(", ");
      return `Mumbai has some beautiful beaches! You can visit: ${beaches}. Which one would you like to know more about?`;
    }
    if (low.includes("market") || low.includes("shop")) {
      const markets = mumbaiPlaces.filter(p => p.type === "market").map(p => p.name).join(", ");
      return `For shopping in Mumbai, I recommend: ${markets}.`;
    }
    if (low.includes("temple") || low.includes("religious")) {
      const spots = mumbaiPlaces.filter(p => ["temple", "religious"].includes(p.type)).map(p => p.name).join(", ");
      return `Spiritual spots in Mumbai include: ${spots}.`;
    }

    // 3. Location / Area Search
    if (low.includes("south mumbai") || low.includes("colaba") || low.includes("cst")) {
      const south = mumbaiPlaces.filter(p => p.area === "South Mumbai").map(p => p.name).join(", ");
      return `In South Mumbai, you can explore: ${south}.`;
    }

    // 4. Rating Search
    if (low.includes("top") || low.includes("best") || low.includes("popular")) {
      const top = [...mumbaiPlaces].sort((a,b) => b.rating - a.rating).slice(0, 5).map(p => p.name).join(", ");
      return `Here are the top-rated attractions in Mumbai: ${top}.`;
    }

    // 5. Help / Greeting
    if (low.includes("hi") || low.includes("hello") || low.includes("help")) {
      return "I can help you find beaches, markets, temples, or specific places in Mumbai. Just ask about a place like 'Marine Drive' or a category like 'beaches in South Mumbai'.";
    }

    return "I'm sorry, I couldn't find details for that specific request. You can ask about popular categories like Beaches, Markets, or top-rated attractions.";
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = {
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // 1. First, check local high-fidelity data
    const localReply = generateLocalResponse(userMsg.text);
    
    // If it's a specific place match or category list, show it instantly
    if (localReply && !localReply.startsWith("I'm sorry")) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: localReply,
          sender: "bot",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // 2. Otherwise, ask Gemini for general Mumbai knowledge
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text })
      });

      const data = await response.json();
      
      const botMsg = {
        text: data.reply || "I'm having trouble retrieving that information right now. Please try again or ask about a specific place like Marine Drive.",
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: !response.ok
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        text: "I am currently disconnected from my global knowledge base. However, I can still tell you about local beaches, markets, and temples in Mumbai! Just ask.",
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      text: "Chat cleared! Phirse shuru karein?",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div className="ls-bot-root">
      {/* FAB ICON */}
      <button 
        className={`ls-bot-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="ls-bot-window">
          <header className="ls-bot-header">
            <div className="ls-bot-title">
              <span className="ls-bot-dot"></span>
              <h3>LocalSathi AI</h3>
            </div>
            <button className="ls-bot-clear" onClick={clearChat} title="Clear Chat">
              <Trash2 size={18} />
            </button>
          </header>

          <main className="ls-bot-body" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`ls-message-row ${msg.sender}`}>
                <div className={`ls-message-bubble ${msg.isError ? 'error' : ''}`}>
                  {msg.text}
                  <span className="ls-message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="ls-message-row bot">
                <div className="ls-typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </main>

          <form className="ls-bot-footer" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask me anything about Mumbai..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim() || isTyping}>
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LocalsathiBot;
