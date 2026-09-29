import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  BookOpen,
  Code2,
  HelpCircle,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { User, ChatMessage } from '../types';
import { api } from '../api';

interface TutorViewProps {
  user: User | null;
}

export const TutorView: React.FC<TutorViewProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Greetings, ${user?.name || 'Student'}! I am **NEXUS AI Tutor**, your dedicated academic learning companion.\n\nI can assist you with:\n- Deep conceptual explanations & intuitive analogies\n- Step-by-step math and algorithm derivations\n- Programming problem-solving and code review\n- Exam revision strategies & active recall\n\nWhat topic are you studying today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const starterPrompts = [
    'Explain Breadth-First Search (BFS) vs Depth-First Search (DFS) with a code example',
    'Explain the ACID transaction properties in Database Systems',
    'How does the TCP 3-way handshake establish a reliable connection?',
    'Give me a 5-step revision plan for an upcoming exam',
    'Explain Virtual Memory and the Clock page replacement algorithm',
  ];

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = (customMessage || inputValue).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) {
      setInputValue('');
    }
    setIsTyping(true);

    try {
      const response = await api.sendChatMessage(textToSend, messages);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'I encountered a temporary connection issue. Please verify your connection or try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'ai',
        text: `Chat history cleared. What topic or concept would you like to review next, ${user?.name || 'Student'}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Simple clean markdown parser for chat bubbles
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code_${index}`} className="my-2 p-3 text-xs bg-[#241c06] rounded border border-slate-300/30 overflow-x-auto text-amber-200">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(<h4 key={index} className="text-sm font-bold text-amber-300 mt-2 mb-1">{line.replace('### ', '')}</h4>);
      } else if (line.startsWith('## ')) {
        elements.push(<h3 key={index} className="text-base font-bold text-amber-200 mt-2.5 mb-1">{line.replace('## ', '')}</h3>);
      } else if (line.startsWith('# ')) {
        elements.push(<h2 key={index} className="text-lg font-bold text-slate-100 mt-3 mb-1">{line.replace('# ', '')}</h2>);
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().replace(/^[-*]\s+/, '');
        elements.push(
          <div key={index} className="flex items-start gap-2 ml-2 my-0.5 text-xs sm:text-sm">
            <span className="text-amber-300 font-bold">•</span>
            <span>{renderInlineBold(bulletText)}</span>
          </div>
        );
      } else if (/^\d+\.\s/.test(line.trim())) {
        elements.push(
          <div key={index} className="ml-2 my-0.5 text-xs sm:text-sm">
            {renderInlineBold(line.trim())}
          </div>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-1.5" />);
      } else {
        elements.push(
          <p key={index} className="my-0.5 text-xs sm:text-sm leading-relaxed">
            {renderInlineBold(line)}
          </p>
        );
      }
    });

    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <pre key="code_end" className="my-2 p-3 text-xs bg-[#241c06] rounded border border-slate-300/30 overflow-x-auto text-amber-200">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 text-[11px] bg-[#382b0b] rounded text-amber-200 border border-slate-300/20">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="bg-[#4d3c12] border border-slate-300/30 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#5e4914] border border-amber-300/50 flex items-center justify-center text-amber-300 shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 font-serif">NEXUS AI Tutor</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                Online & Ready
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Personalized academic assistance, concept breakdowns & revision guidance
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-[#40310c] hover:bg-[#523f11] border border-slate-300/30 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          title="Start fresh conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Starter Prompt Chips */}
      <div className="bg-[#48370f] border border-slate-300/20 rounded-xl p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Quick Topic Starters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isTyping}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-[#574413] hover:bg-[#685217] text-slate-200 border border-slate-300/30 hover:border-slate-300/60 transition-all cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-[#523f11] border border-slate-300/30 rounded-xl shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Chat message area with exact id="chat-messages" */}
        <div
          id="chat-messages"
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4"
        >
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border ${
                    isAi
                      ? 'bg-[#5e4914] text-amber-300 border-amber-300/50'
                      : 'bg-[#40310c] text-slate-100 border-slate-300/40'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-xl p-4 text-slate-100 border relative group ${
                    isAi
                      ? 'bg-[#45350e] border-slate-300/30 text-slate-200'
                      : 'bg-[#5e4914] border-slate-300/40 text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {isAi ? 'NEXUS AI Tutor' : user?.name || 'You'}
                    </span>
                    <span className="text-[10px]">{msg.timestamp}</span>
                  </div>

                  <div className="text-slate-100">{renderFormattedText(msg.text)}</div>

                  {/* Copy Button */}
                  {isAi && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2 right-2 p-1 rounded bg-[#382b0b] text-slate-400 hover:text-slate-200 border border-slate-300/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator with exact id="chat-typing" */}
          {isTyping && (
            <div
              id="chat-typing"
              className="flex items-center gap-3 mr-auto"
            >
              <div className="w-8 h-8 rounded-lg bg-[#5e4914] border border-amber-300/50 flex items-center justify-center text-amber-300">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#45350e] border border-slate-300/30 rounded-xl px-4 py-3 flex items-center gap-1.5 text-xs text-slate-300">
                <span>NEXUS AI is formulating response</span>
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-100">●</span>
                <span className="animate-pulse delay-200">●</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form with exact id="chat-form" */}
        <div className="p-3 sm:p-4 bg-[#46360e] border-t border-slate-300/30">
          <form id="chat-form" onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything (e.g. 'Explain Big O time complexity', 'Debug this concept')..."
              disabled={isTyping}
              className="flex-1 bg-[#362a0a] border border-slate-300/40 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#614d16] hover:bg-[#735b1b] text-slate-100 border border-slate-300/40 font-semibold text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="mt-2 text-[11px] text-slate-400 text-center">
            NEXUS AI references your stored Knowledge Vault notes to provide relevant contextual answers.
          </div>
        </div>
      </div>
    </div>
  );
};
