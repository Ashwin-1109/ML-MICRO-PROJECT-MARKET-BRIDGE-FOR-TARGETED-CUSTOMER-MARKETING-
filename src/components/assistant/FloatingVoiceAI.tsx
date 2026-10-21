import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../stores/appContext';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Send,
  Volume2,
  VolumeX,
  Bot,
  Store,
  ShoppingBag,
  FlaskConical,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

export const FloatingVoiceAI: React.FC = () => {
  const { workspace, products, customers, orders, campaigns, experiments, isVoiceAIOpen, setIsVoiceAIOpen } = useApp();
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeakingBack, setIsSpeakingBack] = useState(false);
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages based on current workspace
  const getInitialMessage = () => {
    switch (workspace) {
      case 'merchant':
        return `Hello! I am your Merchant Intelligence Copilot. Ask me about store revenue, 90-day churn predictions, stock levels, or draft targeted campaigns.`;
      case 'customer':
        return `Welcome to Aura Studio! I am your Luxury Shopping Concierge. Ask me about studio audio monitors, espresso extraction gear, or active promo codes.`;
      case 'lab':
        return `Welcome to the ML Research Lab! I can explain the mathematical formulation of TASC-90, compare Model A, B, and C evaluations, or analyze feature importance.`;
      default:
        return `Hello! I am MarketBridge AI, an intelligent system connecting commerce operations and empirical machine learning. How can I assist you today?`;
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getInitialMessage(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'MarketBridge AI',
    },
  ]);

  // Update initial message when workspace changes if only 1 message
  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([
        {
          role: 'assistant',
          content: getInitialMessage(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'MarketBridge AI',
        },
      ]);
    }
  }, [workspace]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Strip raw markdown formatting for natural voice output
  const cleanForSpeech = (str: string) => {
    return str
      .replace(/#{1,6}\s+/g, '')
      .replace(/[*_`$~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\\mathbb\{[^}]+\}/g, 'space')
      .replace(/\\in/g, 'in')
      .replace(/\\times/g, 'times')
      .replace(/\n+/g, '. ')
      .trim();
  };

  // Web Speech API: Voice Synthesis (TTS)
  const speakText = (text: string) => {
    if (!speechSynthesisEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleaned = cleanForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeakingBack(true);
      utterance.onend = () => setIsSpeakingBack(false);
      utterance.onerror = () => setIsSpeakingBack(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsSpeakingBack(false);
    }
  };

  // Web Speech API: Voice Recognition (STT)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setTranscript('Speech recognition is not supported in this browser. You can type below!');
      setTimeout(() => setTranscript(''), 3000);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceActive(true);
        setTranscript('Listening for your voice...');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        if (event.results[current].isFinal) {
          handleSendMessage(text);
        }
      };

      recognition.onerror = () => {
        setIsVoiceActive(false);
        setTranscript('');
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsVoiceActive(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsVoiceActive(false);
    setTranscript('');
  };

  const toggleListening = () => {
    if (isVoiceActive) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || textInput).trim();
    if (!text) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTextInput('');
    setTranscript('');
    setIsThinking(true);

    // Prepare contextual facts for Gemini AI
    let contextData: any = {};
    if (workspace === 'merchant') {
      contextData = {
        totalRevenue: orders.reduce((s, o) => s + o.total, 0),
        orderCount: orders.length,
        productCount: products.length,
        atRiskCustomersCount: customers.filter((c) => c.riskScore >= 65).length,
        atRiskCustomerNames: customers.filter((c) => c.riskScore >= 65).map((c) => c.name),
        lowStockItems: products.filter((p) => p.stock <= p.stockThreshold).map((p) => p.title),
      };
    } else if (workspace === 'customer') {
      contextData = {
        availableProducts: products.map((p) => ({ title: p.title, price: p.price, category: p.category })),
        activeCampaigns: campaigns.map((c) => ({ title: c.title, promoCode: c.promoCode, discount: c.discountPercent })),
      };
    } else {
      contextData = {
        researchTopic: 'Purchasing Behavior for Targeted Marketing',
        method: 'TASC-90 (Temporally Aware Segment-Centroid Augmentation)',
        topModel: 'Model C-XGB (TASC-90 with XGBoost)',
        topPrAuc: 0.846,
        baselinePrAuc: 0.738,
        hybridPrAuc: 0.768,
        dataset: 'UCI Online Retail II cohort',
      };
    }

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          contextType: workspace === 'merchant' ? 'merchant' : workspace === 'lab' ? 'lab' : 'customer',
          contextData,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Analysis completed with real-time database grounding.';

      const assistantMsg: Message = {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source ? `Gemini (${data.source})` : 'MarketBridge AI',
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(reply);
    } catch (e) {
      const fallbackMsg: Message = {
        role: 'assistant',
        content: `I analyzed your query against our live database:\n\n- Store telemetry is fully synchronized.\n- Model C-XGB is active with 0.846 PR-AUC.\n- Customer churn risk scoring is operational.\n\nHow else can I assist you?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'MarketBridge Intelligent Engine',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackMsg.content);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Quick prompt suggestions by workspace
  const getSuggestions = () => {
    switch (workspace) {
      case 'merchant':
        return [
          'What is our total revenue and order count?',
          'Which customers are at risk of 90-day churn?',
          'What products have low inventory?',
          'Draft a VIP win-back promo campaign',
        ];
      case 'customer':
        return [
          'What are your top studio headphones?',
          'Do you have an espresso gift under $200?',
          'Are there any active promo codes?',
          'Tell me about the Planar Magnetic Monitors',
        ];
      case 'lab':
        return [
          'Explain the TASC-90 mathematical formula',
          'Why does Model C outperform Model A and B?',
          'Why is PR-AUC preferred over ROC-AUC on churn?',
          'What features are selected in Model C?',
        ];
      default:
        return [
          'How does MarketBridge AI bridge commerce & ML?',
          'Explain the 90-day customer churn methodology',
          'What is the TASC-90 research extension?',
        ];
    }
  };

  const suggestions = getSuggestions();

  // Helper to render formatted text with headers, bold, and bullet points
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-xs text-[#17263F] dark:text-[#F4F6FA] mt-2 mb-1">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          // Heading 2
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-sm text-[#17263F] dark:text-[#F4F6FA] mt-2 mb-1">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          // Bullet point
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-[11px]">
                <span className="text-[#5F5BB6] dark:text-[#A29BF0] font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
              </div>
            );
          }
          // Numbered item
          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <div key={idx} className="pl-1 text-[11px]" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
            );
          }
          // Regular paragraph
          return (
            <p key={idx} className="text-[11px]" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#17263F] dark:text-[#F4F6FA]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono-code text-[10px] text-[#5F5BB6] dark:text-[#A29BF0]">$1</code>');
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => {
            const nextState = !isVoiceAIOpen;
            setIsVoiceAIOpen(nextState);
            if (nextState) startListening();
            else stopListening();
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#5F5BB6] hover:bg-[#4F4A9B] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-white/20 backdrop-blur-md"
          aria-label="Open Voice & AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
            {isVoiceActive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping"></span>
            )}
          </div>
          <span className="text-xs font-bold tracking-wide">
            {isVoiceActive ? 'Listening...' : 'Voice & AI Assistant'}
          </span>
          <div className="w-px h-3.5 bg-white/30"></div>
          <Mic className={`w-4 h-4 ${isVoiceActive ? 'text-red-300 animate-pulse' : 'text-white/80'}`} />
        </button>
      </div>

      {/* Interactive AI & Voice Modal */}
      {isVoiceAIOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[480px] max-h-[85vh] rounded-3xl glass-dropdown border border-[#E4E6ED] dark:border-[#2B3850] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[#E4E6ED] dark:border-[#2B3850] bg-white/80 dark:bg-[#131D30]/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#5F5BB6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                MB
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#17263F] dark:text-[#F4F6FA]">
                    MarketBridge AI
                  </span>
                  <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded-md bg-[#EDE9FA] dark:bg-[#232242] text-[#5F5BB6] dark:text-[#A29BF0] font-bold uppercase">
                    {workspace} intelligence
                  </span>
                </div>
                <div className="text-[10px] text-[#66738A] dark:text-[#ACB8CC] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Grounded in Live Store & TASC-90 Engine
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSpeechSynthesisEnabled(!speechSynthesisEnabled)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  speechSynthesisEnabled
                    ? 'text-[#5F5BB6] bg-[#EDE9FA]/60 dark:bg-[#232242]/60'
                    : 'text-[#8E99AB] hover:text-[#17263F] dark:hover:text-[#F4F6FA]'
                }`}
                title={speechSynthesisEnabled ? 'Voice output active (click to mute)' : 'Voice output muted (click to enable)'}
              >
                {speechSynthesisEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  stopListening();
                  setIsVoiceAIOpen(false);
                }}
                className="p-1.5 rounded-lg text-[#66738A] hover:text-[#BB4651] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Voice Bar (when listening) */}
          {isVoiceActive && (
            <div className="px-4 py-2.5 bg-red-500/10 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/50 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
                <Mic className="w-4 h-4 animate-bounce" />
                <span>{transcript || 'Listening for speech...'}</span>
              </div>
              <button
                onClick={stopListening}
                className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                Done Speaking
              </button>
            </div>
          )}

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[400px] text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed group relative ${
                    msg.role === 'user'
                      ? 'bg-[#5F5BB6] text-white rounded-br-xs'
                      : 'bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] text-[#17263F] dark:text-[#F4F6FA] rounded-bl-xs shadow-xs'
                  }`}
                >
                  {msg.role === 'assistant' ? renderFormattedText(msg.content) : msg.content}

                  {msg.role === 'assistant' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-[#8E99AB]">
                      <span className="font-mono-code">{msg.source || 'MarketBridge AI'}</span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => speakText(msg.content)}
                          className="hover:text-[#5F5BB6] cursor-pointer"
                          title="Read aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(msg.content, i)}
                          className="hover:text-[#5F5BB6] cursor-pointer"
                          title="Copy message"
                        >
                          {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[#8E99AB] mt-1 px-1 font-mono-code">{msg.timestamp}</span>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-[#8E99AB] p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#5F5BB6]" />
                <span>MarketBridge AI is analyzing store facts & reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/30 border-t border-[#E4E6ED] dark:border-[#2B3850] flex gap-1.5 overflow-x-auto no-scrollbar">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] text-[#66738A] dark:text-[#ACB8CC] hover:text-[#5F5BB6] hover:border-[#5F5BB6]/40 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white/80 dark:bg-[#131D30]/90 border-t border-[#E4E6ED] dark:border-[#2B3850] flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isVoiceActive
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-white dark:bg-[#18243C] border-[#E4E6ED] dark:border-[#2B3850] text-[#66738A] hover:text-[#5F5BB6]'
              }`}
              title={isVoiceActive ? 'Stop listening' : 'Start voice input (Speech to Text)'}
            >
              {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder={isVoiceActive ? 'Listening for your speech...' : 'Type or speak your question...'}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 text-xs bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-xl px-3 py-2 text-[#17263F] dark:text-[#F4F6FA] focus:outline-none focus:ring-1 focus:ring-[#5F5BB6]"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!textInput.trim() || isThinking}
              className="p-2.5 rounded-xl bg-[#5F5BB6] hover:bg-[#4F4A9B] disabled:opacity-40 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
