import React, { useState, useEffect, useRef } from "react";
import "./LocalBot.css";
import { MessageCircle, X, Trash2 } from "lucide-react";
import { mumbaiPlaces } from "../data/localData";

const LocalBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastPlace, setLastPlace] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const chatBodyRef = useRef(null);

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = "Hello";

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    setMessages([
      {
        text: `${greeting}. I'm LocalBot. How can I help you explore Mumbai?`,
        sender: "bot",
        time: getTime()
      }
    ]);

    setSuggestions([
      "Top rated places",
      "Free places",
      "1 day itinerary",
      "Best beaches"
    ]);
  }, []);

  // Proper Auto Scroll
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop =
        chatBodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleSend = async (customText) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      { text: textToSend, sender: "user", time: getTime() }
    ]);

    setInput("");
    setTyping(true);

    try {
      // 1. Check local data first for high-fidelity info (Maps links, etc)
      const localResponse = getLocalInfo(textToSend);
      
      // 2. Fetch from Gemini API via Backend
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();

      if (response.ok) {
        const botReply = localResponse ? { ...localResponse, text: localResponse.text } : { text: data.reply };

        if (!localResponse) {
          setSuggestions(["Top rated places", "Best beaches", "Local food", "1 day itinerary"]);
        }

        setMessages((prev) => [
          ...prev,
          { ...botReply, sender: "bot", time: getTime() }
        ]);
      } else {
        // Show specific backend error message
        setMessages((prev) => [
          ...prev,
          { text: data.reply || "Arey bhai, server issue aa gaya!", sender: "bot", time: getTime(), isError: true }
        ]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Server se connect nahi ho raha bhai (Network Error)!", sender: "bot", time: getTime(), isError: true }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const getLocalInfo = (query) => {
    const lower = query.toLowerCase();
    const place = mumbaiPlaces.find((p) => lower.includes(p.name.toLowerCase()));

    if (place) {
      setLastPlace(place);
      setSuggestions([
        `${place.name} timing`,
        `${place.name} entry fee`,
        `Best time to visit ${place.name}`,
        "Nearby places"
      ]);

      return {
        text: `${place.name}
Location: ${place.location} (${place.area})
Rating: ${place.rating}
Best Time: ${place.bestTime}
Timing: ${place.timing}
Entry: ${place.price}

${place.description}`,
        mapsLink: place.mapsLink
      };
    }

    // Specific local categories (maintained as quick functions)
    if (lower.includes("beach")) {
       const beaches = mumbaiPlaces.filter((p) => p.type === "beach");
       return { text: "Beaches in Mumbai:\n\n" + beaches.map((p) => p.name).join("\n") };
    }
    
    // If no specific match, return null to let Gemini handle it
    return null;
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chat-window">
          <div className="chat-header">
            <span>LocalBot</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <Trash2 size={16} onClick={clearChat} style={{ cursor: "pointer" }} />
              <X size={18} onClick={() => setIsOpen(false)} style={{ cursor: "pointer" }} />
            </div>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender} ${msg.isError ? "isError" : ""}`}>
                {msg.text}

                {msg.mapsLink && (
                  <a
                    href={msg.mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="maps-link"
                  >
                    Open in Google Maps
                  </a>
                )}

                <div className="time">{msg.time}</div>
              </div>
            ))}

            {typing && (
              <div className="chat-message bot typing">
                LocalBot is typing...
              </div>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="suggestions-container">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-btn"
                  onClick={() => handleSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="chat-footer">
            <input
              type="text"
              placeholder="Ask about Mumbai..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={() => handleSend()}>Send</button>
          </div>
        </div>
      ) : (
        <div className="chat-icon" onClick={() => setIsOpen(true)}>
          <MessageCircle size={26} />
        </div>
      )}
    </div>
  );
};

export default LocalBot;