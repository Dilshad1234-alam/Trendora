"use client";

import { useState } from "react";
import { Bot, X, Sparkles, Send } from "lucide-react";

export default function AgencyAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Agency AI Assistant. How can I help you today? I can generate proposals, summarize projects, or create marketing strategies." }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Placeholder for future API integration
      // const res = await fetch("/api/agency/assistant", { method: "POST", body: JSON.stringify({ message: userMessage }) });
      
      // Simulated response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "I've received your request to: '" + userMessage + "'. This feature is currently in development and will be fully available in the next update!" 
        }]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-violet-700 text-white shadow-xl shadow-violet-300 transition hover:-translate-y-1 hover:bg-violet-800 ${isOpen ? "hidden" : "flex"}`}
      >
        <Bot size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-full max-w-[380px] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-200/50">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-violet-700 to-indigo-700 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Agency AI Assistant</h3>
                <p className="text-[10px] text-violet-200">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 bg-zinc-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-violet-700 text-white rounded-br-sm" 
                    : "bg-white border border-zinc-200 text-zinc-700 rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-zinc-200 px-4 py-3 text-sm flex gap-1">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-zinc-100 bg-white p-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-700 text-white transition hover:bg-violet-800 disabled:opacity-50 disabled:hover:bg-violet-700"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
