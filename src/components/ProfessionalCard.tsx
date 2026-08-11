import { MapPin, MessageCircle, Phone } from 'lucide-react';
import type { User } from '../types';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { categoryColor, categoryLabel } from '../data/categories';
import { formatDistance } from '../lib/geo';
import { Card, Pill, Stars } from './ui';

/**
 * A professional's card: large photo on the left, details on the right —
 * modelled on senvato.com's provider listings. WhatsApp/Call stay in their
 * own row underneath, never gated behind a separate "unlock" button — the
 * paywall triggers from those buttons themselves when the contact is locked.
 */
export function ProfessionalCard({ user: pro, index = 0 }: { user: User; index?: number }) {
  const { t, lang } = useI18n();
  const { contact, openProfile, distanceTo } = useStore();

  const photo = pro.workPhotos?.[0] || pro.avatarUrl;
  const category = pro.servicesOffered?.[0];
  const color = category ? categoryColor(category) : '#2563EB';
  const distance = distanceTo(pro);
  const tags = (pro.serviceSubcategories ?? []).slice(0, 4);
  const extra = (pro.serviceSubcategories ?? []).length - tags.length;

  return (
    <Card
      as="article"
      className="a-rise overflow-hidden border border-ink-200 transition-shadow duration-300 hover:shadow-lift"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <button onClick={() => openProfile(pro.id)} className="flex w-full flex-col gap-4 p-4 text-left sm:flex-row sm:p-5">
        <span className="mx-auto flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-100 sm:mx-0 sm:h-36 sm:w-36">
          {photo ? (
            <img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="font-display text-4xl font-semibold text-ink-400">{pro.name.slice(0, 1)}</span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <h3 className="truncate font-display text-[17px] font-semibold text-ink-900">{pro.specialty}</h3>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px] text-ink-500">
            <span className="font-medium text-ink-700">{pro.name}</span>
            {pro.ratingCount > 0 && (
              <>
                <span aria-hidden>·</span>
                <Stars value={pro.ratingAvg} size={11} showValue />
              </>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-500">
            <MapPin size={11} />
            {pro.area}, {pro.city}
            {distance !== null && <span className="font-medium text-brand-600">· {formatDistance(distance, lang)}</span>}
          </p>

          {pro.bio && <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-ink-700">{pro.bio}</p>}

          {(tags.length > 0 || category) && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {category && (
                <Pill style={{ backgroundColor: `${color}18`, color }} className="!text-[11px]">
                  {categoryLabel(category, lang)}
                </Pill>
              )}
              {tags.map((tag) => (
                <Pill key={tag} tone="neutral" className="!text-[11px]">
                  {tag}
                </Pill>
              ))}
              {extra > 0 && (
                <span className="inline-flex items-center px-1 text-[11px] font-semibold text-ink-400">
                  +{extra} {t('more')}
                </span>
              )}
            </div>
          )}
        </div>
      </button>

      <div className="grid grid-cols-2 gap-1 border-t border-ink-100 px-2 py-1.5">
        <ActionButton
          onClick={(e) => {
            e.stopPropagation();
            contact(pro, 'whatsapp');
          }}
          icon={<MessageCircle size={16} />}
          label={t('whatsapp')}
          tone="forest"
        />
        <ActionButton
          onClick={(e) => {
            e.stopPropagation();
            contact(pro, 'call');
          }}
          icon={<Phone size={16} />}
          label={t('call')}
          tone="brand"
        />
      </div>
    </Card>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  tone?: 'neutral' | 'forest' | 'brand';
}) {
  const tones = {
    neutral: 'hover:bg-ink-100 text-ink-600',
    forest: 'hover:bg-forest-50 text-ink-600 hover:text-forest-700',
    brand: 'hover:bg-brand-50 text-ink-600 hover:text-brand-700',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[13px] font-semibold transition-all duration-200 active:scale-[0.97] ${tones[tone]}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
