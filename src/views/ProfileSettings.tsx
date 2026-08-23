import { ArrowLeft, Globe, HelpCircle, LogOut, Pencil } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { Card } from '../components/ui';

function MenuRow({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ink-50"
    >
      <span className="text-ink-500">{icon}</span>
      <span className="flex-1 text-[14.5px] font-medium text-ink-900">{label}</span>
      {value && <span className="text-[13px] text-ink-400">{value}</span>}
    </button>
  );
}

export function ProfileSettings() {
  const { t, lang, toggle } = useI18n();
  const { signOut, goTo } = useStore();

  return (
    <div className="mx-auto max-w-md py-2">
      <button
        onClick={() => goTo('profile')}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-600 hover:text-brand-700"
      >
        <ArrowLeft size={15} />
        {t('back')}
      </button>

      <h1 className="mb-5 text-center font-display text-2xl text-ink-900">{t('settingsLabel')}</h1>

      <div className="space-y-4">
        <Card className="divide-y divide-ink-100 overflow-hidden !p-0">
          <MenuRow icon={<Pencil size={17} />} label={t('editProfile')} onClick={() => goTo('profileEdit')} />
        </Card>

        <Card className="divide-y divide-ink-100 overflow-hidden !p-0">
          <MenuRow icon={<HelpCircle size={17} />} label={t('supportTitle')} onClick={() => goTo('support')} />
          <MenuRow icon={<Globe size={17} />} label={t('language')} value={lang === 'fr' ? 'Français' : 'English'} onClick={toggle} />
        </Card>

        <Card className="divide-y divide-ink-100 overflow-hidden !p-0">
          <MenuRow icon={<LogOut size={17} />} label={t('logout')} onClick={signOut} />
        </Card>
      </div>
    </div>
  );
}
