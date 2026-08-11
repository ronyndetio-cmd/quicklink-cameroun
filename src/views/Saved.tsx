import { useMemo } from 'react';
import { Bookmark } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { SectionHeading } from '../components/ui';
import { PostCard } from '../components/PostCard';

export function Saved() {
  const { t } = useI18n();
  const { saved, tasks } = useStore();

  const items = useMemo(
    () =>
      tasks
        .filter((x) => saved.has(x.id))
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [saved, tasks],
  );

  return (
    <div>
      <SectionHeading eyebrow={t('navSaved')} title={t('savedTitle')} lead={t('savedLead')} />
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center">
          <Bookmark size={26} className="mx-auto mb-2 text-ink-300" />
          <p className="text-[13.5px] text-ink-500">{t('savedEmpty')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((task, i) => (
            <PostCard key={task.id} post={task} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
