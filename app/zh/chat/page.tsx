'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../auth/auth-context';
import { getSupabaseClient } from '../../../src/lib/supabase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Simple markdown-like renderer for chat
function renderChatContent(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let inList = false;
  let listItems: React.ReactNode[] = [];

  function flushList() {
    if (inList && listItems.length > 0) {
      nodes.push(
        <ul key={`ul-${key++}`} className="list-disc list-inside space-y-1 my-2 ml-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // List item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushList();
      inList = true;
      const text = trimmed.slice(2);
      listItems.push(
        <li key={key++} className="text-sm leading-relaxed">
          {renderInline(text)}
        </li>
      );
      continue;
    }

    flushList();

    // Bold
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      nodes.push(
        <p key={key++} className="text-sm leading-relaxed font-semibold">
          {renderInline(trimmed.slice(2, -2))}
        </p>
      );
      continue;
    }

    // Default paragraph
    nodes.push(
      <p key={key++} className="text-sm leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();
  return nodes;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-gold-primary font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Quick prompt suggestions
const SUGGESTIONS = [
  { icon: '📊', text: '如何解读我的八字命盘？', sub: '八字排盘入门' },
  { icon: '💼', text: '介绍一下十神（十神）', sub: '十神解析' },
  { icon: '🔮', text: '什么是日主（日主）？', sub: '日主概念' },
  { icon: '🏠', text: '家居风水建议', sub: '风水建议' },
  { icon: '⚡', text: '解释五行（五行）相生相克', sub: '五行相生相克' },
  { icon: '🎯', text: '如何提升运势？', sub: '改运方法' },
];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check server-side limit on mount with retry (session may not be ready yet)
  useEffect(() => {
    const checkLimit = async (retries = 3) => {
      try {
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session && retries > 0) {
          // Session not ready yet, wait and retry
          await new Promise(r => setTimeout(r, 500))
          return checkLimit(retries - 1)
        }

        const headers: Record<string, string> = {}
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
        const res = await fetch('/api/chat/limit', { headers })
        const data = await res.json()
        if (data.isPro) setIsPro(true)
        setRemaining(data.remaining)
      } catch (e) {
        console.error('Failed to check limit:', e)
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 1000))
          return checkLimit(retries - 1)
        }
      }
    };
    checkLimit();
  }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    // Server-side limit check
    if (!isPro) {
      try {
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        const headers: Record<string, string> = {}
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
        const res = await fetch('/api/chat/limit', { headers })
        const data = await res.json()
        if (!data.allowed) {
          setRemaining(0)
          setShowPayment(true)
          return
        }
        setRemaining(data.remaining)
      } catch (e) {
        console.error('Failed to check limit:', e)
      }
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Build conversation history (last 10 messages for context)
      const history = messages.slice(-10);
      const apiMessages = [...history, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Build headers — include auth token so the server can detect login/Pro status
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const session = await getSupabaseClient().auth.getSession();
      if (session?.data?.session?.access_token) {
        headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
      }

      const response = await fetch('/chat/api/completion', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      // Handle payment required
      if (data.error === 'need_payment') {
        setShowPayment(true);
        setLoading(false);
        return;
      }

      if (!data.success) {
        throw new Error(data.error || '获取回复失败');
      }

      // Consume limit on successful message
      if (!isPro) {
        try {
          const supabase = getSupabaseClient()
          const { data: { session } } = await supabase.auth.getSession()
          const headers: Record<string, string> = {}
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`
          }
          await fetch('/api/chat/limit', { method: 'POST', headers })
          setRemaining(prev => (prev !== null ? Math.max(0, prev - 1) : null))
        } catch (e) {
          console.error('Failed to consume limit:', e)
        }
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, isPro]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* ─── Chat Container ─── */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full pt-20 pb-6 px-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <div className="text-6xl mb-6">☯</div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-gold-primary mb-3">
                玄方大师（Master Yuanfang）
              </h1>
              <p className="text-text-secondary text-base mb-8 max-w-md">
                咨询八字（BaZi）、风水（Feng Shui）、易经（I Ching）或任何东方命理话题。
              </p>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="glass-card p-4 text-left hover:border-gold-primary/30 transition-all duration-300 group"
                    onClick={() => sendMessage(s.text)}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{s.icon}</span>
                      <div>
                        <div className="text-sm text-text-primary group-hover:text-gold-primary transition-colors">
                          {s.text}
                        </div>
                        <div className="text-xs text-text-tertiary mt-0.5">{s.sub}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message List */
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] ${
                    msg.role === 'user'
                      ? 'bg-gold-primary/15 border border-gold-primary/20'
                      : 'glass-card'
                  } rounded-2xl px-4 py-3`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">☯</span>
                        <span className="text-xs text-gold-primary font-medium">玄方大师</span>
                      </div>
                    )}
                    <div className="text-text-primary">
                      {renderChatContent(msg.content)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass-card rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gold-primary taiji-loader inline-block">☯</span>
                      <span className="text-text-tertiary text-sm">玄方大师正在思考...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm text-center">
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="glass-card p-3 rounded-2xl">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              className="flex-1 bg-transparent text-text-primary text-sm placeholder-text-tertiary resize-none outline-none min-h-[44px] max-h-[120px] py-2"
              placeholder="向玄方大师提问八字、风水、易经..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              type="button"
              className={`btn-primary text-sm px-5 py-2.5 flex-shrink-0 rounded-xl ${loading ? 'opacity-50' : ''}`}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="taiji-loader inline-block">☯</span>
                </span>
              ) : (
                '发送'
              )}
            </button>
          </div>
        </div>

        {/* Remaining messages indicator */}
        {!isPro && remaining !== null && (
          <p className="text-center text-text-tertiary text-xs mt-2">
            {remaining > 0
              ? `剩余 ${remaining} 条免费消息`
              : '免费额度已用完 · '}
            <Link href="/pricing" className="text-gold-primary hover:underline">
              {remaining > 0 ? '升级至Pro' : '升级至Pro'}
            </Link>
          </p>
        )}

        {/* Disclaimer */}
        <p className="text-center text-text-tertiary text-[10px] mt-3">
          AI生成内容仅供参考 · 仅供娱乐
        </p>
      </div>

      {/* ─── Payment Required Overlay ─── */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full p-8 relative page-enter border-gold-primary/30">
            {/* Close button */}
            <button
              onClick={() => setShowPayment(false)}
              className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors text-xl"
              aria-label="关闭">
              ✕
            </button>

            <div className="text-center">
              <div className="text-5xl mb-4">☯</div>
              <h2 className="font-display text-2xl font-bold text-gold-primary mb-2">
                想了解更多？升级至Pro继续
              </h2>
              <p className="text-text-secondary text-sm mb-6">
                您已用完免费消息。升级即可解锁与玄方大师（Master Yuanfang）的无限制AI命理咨询。
              </p>

              {/* Pro features */}
              <div className="text-left space-y-2 mb-8">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="text-gold-primary">✓</span>
                  <span>无限制AI深度解读</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="text-gold-primary">✓</span>
                  <span>完整命运书PDF</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="text-gold-primary">✓</span>
                  <span>大运与流年运势</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="text-gold-primary">✓</span>
                  <span>风水与合盘分析</span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="space-y-3">
                <Link href="/pricing" className="btn-primary w-full text-center py-3 block text-base">
                  查看方案与定价 →
                </Link>
                <Link
                  href="/payment?plan=pro"
                  className="block text-center text-gold-primary text-sm hover:underline">
                  每月$9.99获取Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}