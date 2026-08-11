import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useStore } from '../../store';
import { Input, Modal, Pill } from '../ui';
import { PROFESSIONS, PROFESSION_COUNT } from '../../data/professions';

export function ProfessionsModal() {
  const { t, lang } = useI18n();
  const { professionsOpen, setProfessionsOpen, goTo } = useStore();
  const [q, setQ] = useState('');

  const sorted = useMemo(
    () => [...PROFESSIONS].sort((a, b) => (lang === 'fr' ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0]))),
    [lang],
  );

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return sorted;
    return sorted.filter(([en, fr]) => en.toLowerCase().includes(query) || fr.toLowerCase().includes(query));
  }, [q, sorted]);

  const close = () => {
    setProfessionsOpen(false);
    setQ('');
  };

  const pick = (en: string, fr: string, category: string) => {
    goTo('services', { query: lang === 'fr' ? fr : en, category });
    close();
  };

  return (
    <Modal open={professionsOpen} onClose={close} title={t('professionsTitle')} subtitle={t('professionsLead')} size="lg">
      <div className="mb-4 flex items-center gap-2">
        <Pill tone="brand">{PROFESSION_COUNT}+</Pill>
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} className="pl-10" />
        </div>
      </div>
      <div className="grid max-h-[56vh] grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
        {list.map(([en, fr, category], i) => (
          <button
            key={`${en}-${i}`}
            onClick={() => pick(en, fr, category)}
            className="rounded-xl border border-ink-200 bg-white dark:bg-surface px-3 py-2.5 text-left text-[13px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            {lang === 'fr' ? fr : en}
          </button>
        ))}
      </div>
    </Modal>
  );
}
