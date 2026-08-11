import { useEffect, useRef, useState } from 'react';
import { MessageCircleQuestion, Send } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useStore } from '../../store';
import { api } from '../../api';
import { Button, Modal } from '../ui';

interface ChatMsg {
  role: 'user' | 'assistant';
  text: string;
}

const QUICK_KEYS = ['supportQ1', 'supportQ2', 'supportQ3', 'supportQ4'] as const;

export function SupportPanel() {
  const { t, lang } = useI18n();
  const { supportOpen, setSupportOpen } = useStore();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (supportOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', text: t('supportWelcome') }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supportOpen]);

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
    <Modal open={supportOpen} onClose={() => setSupportOpen(false)} title={t('supportTitle')} size="md">
      <div className="flex max-h-[50vh] min-h-[220px] flex-col gap-2.5 overflow-y-auto pb-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
              m.role === 'user' ? 'self-end bg-brand-950 text-white' : 'self-start bg-ink-100 text-ink-800'
            }`}
          >
            {m.text}
          </div>
        ))}
        {thinking && (
          <div className="self-start rounded-2xl bg-ink-100 px-3.5 py-2.5 text-[12.5px] text-ink-500">
            {t('supportThinking')}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {QUICK_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => send(t(k))}
              className="rounded-full border border-ink-200 px-2.5 py-1 text-[11.5px] font-medium text-ink-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {t(k)}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder={t('supportAsk')}
          className="h-11 flex-1 rounded-xl border border-ink-200 bg-white dark:bg-surface px-3.5 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <Button variant="primary" onClick={() => send(input)} disabled={!input.trim()}>
          <Send size={15} />
        </Button>
      </div>
      <button
        onClick={talkToHuman}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-forest-200 bg-forest-50 py-2.5 text-[12.5px] font-semibold text-forest-700 transition-colors hover:bg-forest-100"
      >
        <MessageCircleQuestion size={14} />
        {t('supportHuman')}
      </button>
    </Modal>
  );
}
