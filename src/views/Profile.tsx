import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, ChevronRight, ClipboardList, Plus, Settings } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { Avatar, Card, Stars } from '../components/ui';
import { readAndCompressImage } from '../lib/media';
import type { Review } from '../types';

export function Profile() {
  const { t } = useI18n();
  const { user, tasks, refreshAll, goTo } = useStore();
  const toast = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const workPhotosInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    api.listReviewsFor(user.id).then(setReviews).catch(() => undefined);
  }, [user]);

  const myTasks = useMemo(() => tasks.filter((x) => x.postedBy === user?.id), [tasks, user]);

  if (!user) return null;

  const pickAvatar = async (file?: File) => {
    if (!file) return;
    try {
      const compressed = await readAndCompressImage(file, 640, 0.85);
      await api.updateUser(user.id, { avatarUrl: compressed });
      await refreshAll();
      toast.success(t('profileSaved'));
    } catch {
      toast.error(t('errGeneric'));
    }
  };

  // Adding work photos never needs a detour through Settings / Edit profile —
  // pick straight from the hub and it saves immediately, same idea as the
  // avatar above.
  const addWorkPhotosDirect = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploadingPhotos(true);
    try {
      const urls = await Promise.all(Array.from(files).slice(0, 6).map((f) => readAndCompressImage(f, 1280, 0.82)));
      const nextPhotos = [...(user.workPhotos ?? []), ...urls].slice(0, 12);
      await api.updateUser(user.id, { workPhotos: nextPhotos });
      await refreshAll();
      toast.success(t('profileSaved'));
    } catch {
      toast.error(t('errGeneric'));
    } finally {
      setUploadingPhotos(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-2">
      <Card className="flex flex-col items-center gap-2 p-6 text-center">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="group relative shrink-0"
          aria-label={t('addPhoto')}
        >
          <Avatar src={user.avatarUrl} name={user.name} size={110} ring />
          <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white ring-2 ring-white transition-transform group-hover:scale-105">
            <Camera size={15} />
          </span>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickAvatar(e.target.files?.[0])}
        />
        <h1 className="mt-1 font-display text-xl text-ink-900">{user.name}</h1>
        <p className="text-[13.5px] text-ink-500">{user.phone}</p>
        {user.ratingCount > 0 && (
          <div className="flex items-center justify-center gap-1.5">
            <Stars value={user.ratingAvg} showValue />
            <span className="text-[12px] text-ink-500">({user.ratingCount})</span>
          </div>
        )}
      </Card>

      <div>
        <h4 className="mb-3 font-display text-lg text-ink-900">{t('portfolio')}</h4>
        <div className="grid grid-cols-2 gap-3">
          {(user.workPhotos ?? []).map((p, i) => (
            <img key={i} src={p} alt="" className="aspect-square w-full rounded-2xl object-cover" loading="lazy" />
          ))}
          <button
            type="button"
            onClick={() => workPhotosInputRef.current?.click()}
            disabled={uploadingPhotos}
            className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-ink-300 text-ink-400 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
          >
            <Plus size={24} />
          </button>
          <input
            ref={workPhotosInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addWorkPhotosDirect(e.target.files)}
          />
        </div>
      </div>

      <button
        onClick={() => goTo('myTasks')}
        className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:bg-ink-50"
      >
        <ClipboardList size={18} className="text-ink-500" />
        <span className="flex-1 text-[14.5px] font-medium text-ink-900">
          {t('postedTasks')} {myTasks.length > 0 && <span className="text-ink-400">({myTasks.length})</span>}
        </span>
        <ChevronRight size={16} className="text-ink-300" />
      </button>

      <button
        onClick={() => goTo('profileSettings')}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 py-2.5 text-[13.5px] font-semibold text-ink-700 transition-colors hover:bg-ink-50"
      >
        <Settings size={15} />
        {t('settingsLabel')}
      </button>

      {reviews.length > 0 && (
        <div>
          <h4 className="mb-3 text-center font-display text-lg text-ink-900">{t('reviews')}</h4>
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
        </div>
      )}
    </div>
  );
}
