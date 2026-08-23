import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageCircleQuestion, Send } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { api } from '../api';
import { Button } from '../components/ui';

interface ChatMsg {
  role: 'user' | 'assistant';
  text: string;
}

const QUICK_KEYS = ['supportQ1', 'supportQ2', 'supportQ3', 'supportQ4'] as const;

export function Support() {
  const { t, lang } = useI18n();
  const { goTo } = useStore();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', text: t('supportWelcome') }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || thinking) return;
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((list) => [...list, { role: 'user', text: clean }]);
    setInput('');
    setThinking(true);
    try {
      const res = await api.aiChat(clean, lang, history);
      setMessages((list) => [...list, { role: 'assistant', text: res.reply }]);
    } catch {
      setMessages((list) => [...list, { role: 'assistant', text: t('errNetwork') }]);
    } finally {
      setThinking(false);
    }
  };

  const talkToHuman = async () => {
    try {
      const last = [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';
      const res = await api.support(last, lang);
      window.open(res.whatsappUrl, '_blank', 'noopener');
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-xl py-6">
      <button
        onClick={() => goTo('hub')}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-600 hover:text-brand-700"
      >
        <ArrowLeft size={15} />
        {t('back')}
      </button>

      <div className="text-center">
        <h1 className="font-display text-2xl text-ink-900">{t('supportTitle')}</h1>
      </div>

      <div className="mt-6 flex min-h-[50vh] flex-col gap-3">
        <div className="flex flex-1 flex-col gap-3 py-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                m.role === 'user' ? 'self-end bg-brand-950 text-white' : 'self-start bg-ink-100 text-ink-800'
              }`}
            >
              {m.text}
            </div>
          ))}
          {thinking && (
            <div className="self-start rounded-2xl bg-ink-100 px-4 py-2.5 text-[12.5px] text-ink-500">
              {t('supportThinking')}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => send(t(k))}
                className="rounded-full bg-ink-100 px-3 py-1.5 text-[12px] font-medium text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {t(k)}
              </button>
            ))}
          </div>
        )}

        <div className="sticky bottom-4 flex items-center gap-2 rounded-full bg-ink-100 p-1.5 pl-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder={t('supportAsk')}
            className="h-9 flex-1 bg-transparent text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          <Button variant="primary" size="sm" className="!rounded-full" onClick={() => send(input)} disabled={!input.trim()}>
            <Send size={15} />
          </Button>
        </div>
        <button
          onClick={talkToHuman}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-forest-50 py-2.5 text-[12.5px] font-semibold text-forest-700 transition-colors hover:bg-forest-100"
        >
          <MessageCircleQuestion size={14} />
          {t('supportHuman')}
        </button>
      </div>
    </div>
  );
}
