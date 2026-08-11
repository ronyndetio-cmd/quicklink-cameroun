import { useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useStore } from '../../store';
import { Icon, Input, Modal, Pill } from '../ui';
import { CITIES, CITY_COUNT, REGIONS } from '../../data/cities';

export function CitiesModal() {
  const { t, lang } = useI18n();
  const { citiesOpen, setCitiesOpen, categories: rawCategories, goTo } = useStore();
  const [q, setQ] = useState('');
  const [pickedCity, setPickedCity] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      [...rawCategories].sort((a, b) =>
        (lang === 'fr' ? a.nameFr ?? a.name : a.name).localeCompare(lang === 'fr' ? b.nameFr ?? b.name : b.name),
      ),
    [rawCategories, lang],
  );

  const grouped = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = query ? CITIES.filter((c) => c.name.toLowerCase().includes(query)) : CITIES;
    const map = new Map<string, typeof CITIES>();
    for (const c of filtered) {
      if (!map.has(c.region)) map.set(c.region, []);
      map.get(c.region)!.push(c);
    }
    for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name));
    return REGIONS.map((r) => [r, map.get(r) ?? []] as const).filter(([, list]) => list.length > 0);
  }, [q]);

  const close = () => {
    setCitiesOpen(false);
    setPickedCity(null);
    setQ('');
  };

  const applyCityOnly = (city: string) => {
    goTo('services', { city, category: '' });
    close();
  };

  const applyCityAndCategory = (city: string, category: string) => {
    goTo('services', { city, category });
    close();
  };

  return (
    <Modal open={citiesOpen} onClose={close} title={t('citiesTitle')} subtitle={t('citiesLead')} size="lg">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px] text-ink-500">
        <Pill tone="brand">{CITY_COUNT} {t('citiesLabel')}</Pill>
        <Pill tone="neutral">{REGIONS.length} {t('regionsLabel')}</Pill>
      </div>

      {!pickedCity && (
        <>
          <div className="relative mb-4">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchCity')} className="pl-10" />
          </div>
          <div className="max-h-[52vh] space-y-5 overflow-y-auto pr-1">
            {grouped.map(([region, list]) => (
              <div key={region}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-500">{region}</p>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setPickedCity(c.name)}
                      className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white dark:bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <MapPin size={11} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {pickedCity && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-lg text-ink-900">{pickedCity}</p>
            <button onClick={() => setPickedCity(null)} className="text-[12.5px] font-semibold text-brand-600 hover:underline">
              {t('back')}
            </button>
          </div>
          <p className="mb-3 text-[12.5px] font-semibold text-ink-600">{t('pickCategory')}</p>
          <div className="grid max-h-[44vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => applyCityAndCategory(pickedCity, c.id)}
                className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white dark:bg-surface p-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${c.color ?? '#1F7A8C'}1a`, color: c.color ?? '#1F7A8C' }}
                >
                  <Icon name={c.iconName} size={15} />
                </span>
                <span className="truncate text-[12.5px] font-medium text-ink-800">
                  {lang === 'fr' ? c.nameFr ?? c.name : c.name}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => applyCityOnly(pickedCity)}
            className="mt-3 w-full rounded-xl border border-ink-200 py-2.5 text-[12.5px] font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            {t('allGroups')} {pickedCity}
          </button>
        </div>
      )}
    </Modal>
  );
}
