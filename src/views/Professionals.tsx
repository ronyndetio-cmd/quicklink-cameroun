import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { api } from '../api';
import { Input, SectionHeading, SkeletonCard } from '../components/ui';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { CityInput } from '../components/CityInput';
import { CategoryInput } from '../components/CategoryInput';
import type { User } from '../types';

/**
 * Every registered professional, in one directory — sourced straight from
 * user profiles (not separate "service" posts, which QuickLink doesn't have
 * — everyone just posts tasks). Sorted by live distance from the viewer, so
 * moving around actually changes who shows up first.
 */
export function Professionals() {
  const { t } = useI18n();
  const { filters, setFilters, resetFilters, user, distanceTo, gps } = useStore();
  const [remote, setRemote] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listUsers({
        city: filters.city || undefined,
        category: filters.category || undefined,
        search: filters.query || undefined,
        requestingUserId: user?.id,
      })
      .then((list) => {
        if (!cancelled) setRemote(list.filter((u) => u.roleType !== 'client'));
      })
      .catch(() => !cancelled && setRemote([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters.city, filters.category, filters.query, user?.id]);

  const list = (remote ?? [])
    .filter((u) => {
      if (!filters.nearMe) return true;
      const d = distanceTo(u);
      return d === null || d <= 30;
    })
    .sort((a, b) => (distanceTo(a) ?? 1e9) - (distanceTo(b) ?? 1e9));

  return (
    <div>
      <SectionHeading eyebrow={t('navServices')} title={t('servicesTitle')} lead={t('servicesLead')} />

      <div className="mb-5 grid gap-2 rounded-2xl bg-ink-50 p-2 sm:grid-cols-[1.6fr_1fr_1fr]">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
            placeholder={t('searchPlaceholder')}
            className="h-10 pl-9"
          />
        </div>
        <CityInput value={filters.city} onChange={(v) => setFilters({ city: v })} placeholder={t('allCameroon')} className="h-10" />
        <CategoryInput value={filters.category} onChange={(v) => setFilters({ category: v })} placeholder={t('searchCategory')} className="h-10" />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setFilters({ nearMe: !filters.nearMe })}
          disabled={!gps}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors disabled:opacity-40 ${
            filters.nearMe ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600'
          }`}
        >
          <SlidersHorizontal size={12} />
          {filters.nearMe ? t('nearMeOn') : t('nearMe')}
        </button>
        {(filters.query || filters.city || filters.category || filters.nearMe) && (
          <button onClick={resetFilters} className="text-[12.5px] font-semibold text-brand-600 hover:underline">
            {t('cancel')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center">
          <p className="font-display text-lg text-ink-700">{t('noResults')}</p>
          <p className="mt-1 text-[13px] text-ink-500">{t('noResultsHint')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((pro, i) => (
            <ProfessionalCard key={pro.id} user={pro} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
