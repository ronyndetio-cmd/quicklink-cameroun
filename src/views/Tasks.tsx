import { useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { api, ApiError } from '../api';
import { useToast } from '../components/Toast';
import { Button, Field, Input, Modal, Select, SectionHeading, SkeletonCard, Textarea } from '../components/ui';
import { PostCard } from '../components/PostCard';
import { CityInput } from '../components/CityInput';
import { CategoryInput } from '../components/CategoryInput';
import type { Urgency } from '../types';

const URGENCIES: Urgency[] = ['urgent', 'today', 'this_week', 'flexible'];

export function Tasks() {
  const { t, lang } = useI18n();
  const { visibleTasks, loading, filters, setFilters, resetFilters, requireAuth, refreshAll, user } = useStore();
  const toast = useToast();
  const [postOpen, setPostOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('flexible');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const publish = () => {
    requireAuth(async (me) => {
      if (!title.trim() || !description.trim()) {
        toast.warning(t('titleLabel'));
        return;
      }
      setBusy(true);
      try {
        await api.createTask({
          postedBy: me.id,
          title: title.trim(),
          category,
          subCategory: subCategory.trim(),
          description: description.trim(),
          city: me.city,
          area: me.area,
          urgency,
        });
        await refreshAll();
        toast.success(t('taskPublished'));
        setPostOpen(false);
        setTitle('');
        setCategory('');
        setSubCategory('');
        setDescription('');
        setUrgency('flexible');
      } catch (e) {
        toast.error(e instanceof ApiError ? e.localized(lang) : t('errGeneric'));
      } finally {
        setBusy(false);
      }
    });
  };

  const deleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      await refreshAll();
      toast.success(t('postDeleted'));
    } catch {
      toast.error(t('errGeneric'));
    }
  };

  return (
    <div>
      <SectionHeading
        eyebrow={t('navTasks')}
        title={t('tasksTitle')}
        lead={t('tasksLead')}
        action={
          <Button
            variant="gold"
            size="sm"
            onClick={() => requireAuth(() => setPostOpen(true))}
          >
            <Plus size={14} />
            {t('postTask')}
          </Button>
        }
      />

      {/* filter bar */}
      <div className="mb-5 grid gap-2 rounded-2xl border border-ink-200 bg-white dark:bg-surface p-2 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
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
        <CategoryInput value={filters.category} onChange={(v) => setFilters({ category: v })} placeholder={t('categoryOptional')} className="h-10" />
        <Select value={filters.urgency} onChange={(e) => setFilters({ urgency: e.target.value as Urgency | '' })} className="h-10">
          <option value="">{t('urgencyLabel')}</option>
          {URGENCIES.map((u) => (
            <option key={u} value={u}>
              {t(u)}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setFilters({ nearMe: !filters.nearMe })}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
            filters.nearMe ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600'
          }`}
        >
          <SlidersHorizontal size={12} />
          {filters.nearMe ? t('nearMeOn') : t('nearMe')}
        </button>
        {(filters.query || filters.city || filters.category || filters.urgency || filters.nearMe) && (
          <button onClick={resetFilters} className="text-[12.5px] font-semibold text-brand-600 hover:underline">
            {t('cancel')}
          </button>
        )}
      </div>

      {/* feed */}
      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center">
          <p className="font-display text-lg text-ink-700">{t('noResults')}</p>
          <p className="mt-1 text-[13px] text-ink-500">{t('noResultsHint')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleTasks.map((task, i) => (
            <PostCard
              key={task.id}
              post={task}
              index={i}
              onDelete={task.postedBy === user?.id ? deleteTask : undefined}
            />
          ))}
        </div>
      )}

      <Modal open={postOpen} onClose={() => setPostOpen(false)} title={t('postTaskTitle')} size="md">
        <div className="space-y-3.5">
          <Field label={t('titleLabel')} required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('titlePlaceholder')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('categoryOptional')}>
              <CategoryInput value={category} onChange={setCategory} />
            </Field>
            <Field label={t('urgencyLabel')}>
              <Select value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)}>
                {URGENCIES.map((u) => (
                  <option key={u} value={u}>
                    {t(u)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label={t('subCategoryLabel')}>
            <Input value={subCategory} onChange={(e) => setSubCategory(e.target.value)} />
          </Field>
          <Field label={t('descriptionLabel')} required>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={4}
            />
          </Field>
          <Button variant="gold" size="lg" className="w-full" loading={busy} onClick={publish}>
            {t('publish')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
