import { useEffect, useState } from 'react';
import { MapPin, Play, Users } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useStore } from '../../store';
import { api } from '../../api';
import { Modal, Stars } from '../ui';
import type { InterestSignal } from '../../types';

export function InterestsModal() {
  const { t } = useI18n();
  const { interestsFor, setInterestsFor } = useStore();
  const [items, setItems] = useState<InterestSignal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!interestsFor) return;
    let cancelled = false;
    setLoading(true);
    api
      .listInterests({ postId: interestsFor.id })
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [interestsFor]);

  const close = () => setInterestsFor(null);

  return (
    <Modal open={Boolean(interestsFor)} onClose={close} title={t('interestedIn')} subtitle={interestsFor?.title} size="sm">
      {loading && <p className="py-6 text-center text-[13px] text-ink-500">{t('loading')}</p>}
      {!loading && items.length === 0 && (
        <div className="py-8 text-center">
          <Users size={28} className="mx-auto mb-2 text-ink-300" />
          <p className="text-[13px] text-ink-500">{t('noInterestYet')}</p>
        </div>
      )}
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white dark:bg-surface p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {i.userPreview.serviceType.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink-900">{i.userPreview.serviceType}</p>
              <p className="flex items-center gap-1 truncate text-[11.5px] text-ink-500">
                <MapPin size={10} />
                {i.userPreview.area}
              </p>
            </div>
            {i.userPreview.ratingCount > 0 && <Stars value={i.userPreview.ratingAvg} size={11} />}
            {i.userPreview.hasVideo && <Play size={13} className="shrink-0 text-gold-500" />}
          </div>
        ))}
      </div>
    </Modal>
  );
}
