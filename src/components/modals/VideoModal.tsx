import { Lock, Play } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useStore } from '../../store';
import { Avatar, Button, Modal } from '../ui';

export function VideoModal() {
  const { t } = useI18n();
  const { videoFor, setVideoFor, isUnlocked, requestUnlock, user } = useStore();

  if (!videoFor) return null;
  const unlocked = user?.id === videoFor.id || isUnlocked(videoFor.id);
  const close = () => setVideoFor(null);

  return (
    <Modal open title={t('videoBio')} onClose={close} size="md">
      <div className="mb-4 flex items-center gap-3">
        <Avatar src={videoFor.avatarUrl} name={videoFor.name} size={42} ring />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">{videoFor.name}</p>
          <p className="truncate text-[12.5px] text-ink-500">{videoFor.specialty}</p>
        </div>
      </div>

      {unlocked ? (
        <video
          src={videoFor.profileVideoUrl}
          controls
          autoPlay
          className="w-full rounded-2xl bg-black"
          style={{ aspectRatio: '16 / 9' }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gold-200 bg-gold-50 px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400 text-brand-950">
            <Lock size={20} />
          </span>
          <p className="text-[13.5px] font-medium text-gold-800">{t('videoLocked')}</p>
          <Button
            variant="gold"
            onClick={() => {
              close();
              requestUnlock(videoFor);
            }}
          >
            <Play size={14} />
            {t('unlockFor')}
          </Button>
        </div>
      )}
    </Modal>
  );
}
