import { useEffect, useRef, useState } from 'react';
import { Camera, LogOut, Pencil, Plus, Save, Trash2, Video, X } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { api, ApiError } from '../api';
import { useToast } from '../components/Toast';
import { Avatar, Button, Card, Field, Input, Stars, Textarea } from '../components/ui';
import { CityInput } from '../components/CityInput';
import { readAndCompressImage } from '../lib/media';
import type { Review } from '../types';

export function Profile() {
  const { t, lang } = useI18n();
  const { user, signOut, refreshAll } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [city, setCity] = useState(user?.city ?? 'Douala');
  const [area, setArea] = useState(user?.area ?? '');
  const [specialty, setSpecialty] = useState(user?.specialty ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [videoUrl, setVideoUrl] = useState(user?.profileVideoUrl ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [workPhotos, setWorkPhotos] = useState<string[]>(user?.workPhotos ?? []);

  useEffect(() => {
    if (!user) return;
    api.listReviewsFor(user.id).then(setReviews).catch(() => undefined);
  }, [user]);

  if (!user) return null;

  const pickAvatar = async (file?: File) => {
    if (!file) return;
    try {
      const compressed = await readAndCompressImage(file, 640, 0.85);
      setAvatarUrl(compressed);
      // Outside edit mode there's no "Save" step to wait for — the photo
      // change should stick the moment it's picked, not require entering
      // the edit form first.
      if (!editing) {
        await api.updateUser(user!.id, { avatarUrl: compressed });
        await refreshAll();
        toast.success(t('profileSaved'));
      }
    } catch {
      toast.error(t('errGeneric'));
    }
  };

  const addWorkPhotos = async (files: FileList | null) => {
    if (!files || !files.length) return;
    try {
      const urls = await Promise.all(
        Array.from(files).slice(0, 6).map((f) => readAndCompressImage(f, 1280, 0.82)),
      );
      setWorkPhotos((prev) => [...prev, ...urls].slice(0, 12));
    } catch {
      toast.error(t('errGeneric'));
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      await api.updateUser(user.id, {
        name,
        city,
        area,
        specialty,
        bio,
        profileVideoUrl: videoUrl || undefined,
        avatarUrl: avatarUrl || undefined,
        workPhotos,
      });
      await refreshAll();
      toast.success(t('profileSaved'));
      setEditing(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.localized(lang) : t('errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm(t('deleteAccountConfirm'))) return;
    setBusy(true);
    try {
      await api.deleteUser(user.id);
      toast.success(t('accountDeleted'));
      signOut();
    } catch {
      toast.error(t('errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-center font-display text-[26px] text-ink-900">{t('profileTitle')}</h1>
      <div className="mb-4 flex items-center justify-between">
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil size={13} />
            {t('editProfile')}
          </Button>
        ) : (
          <span />
        )}
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut size={13} />
          {t('logout')}
        </Button>
      </div>

      <Card className="p-5 sm:p-6">
        {!editing ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="group relative shrink-0"
              aria-label={t('addPhoto')}
            >
              <Avatar src={user.avatarUrl} name={user.name} size={140} ring />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-brand-950/0 text-transparent transition-colors group-hover:bg-brand-950/50 group-hover:text-white">
                <Camera size={26} />
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickAvatar(e.target.files?.[0])}
            />
            <div className="min-w-0">
              <h3 className="font-display text-xl text-ink-900">{user.name}</h3>
              <p className="mt-0.5 text-[13.5px] text-ink-600">{user.specialty}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-500">
                {user.area}, {user.city}
              </p>
              {user.ratingCount > 0 && (
                <div className="mt-1.5 flex items-center justify-center gap-1.5">
                  <Stars value={user.ratingAvg} showValue />
                  <span className="text-[12px] text-ink-500">
                    ({user.ratingCount} {t('reviewsCount').toLowerCase()})
                  </span>
                </div>
              )}
              {user.bio && <p className="mx-auto mt-2.5 max-w-lg text-[13.5px] leading-relaxed text-ink-700">{user.bio}</p>}
              <p className="mt-2.5 text-[11.5px] text-ink-400">
                {t('memberSince')} {new Date(user.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="group relative shrink-0"
                aria-label={t('addPhoto')}
              >
                <Avatar src={avatarUrl} name={name || user.name} size={120} ring />
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-brand-950/0 text-transparent transition-colors group-hover:bg-brand-950/50 group-hover:text-white">
                  <Camera size={22} />
                </span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickAvatar(e.target.files?.[0])}
              />
              <div className="w-full">
                <Field label={t('nameLabel')} required>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('cityLabel')}>
                <CityInput value={city} onChange={setCity} />
              </Field>
              <Field label={t('areaLabel')}>
                <Input value={area} onChange={(e) => setArea(e.target.value)} />
              </Field>
            </div>
            <Field label={t('professionLabel')} required hint={t('professionHint')}>
              <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
            </Field>
            <Field label={t('videoUrlLabel')} hint={t('videoBio')}>
              <div className="relative">
                <Video size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="pl-10" placeholder="https://…" />
              </div>
            </Field>
            <Field label={t('yourComment')}>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </Field>

            <Field label={t('workPhotosLabel')}>
              <div className="mb-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {workPhotos.map((p, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-2xl bg-ink-100">
                    <img src={p} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setWorkPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => photosInputRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-ink-300 text-ink-400 transition-colors hover:border-brand-300 hover:text-brand-600"
                >
                  <Plus size={24} />
                </button>
                <input
                  ref={photosInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addWorkPhotos(e.target.files)}
                />
              </div>
            </Field>

            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="gold" loading={busy} onClick={save}>
                  <Save size={14} />
                  {t('saveProfile')}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  {t('cancel')}
                </Button>
              </div>
              <button
                onClick={deleteAccount}
                disabled={busy}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-red-500 transition-colors hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 size={13} />
                {t('deleteAccount')}
              </button>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-8">
        <h4 className="mb-3 text-center font-display text-lg text-ink-900">{t('reviews')}</h4>
        {reviews.length === 0 ? (
          <p className="text-center text-[13px] text-ink-500">{t('noReviews')}</p>
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
