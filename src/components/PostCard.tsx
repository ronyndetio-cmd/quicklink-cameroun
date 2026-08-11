import { useMemo, useState } from 'react';
import {
  Bookmark,
  Clock,
  Languages,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Sparkles,
  Users,
  Trash2,
} from 'lucide-react';
import type { Task, User } from '../types';
import { useI18n, timeAgo } from '../i18n';
import { useStore } from '../store';
import { api } from '../api';
import { categoryLabel, categoryColor } from '../data/categories';
import { formatDistance } from '../lib/geo';
import { Avatar, Card, Icon, Pill, Stars } from './ui';
import { useToast } from './Toast';

const URGENCY_TONE = {
  urgent: 'danger',
  today: 'gold',
  this_week: 'brand',
  flexible: 'neutral',
} as const;

export function PostCard({
  post,
  index = 0,
  onDelete,
}: {
  post: Task;
  index?: number;
  onDelete?: (id: string) => void;
}) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const {
    userById,
    user,
    saved,
    toggleSaved,
    contact,
    openProfile,
    setLightbox,
    isUnlocked,
    distanceTo,
    categories,
  } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const task = post;

  const owner: User = useMemo(() => {
    const found = userById(post.postedBy);
    if (found) return found;
    return {
      id: post.postedBy,
      name: post.postedByName ?? 'QuickLink',
      phone: '6** *** ***',
      area: post.area,
      city: post.city,
      specialty: '',
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: post.createdAt,
    };
  }, [post, userById]);

  const isMine = user?.id === post.postedBy;
  const color = categoryColor(post.category);
  const catIcon = categories.find((c) => c.id === post.category)?.iconName ?? 'Wrench';
  const distance = distanceTo(post);
  const longText = post.description.length > 190;
  const shown = expanded || !longText ? post.description : `${post.description.slice(0, 185)}…`;

  const share = async () => {
    const url = `${window.location.origin}/?post=${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: post.title, text: post.description.slice(0, 120), url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success(t('linkCopied'));
      }
    } catch {
      /* the person dismissed the share sheet */
    }
  };

  const toggleTranslate = async () => {
    if (translated) {
      setShowTranslation((v) => !v);
      return;
    }
    setTranslating(true);
    try {
      const res = await api.translate(post.description, lang);
      if (res.translated) {
        setTranslated(res.translated);
        setShowTranslation(true);
      } else {
        toast.info(t('translationUnavailable'));
      }
    } catch {
      toast.info(t('translationUnavailable'));
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Card
      as="article"
      className="a-rise overflow-hidden border border-ink-200 transition-shadow duration-300 hover:shadow-lift"
      // Staggered entrance keeps a long feed from popping in all at once.
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div>
        {/* ---------- header ---------- */}
        <header className="flex items-start gap-3 px-4 pt-4 sm:px-5">
          <button onClick={() => openProfile(owner.id)} className="shrink-0 transition-transform hover:scale-105">
            <Avatar src={owner.avatarUrl} name={owner.name} size={44} ring />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <button
                onClick={() => openProfile(owner.id)}
                className="truncate font-semibold text-ink-900 hover:text-brand-700 hover:underline"
              >
                {owner.name}
              </button>
              {owner.ratingCount > 0 && <Stars value={owner.ratingAvg} size={12} showValue />}
              {isUnlocked(owner.id) && owner.id !== user?.id && (
                <span className="rounded-full bg-forest-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-forest-700">
                  {t('unlockedFor')}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-ink-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} />
                {post.area}, {post.city}
              </span>
              {distance !== null && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-medium text-brand-600">{formatDistance(distance, lang)}</span>
                </>
              )}
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                {timeAgo(post.createdAt, lang)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              onClick={() => toggleSaved(post.id)}
              aria-label={saved.has(post.id) ? t('saved') : t('save')}
              title={saved.has(post.id) ? t('saved') : t('save')}
              className={`rounded-xl p-2 transition-all active:scale-90 ${
                saved.has(post.id) ? 'text-gold-500' : 'text-ink-400 hover:bg-ink-100 hover:text-ink-700'
              }`}
            >
              <Bookmark size={17} className={saved.has(post.id) ? 'fill-gold-400' : ''} />
            </button>
            <button
              onClick={share}
              aria-label={t('share')}
              title={t('share')}
              className="rounded-xl p-2 text-ink-400 transition-all hover:bg-ink-100 hover:text-ink-700 active:scale-90"
            >
              <Share2 size={16} />
            </button>
            {isMine && onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                aria-label={t('deletePost')}
                title={t('deletePost')}
                className="rounded-xl p-2 text-ink-400 transition-all hover:bg-red-50 hover:text-red-600 active:scale-90"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </header>

        {/* ---------- body ---------- */}
        <div className="px-4 pt-3 sm:px-5">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Pill style={{ backgroundColor: `${color}18`, color }} className="!text-[11px]">
              <Icon name={catIcon} size={11} />
              {categoryLabel(post.category, lang)}
            </Pill>
            {post.subCategory && <Pill tone="neutral">{post.subCategory}</Pill>}
            {task && (
              <Pill tone={URGENCY_TONE[task.urgency]}>
                {task.urgency === 'urgent' && <Sparkles size={10} />}
                {t(task.urgency)}
              </Pill>
            )}
          </div>

          <h3 className="font-display text-[19px] leading-snug text-ink-900 sm:text-[21px]">{post.title}</h3>
          <p className="mt-1.5 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-700">
            {showTranslation && translated ? translated : shown}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {longText && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-[13px] font-semibold text-brand-600 hover:underline"
              >
                {expanded ? t('showLess') : t('showMore')}
              </button>
            )}
            <button
              onClick={toggleTranslate}
              disabled={translating}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-500 hover:text-brand-600 hover:underline disabled:opacity-60"
            >
              {translating ? <Loader2 size={12} className="a-spin" /> : <Languages size={12} />}
              {translating ? t('translating') : showTranslation && translated ? t('showOriginal') : t('translate')}
            </button>
          </div>
        </div>

        {/* ---------- media ---------- */}
        {task?.imageUrl && (
          <button
            onClick={() => setLightbox({ photos: [task.imageUrl!], index: 0 })}
            className="mt-3 block w-full overflow-hidden bg-ink-100"
          >
            <img
              src={task.imageUrl}
              alt=""
              className="h-56 w-full object-cover transition-transform duration-500 hover:scale-[1.03] sm:h-72"
              loading="lazy"
            />
          </button>
        )}

        {/* ---------- stats bar ---------- */}
        {owner.ratingCount > 0 && (
          <div className="mt-3 flex items-center justify-end px-4 text-[12.5px] text-ink-500 sm:px-5">
            <span className="inline-flex items-center gap-1">
              <Users size={12} />
              {owner.ratingCount} {t('reviewsCount').toLowerCase()}
            </span>
          </div>
        )}

        {/* ---------- action bar ---------- */}
        <div className="mt-2.5 grid grid-cols-2 gap-1 border-t border-ink-100 px-2 py-1.5">
          <ActionButton
            onClick={() => contact(owner, 'whatsapp')}
            icon={<MessageCircle size={16} />}
            label={t('whatsapp')}
            tone="forest"
          />
          <ActionButton
            onClick={() => contact(owner, 'call')}
            icon={<Phone size={16} />}
            label={t('call')}
            tone="brand"
          />
        </div>
      </div>
    </Card>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
  disabled,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
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
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[13px] font-semibold
        transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40
        ${active ? 'bg-brand-50 text-brand-700' : tones[tone]}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
