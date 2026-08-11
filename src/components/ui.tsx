import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import * as Icons from 'lucide-react';
import { Loader2, Star, X } from 'lucide-react';
import { initialsOf } from '../lib/media';

/* ------------------------------- Icon ------------------------------- */

export function Icon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Circle;
  return <Cmp size={size} className={className} />;
}

/* ------------------------------- Button ------------------------------ */

type ButtonVariant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-brand-950 text-white hover:bg-brand-900 disabled:bg-brand-900/50',
  gold: 'bg-gold-400 text-brand-950 hover:bg-gold-300 disabled:bg-gold-400/50',
  outline: 'border border-ink-200 bg-white text-ink-800 hover:border-brand-300 hover:text-brand-700 dark:bg-surface',
  ghost: 'text-ink-600 hover:bg-ink-100',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};

const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12.5px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[13.5px] gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[14.5px] gap-2 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold transition-all
        duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60
        ${BUTTON_VARIANT[variant]} ${BUTTON_SIZE[size]} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={size === 'sm' ? 13 : 16} className="a-spin" /> : children}
    </button>
  );
}

/* -------------------------------- Card -------------------------------- */

export function Card({
  as: As = 'div',
  className = '',
  children,
  ...rest
}: { as?: keyof JSX.IntrinsicElements; className?: string; children?: ReactNode } & Record<string, unknown>) {
  const Tag = As as React.ElementType;
  return (
    <Tag className={`rounded-2xl bg-white shadow-sm ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* --------------------------- SeeAllLink -------------------------------- */

export function SeeAllLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-800 hover:underline"
    >
      {label}
      <Icons.ArrowRight size={14} />
    </button>
  );
}

/* --------------------------- SectionHeading ---------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  center,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  center?: boolean;
}) {
  if (center) {
    return (
      <div className="relative mb-5 text-center">
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-500">{eyebrow}</p>}
        <h2 className="mt-1 font-display text-[22px] leading-tight text-ink-900 sm:text-[26px]">{title}</h2>
        {lead && <p className="mx-auto mt-1 max-w-md text-[13px] text-ink-500">{lead}</p>}
        {action && <div className="mt-3 flex justify-center sm:absolute sm:right-0 sm:top-0 sm:mt-0">{action}</div>}
      </div>
    );
  }
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-500">{eyebrow}</p>}
        <h2 className="mt-1 font-display text-[22px] leading-tight text-ink-900 sm:text-[26px]">{title}</h2>
        {lead && <p className="mt-1 text-[13px] text-ink-500">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------- SkeletonCard ----------------------------- */

export function SkeletonCard() {
  return (
    <Card className="animate-pulse overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="h-11 w-11 rounded-full bg-ink-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-ink-200" />
          <div className="h-2.5 w-1/2 rounded bg-ink-100" />
        </div>
      </div>
      <div className="space-y-2 px-4 pb-5">
        <div className="h-4 w-2/3 rounded bg-ink-200" />
        <div className="h-3 w-full rounded bg-ink-100" />
        <div className="h-3 w-5/6 rounded bg-ink-100" />
      </div>
    </Card>
  );
}

/* -------------------------------- Avatar -------------------------------- */

export function Avatar({
  src,
  name,
  size = 40,
  ring,
  className = '',
}: {
  src?: string;
  name: string;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  return src ? (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-cover ${ring ? 'ring-2 ring-white shadow-sm' : ''} ${className}`}
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-800 font-semibold text-white ${
        ring ? 'ring-2 ring-white shadow-sm' : ''
      } ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initialsOf(name)}
    </span>
  );
}

/* --------------------------------- Pill --------------------------------- */

type PillTone = 'neutral' | 'brand' | 'gold' | 'forest' | 'danger';

const PILL_TONE: Record<PillTone, string> = {
  neutral: 'bg-ink-100 text-ink-700',
  brand: 'bg-brand-100 text-brand-800',
  gold: 'bg-gold-100 text-gold-800',
  forest: 'bg-forest-100 text-forest-800',
  danger: 'bg-red-100 text-red-700',
};

export function Pill({
  tone = 'neutral',
  className = '',
  style,
  children,
}: {
  tone?: PillTone;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${PILL_TONE[tone]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

/* -------------------------------- Stars ---------------------------------- */

export function Stars({ value, size = 13, showValue }: { value: number; size?: number; showValue?: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(value) ? 'fill-gold-400 text-gold-400' : 'fill-ink-200 text-ink-200'}
        />
      ))}
      {showValue && <span className="ml-1 text-[11px] font-semibold text-ink-600">{value.toFixed(1)}</span>}
    </span>
  );
}

/* -------------------------------- Field ---------------------------------- */

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1 text-[12.5px] font-semibold text-ink-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-ink-500">{hint}</span>}
    </label>
  );
}

/* -------------------------------- Input ----------------------------------- */

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-ink-200 bg-white dark:bg-surface px-3.5 text-[14px] text-ink-900
        placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 ${className}`}
      {...rest}
    />
  );
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-ink-200 bg-white dark:bg-surface px-3.5 py-2.5 text-[14px] text-ink-900
        placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 ${className}`}
      {...rest}
    />
  );
}

export function Select({ className = '', children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-11 w-full rounded-xl border border-ink-200 bg-white dark:bg-surface px-3.5 text-[14px] text-ink-900
        focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

/* -------------------------------- Modal ----------------------------------- */

const MODAL_SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/60 backdrop-blur-sm sm:items-center sm:p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div
        className={`a-rise relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-ink-50 shadow-lift
          sm:rounded-3xl ${MODAL_SIZE[size]}`}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-3 border-b border-ink-200 bg-white dark:bg-surface px-5 py-4 sm:px-6">
            <div>
              {title && <h3 className="font-display text-[19px] text-ink-900">{title}</h3>}
              {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-500">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
