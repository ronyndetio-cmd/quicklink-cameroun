import { useMemo } from 'react';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { PostCard } from '../components/PostCard';

export function MyTasks() {
  const { t } = useI18n();
  const { user, tasks, refreshAll, goTo } = useStore();
  const toast = useToast();

  const myTasks = useMemo(() => tasks.filter((x) => x.postedBy === user?.id), [tasks, user]);

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
    <div className="mx-auto max-w-xl py-2">
      <button
        onClick={() => goTo('profile')}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-600 hover:text-brand-700"
      >
        <ArrowLeft size={15} />
        {t('back')}
      </button>

      <h1 className="mb-5 text-center font-display text-2xl text-ink-900">{t('postedTasks')}</h1>

      {myTasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <ClipboardList size={26} className="text-ink-300" />
          <p className="text-[13.5px] text-ink-500">{t('myPostsEmpty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myTasks.map((task, i) => (
            <PostCard key={task.id} post={task} index={i} onDelete={deleteTask} />
          ))}
        </div>
      )}
    </div>
  );
}
