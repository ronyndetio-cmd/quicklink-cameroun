import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MessageCircle, Phone, Play } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { api, ApiError } from '../api';
import { useToast } from '../components/Toast';
import { Avatar, Button, Card, Stars } from '../components/ui';
import { PostCard } from '../components/PostCard';
import { coverFor } from '../lib/media';
import type { Review, User } from '../types';

export function PublicProfile({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const { userById, closeProfile, tasks, contact, isUnlocked, setVideoFor, user, requireAuth, refreshAll } =
    useStore();
  const toast = useToast();

  const listed = userById(id);
  const [fetched, setFetched] = useState<User | null>(null);
  const target = listed ?? fetched;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  useEffect(() => {
    if (listed) return;
    api.getUser(id, user?.id).then(setFetched).catch(() => undefined);
  }, [id, listed, user?.id]);

  useEffect(() => {
    api.listReviewsFor(id).then(setReviews).catch(() => undefined);
  }, [id]);

  const theirTasks = useMemo(() => tasks.filter((t2) => t2.postedBy === id), [tasks, id]);
  const photos = useMemo(() => (target?.workPhotos ?? []).slice(0, 12), [target]);

  if (!target) {
    return (
      <div className="py-16 text-center text-[13.5px] text-ink-500">{t('loading')}</div>
    );
  }

  const isSelf = user?.id === target.id;

  const submitReview = () => {
    requireAuth(async (me) => {
      if (me.id === target.id) {
        toast.warning(t('errSelfReview'));
        return;
      }
      setBusy(true);
      try {
        const res = await api.createReview({ reviewerId: me.id, reviewedUserId: target.id, rating, comment: comment.trim() });
        setReviews((list) => [res.review, ...list]);
        setComment('');
        await refreshAll();
        toast.success(t('reviewSent'));
      } catch (e) {
        toast.error(e instanceof ApiError ? e.localized(lang) : t('errGeneric'));
      } finally {
        setBusy(false);
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={closeProfile}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-600 hover:text-brand-700"
      >
        <ArrowLeft size={15} />
        {t('back')}
      </button>

      <Card className="overflow-hidden">
        <div className="h-32 w-full sm:h-40" style={{ backgroundImage: `url(${coverFor(target.id)})`, backgroundSize: 'cover' }} />
        <div className="-mt-12 flex flex-col items-center px-5 pb-5 text-center sm:px-6">
          <Avatar src={target.avatarUrl} name={target.name} size={96} ring className="border-4 border-white" />
          <div className="mt-3">
            <h1 className="font-display text-2xl text-ink-900">{target.name}</h1>
            <p className="mt-0.5 text-[13.5px] text-ink-600">{target.specialty}</p>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              {target.area}, {target.city}
            </p>
            {target.ratingCount > 0 && (
              <div className="mt-1.5 flex items-center justify-center gap-1.5">
                <Stars value={target.ratingAvg} showValue />
                <span className="text-[12px] text-ink-500">
                  ({target.ratingCount} {t('reviewsCount').toLowerCase()})
                </span>
              </div>
            )}
            {target.hasVideoBio && (
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setVideoFor(target)}>
                <Play size={13} />
                {isUnlocked(target.id) || isSelf ? t('watchVideo') : t('videoLocked')}
              </Button>
            )}
          </div>

          {target.bio && <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-relaxed text-ink-700">{target.bio}</p>}

          {!isSelf && (
            <div className="mt-4 grid w-full gap-2 sm:max-w-md sm:grid-cols-2">
              <button
                onClick={() => contact(target, 'whatsapp')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-forest-50 py-2.5 text-[13px] font-semibold text-forest-700 transition-colors hover:bg-forest-100"
              >
                <MessageCircle size={15} />
                {t('whatsapp')}
              </button>
              <button
                onClick={() => contact(target, 'call')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-50 py-2.5 text-[13px] font-semibold text-brand-700 transition-colors hover:bg-brand-100"
              >
                <Phone size={15} />
                {t('call')}
              </button>
            </div>
          )}
        </div>
      </Card>

      {photos.length > 0 && (
        <div className="mt-8">
          <h4 className="mb-3 text-center font-display text-lg text-ink-900">{t('portfolio')}</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p, i) => (
              <img key={i} src={p} alt="" className="aspect-square w-full rounded-2xl object-cover" loading="lazy" />
            ))}
          </div>
        </div>
      )}

      {theirTasks.length > 0 && (
        <div className="mt-8 text-center">
          {!showTasks ? (
            <Button variant="outline" onClick={() => setShowTasks(true)}>
              {t('showPostedTasks')} ({theirTasks.length})
            </Button>
          ) : (
            <div className="space-y-4">
              <h4 className="font-display text-lg text-ink-900">{t('postedTasks')}</h4>
              {theirTasks.map((task, i) => (
                <PostCard key={task.id} post={task} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <h4 className="mb-3 text-center font-display text-lg text-ink-900">{t('reviews')}</h4>
        {!isSelf && (
          <Card className="mb-4 p-4">
            <p className="mb-2 text-[13px] font-semibold text-ink-800">
              {t('reviewFor')} {target.name}
            </p>
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} onClick={() => setRating(i + 1)} className="p-0.5 text-xl leading-none">
                  <span className={i < rating ? 'text-gold-400' : 'text-ink-200'}>★</span>
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('yourComment')}
              rows={2}
              className="mb-2 w-full rounded-xl border border-ink-200 bg-white dark:bg-surface px-3.5 py-2.5 text-[13.5px] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <Button variant="gold" size="sm" loading={busy} onClick={submitReview}>
              {t('sendReview')}
            </Button>
          </Card>
        )}
        {reviews.length === 0 ? (
          <p className="text-[13px] text-ink-500">{t('noReviews')}</p>
        ) : (
          <div className="space-y-2.5">
            {reviews.map((r) => (
              <Card key={r.id} className="p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-ink-900">{r.reviewerName}</p>
                  <Stars value={r.rating} size={12} />
                </div>
                {r.comment && <p className="mt-1 text-[13px] text-ink-600">{r.comment}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
