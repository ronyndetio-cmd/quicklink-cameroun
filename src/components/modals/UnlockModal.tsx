import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Loader2, Lock, MessageCircle, Phone, ShieldCheck, Smartphone, X } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useStore } from '../../store';
import { api, ApiError } from '../../api';
import { Avatar, Button, Field, Input, Modal, Pill, Stars } from '../ui';
import { useToast } from '../Toast';
import { formatPhone } from '../ContactStrip';
import { UNLOCK_PRICE } from '../../types';

type Step = 'choose' | 'pending' | 'success' | 'failed';

/** MTN (67x, 65x0-4, 68x0-4) vs Orange (69x, 65x5-9, 68x5-9) — display only, Fapshi routes automatically. */
function operatorOf(phone: string): 'mtn' | 'om' | null {
  const d = phone.replace(/\D/g, '');
  if (/^6(7[0-9]|50[0-4]|51[0-4]|8[0-4])/.test(d)) return 'mtn';
  if (/^6(9[0-9]|5[5-9]|8[5-9])/.test(d)) return 'om';
  return null;
}

export function UnlockModal() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { unlockRequest, closeUnlock, user, refreshUnlocks, refreshAll } = useStore();

  const [step, setStep] = useState<Step>('choose');
  const [phone, setPhone] = useState('');
  const [transId, setTransId] = useState('');
  const [instruction, setInstruction] = useState('');
  const [busy, setBusy] = useState(false);
  const [unlockedPhone, setUnlockedPhone] = useState('');
  const pollRef = useRef<number | null>(null);

  const target = unlockRequest?.target;
  const operator = operatorOf(phone);

  const stopPolling = () => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = null;
  };

  useEffect(() => {
    if (!unlockRequest) return;
    setStep('choose');
    setPhone(user?.phone?.replace(/\D/g, '') ?? '');
    setTransId('');
    setInstruction('');
    setUnlockedPhone('');
    stopPolling();
  }, [unlockRequest, user]);

  useEffect(() => stopPolling, []);

  if (!unlockRequest || !target) return null;

  const finish = async () => {
    stopPolling();
    await refreshUnlocks();
    await refreshAll();
    let phoneNow = target.phone;
    try {
      const full = await api.getUser(target.id, user?.id);
      phoneNow = full.phone;
      setUnlockedPhone(full.phone);
    } catch {
      /* the strip will still refresh from the store */
    }
    setStep('success');
    // Best effort — a real MOMO/OM confirmation happens seconds after the
    // original tap, so browsers may treat this as no longer "user-initiated"
    // and block the popup. The WhatsApp/Call buttons below always work as
    // a guaranteed fallback either way.
    window.open(`https://wa.me/${toIntl(phoneNow)}`, '_blank', 'noopener');
    window.setTimeout(() => {
      window.location.href = `tel:+${toIntl(phoneNow)}`;
    }, 500);
  };

  const startPayment = async () => {
    if (!user) return;
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 8) {
      toast.warning(t('yourNumber'));
      return;
    }
    setBusy(true);
    try {
      const res = await api.initiatePayment({ userId: user.id, phone: clean, targetUserId: target.id });
      setTransId(res.transId);
      setInstruction(lang === 'fr' ? res.instructionFr : res.instructionEn);
      setStep('pending');

      pollRef.current = window.setInterval(async () => {
        try {
          const { transaction } = await api.paymentStatus(res.transId);
          if (transaction.status === 'SUCCESSFUL') {
            await finish();
          } else if (transaction.status === 'FAILED') {
            stopPolling();
            setStep('failed');
          }
        } catch {
          /* transient — keep polling */
        }
      }, 1500);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.localized(lang) : t('errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  // Everything (revealing the number, opening WhatsApp/the dialer) already
  // happened automatically in finish() the moment the payment confirmed —
  // this just dismisses the confirmation screen, nothing more.
  const done = () => closeUnlock();

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(transId);
      toast.success(t('linkCopied'), transId);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Modal open onClose={closeUnlock} title={t('unlockTitle')} subtitle={t('unlockLead')} size="md">
      {/* target summary */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-ink-50 p-3">
        <Avatar src={target.avatarUrl} name={target.name} size={46} ring />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink-900">{target.name}</p>
          <p className="truncate text-[12.5px] text-ink-500">
            {target.specialty ? `${target.specialty} · ` : ''}
            {target.area}, {target.city}
          </p>
          {target.ratingCount > 0 && <Stars value={target.ratingAvg} size={12} showValue />}
        </div>
        <Pill tone="gold">
          <Lock size={10} />
          {UNLOCK_PRICE} F
        </Pill>
      </div>

      {/* step rail */}
      <ol className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
        {(['choose', 'pending', 'success'] as const).map((s, i) => {
          const reached =
            s === 'choose' || (s === 'pending' && step !== 'choose') || (s === 'success' && step === 'success');
          return (
            <li key={s} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                  reached ? 'bg-brand-950 text-gold-400' : 'bg-ink-200 text-ink-500'
                }`}
              >
                {i + 1}
              </span>
              {i < 2 && <span className={`h-px flex-1 ${reached ? 'bg-brand-300' : 'bg-ink-200'}`} />}
            </li>
          );
        })}
      </ol>

      {step === 'choose' && (
        <div className="space-y-4">
          <Field label={t('yourNumber')} required hint={operator ? t(operator) : undefined}>
            <div className="relative">
              <Smartphone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="6 77 11 22 33"
                className="pl-10"
              />
            </div>
          </Field>

          <Button variant="gold" size="lg" className="w-full" loading={busy} onClick={startPayment}>
            <Lock size={16} />
            {t('payNow')}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-ink-400">
            <ShieldCheck size={13} />
            {t('poweredByFapshi')}
          </p>
        </div>
      )}

      {step === 'pending' && (
        <div className="space-y-4 text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gold-200/60" style={{ animation: 'ql-pulse-ring 2s ease-out infinite' }} />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gold-400 text-brand-950">
              <Loader2 size={26} className="a-spin" />
            </span>
          </div>

          <div>
            <h4 className="font-display text-xl text-ink-900">{t('pendingTitle')}</h4>
            <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-ink-600">{t('pendingLead')}</p>
          </div>

          <p className="text-[13px] text-ink-700">{instruction}</p>

          <button
            onClick={copyRef}
            className="mx-auto flex items-center gap-2 rounded-xl bg-ink-50 px-3.5 py-2.5 font-mono text-[14px] font-semibold tracking-wide text-ink-900 transition-colors hover:bg-ink-100"
          >
            <span className="text-[10px] font-sans uppercase tracking-widest text-ink-400">{t('reference')}</span>
            {transId}
            <Copy size={14} className="text-ink-400" />
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="space-y-4 text-center">
          <span className="a-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-500 text-white">
            <Check size={30} strokeWidth={2.4} />
          </span>
          <div>
            <h4 className="font-display text-xl text-ink-900">{t('unlockSuccess')}</h4>
            <p className="mt-1 text-[13.5px] text-ink-600">{t('unlockSuccessLead')}</p>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-forest-50 px-4 py-3">
            <span className="font-mono text-lg font-semibold tracking-wide text-forest-800 tabular-nums">
              {formatPhone(unlockedPhone || target.phone)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(`https://wa.me/${toIntl(unlockedPhone || target.phone)}`, '_blank', 'noopener')}
            >
              <MessageCircle size={15} />
              {t('whatsapp')}
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = `tel:+${toIntl(unlockedPhone || target.phone)}`)}>
              <Phone size={15} />
              {t('call')}
            </Button>
          </div>
          <Button variant="gold" size="lg" className="w-full" onClick={done}>
            {t('done')}
          </Button>
        </div>
      )}

      {step === 'failed' && (
        <div className="space-y-4 text-center">
          <span className="a-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <X size={30} strokeWidth={2.4} />
          </span>
          <div>
            <h4 className="font-display text-xl text-ink-900">{t('paymentFailed')}</h4>
            <p className="mt-1 text-[13.5px] text-ink-600">{t('errGeneric')}</p>
          </div>
          <Button variant="outline" size="lg" className="w-full" onClick={() => setStep('choose')}>
            {t('unlockWith')}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function toIntl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('237') ? digits : `237${digits}`;
}
