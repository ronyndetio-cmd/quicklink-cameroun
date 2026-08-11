import { useI18n } from '../i18n';
import { useStore } from '../store';
import { Icon } from '../components/ui';

export function Categories() {
  const { lang } = useI18n();
  const { categories, goTo } = useStore();

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c, i) => (
          <button
            key={c.id}
            onClick={() => goTo('services', { category: c.id, query: '' })}
            style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            className="a-rise group flex flex-col items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${c.color ?? '#2563EB'}1a`, color: c.color ?? '#2563EB' }}
            >
              <Icon name={c.iconName} size={20} />
            </span>
            <span className="text-[14px] font-semibold leading-tight text-ink-900">
              {lang === 'fr' ? c.nameFr ?? c.name : c.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
