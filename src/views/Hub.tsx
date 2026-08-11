import { useMemo, useState } from 'react';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { Button, Card, Icon, SectionHeading, SeeAllLink, SkeletonCard } from '../components/ui';
import { PostCard } from '../components/PostCard';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { Reveal } from '../components/Reveal';
import { CityInput } from '../components/CityInput';
import { CategoryInput } from '../components/CategoryInput';
import heroBgUrl from '../assets/hero-bg.jpg';

export function Hub() {
  const { t, lang } = useI18n();
  const {
    visibleTasks,
    visibleProfessionals,
    tasks,
    loading,
    goTo,
    categories,
    homeCity,
    distanceTo,
  } = useStore();

  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [cat, setCat] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    goTo('services', { query: q, city, category: cat });
  };

  const urgent = useMemo(
    () =>
      [...tasks]
        .filter((task) => task.urgency === 'urgent' || task.urgency === 'today')
        .sort((a, b) => (distanceTo(a) ?? 1e9) - (distanceTo(b) ?? 1e9))
        .slice(0, 3),
    [tasks, distanceTo],
  );

  const nearbyPros = useMemo(() => visibleProfessionals.slice(0, 3), [visibleProfessionals]);

  return (
    <div className="space-y-14">
      {/* ---------------------------- hero ---------------------------- */}
      <section
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-8 flex min-h-[calc(100vh-3.5rem)] w-screen items-center overflow-hidden px-5 py-16 sm:px-10 sm:py-24"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(11,27,34,0.72), rgba(11,27,34,0.82)), url(${heroBgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <h1 className="a-rise max-w-3xl text-balance font-display text-[40px] font-extrabold leading-[1.05] text-white sm:text-[60px]">
            {t('heroTitle')}{' '}
            <span className="text-gold-400">{t('heroTitleAccent')}</span>
          </h1>
          <p className="a-rise mt-5 max-w-xl text-[17px] font-medium leading-relaxed text-white/90 sm:text-[19px]">
            {t('heroLead')}
          </p>

          {/* integrated search panel */}
          <form
            onSubmit={submit}
            className="a-rise mt-8 grid w-full gap-2 rounded-2xl bg-white p-2 text-left shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl sm:grid-cols-[1.4fr_1fr_1fr_auto]"
          >
            <Input value={q} onChange={setQ} placeholder={t('searchPlaceholder')} ariaLabel={t('search')} />
            <CityInput value={city} onChange={setCity} placeholder={t('allCameroon')} className="h-11" />
            <CategoryInput value={cat} onChange={setCat} placeholder={t('searchCategory')} className="h-11" />
            <Button type="submit" variant="gold" size="lg" className="sm:px-7">
              {t('search')}
              <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      </section>

      {/* ------------------------ category strip ---------------------- */}
      <Reveal>
        <section>
          <div className="mb-3 flex justify-end">
            <SeeAllLink label={t('seeAll')} onClick={() => goTo('categories')} />
          </div>
          <div className="no-scrollbar -mx-1 flex gap-5 overflow-x-auto px-1 pb-2">
            {categories.slice(0, 14).map((c, i) => (
              <button
                key={c.id}
                onClick={() => goTo('services', { category: c.id, query: '' })}
                style={{ animationDelay: `${i * 30}ms` }}
                className="a-rise group flex w-[86px] shrink-0 flex-col items-center gap-2 text-center"
              >
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full ring-1 ring-inset ring-black/5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${c.color ?? '#2563EB'}18`, color: c.color ?? '#2563EB' }}
                >
                  <Icon name={c.iconName} size={24} />
                </span>
                <span className="text-[12.5px] font-semibold leading-tight text-ink-800">
                  {lang === 'fr' ? c.nameFr ?? c.name : c.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ------------------------ urgent tasks ------------------------ */}
      <Reveal>
        <section>
          <SectionHeading
            center
            eyebrow={t('urgent')}
            title={t('featuredUrgent')}
            lead={`${homeCity} · ${visibleTasks.length} ${t('tasksCount').toLowerCase()}`}
            action={<SeeAllLink label={t('seeAll')} onClick={() => goTo('tasks')} />}
          />
          <div className="grid gap-4">
            {loading
              ? [0, 1].map((i) => <SkeletonCard key={i} />)
              : urgent.map((task, i) => <PostCard key={task.id} post={task} index={i} />)}
          </div>
        </section>
      </Reveal>

      {/* --------------------- nearby professionals --------------------- */}
      <Reveal>
        <section>
          <SectionHeading
            center
            eyebrow={t('navServices')}
            title={t('featuredServices')}
            lead={`${visibleProfessionals.length} ${t('techniciansCount').toLowerCase()}`}
            action={<SeeAllLink label={t('seeAll')} onClick={() => goTo('services')} />}
          />
          <div className="grid gap-4">
            {loading
              ? [0, 1].map((i) => <SkeletonCard key={i} />)
              : nearbyPros.map((pro, i) => <ProfessionalCard key={pro.id} user={pro} index={i} />)}
          </div>
        </section>
      </Reveal>

      {/* --------------------------- pricing -------------------------- */}
      <Reveal>
        <Card className="overflow-hidden">
          <div className="grid sm:grid-cols-[1.2fr_1fr]">
            <div className="flex flex-col items-center p-6 text-center sm:p-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-500">
                {t('unlockTitle')}
              </span>
              <h3 className="mt-2 font-display text-2xl text-ink-900">{t('unlockLead')}</h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-600">
                <li className="flex items-start gap-2">
                  <TrendingUp size={16} className="mt-0.5 shrink-0 text-forest-500" />
                  {t('safetyNotice')}
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-gold-500" />
                  {t('poweredByFapshi')}
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 bg-gold-50 p-6 text-center sm:p-8">
              <div>
                <span className="font-display text-4xl font-semibold text-gold-600">250</span>
                <span className="ml-1.5 text-sm text-ink-500">FCFA</span>
              </div>
              <Button variant="gold" size="md" className="mt-2 w-full" onClick={() => goTo('services')}>
                {t('navServices')}
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
