import { useRef, useState } from 'react';
import { Camera, Eye, EyeOff, Lock, MessageCircle, Phone, User as UserIcon } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { api, ApiError } from '../api';
import { Avatar, Button, Field, Input } from '../components/ui';
import { CityInput } from '../components/CityInput';
import { Combobox } from '../components/Combobox';
import { useToast } from '../components/Toast';
import { readAndCompressImage } from '../lib/media';
import { relatedCategories } from '../lib/search';
import { slug } from '../lib/generator';
import type { CategoryOption, RoleType } from '../types';

const AUTO_COLORS = ['#1D4ED8', '#2563EB', '#3B82F6', '#0EA5E9', '#4F46E5', '#0284C7'];

function PasswordInput({
  value,
  onChange,
  placeholder,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={show ? 'text' : 'password'}
        placeholder={placeholder ?? '••••••••'}
        className="pl-10 pr-10"
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function Auth() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { afterAuth, categories, addCustomCategory } = useStore();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Douala');
  const [area, setArea] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [categoryText, setCategoryText] = useState('');
  const [roleType, setRoleType] = useState<RoleType>('client');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [specialtyError, setSpecialtyError] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const pickAvatar = async (file?: File) => {
    if (!file) return;
    try {
      setAvatarUrl(await readAndCompressImage(file, 640, 0.85));
      setAvatarError(false);
    } catch {
      toast.error(t('errGeneric'));
    }
  };

  const submitLogin = async () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 8) {
      toast.warning(t('phoneLabel'));
      return;
    }
    if (!password) {
      toast.warning(t('passwordLabel'));
      return;
    }
    setBusy(true);
    try {
      const user = await api.login(clean, password);
      afterAuth(user);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.localized('fr') : t('errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  /**
   * Resolves whatever the user typed to an existing category id, or — if
   * it's not close to anything already in the app — mints a brand new one
   * on the spot. There's no separate "add a category" admin flow anymore;
   * this is the only way new categories enter the app.
   */
  const resolveOrCreateCategory = (text: string): string | undefined => {
    const q = text.trim();
    if (!q) return undefined;
    const qNorm = q.toLowerCase();
    const exact = categories.find((c) => c.name.toLowerCase() === qNorm || c.nameFr?.toLowerCase() === qNorm);
    if (exact) return exact.id;
    const related = relatedCategories(q);
    if (related.length > 0) return related[0];

    const id = `custom-${slug(q).slice(0, 30)}-${Date.now().toString(36).slice(-4)}`;
    const color = AUTO_COLORS[Math.abs([...q].reduce((h, c) => h + c.charCodeAt(0), 0)) % AUTO_COLORS.length];
    const created: CategoryOption = {
      id,
      name: q,
      nameFr: q,
      iconName: 'Briefcase',
      color,
      subcategories: [],
      subcategoriesFr: [],
    };
    addCustomCategory(created);
    return id;
  };

  const submitSignup = async () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 8) {
      toast.warning(t('phoneLabel'));
      return;
    }
    if (!name.trim()) {
      toast.warning(t('nameLabel'));
      return;
    }
    if (!avatarUrl) {
      setAvatarError(true);
      toast.warning(t('photoRequired'));
      return;
    }
    if (password.length < 6) {
      toast.warning(t('passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      toast.warning(t('passwordMismatch'));
      return;
    }
    if (!specialty.trim()) {
      setSpecialtyError(true);
      toast.warning(t('professionRequired'));
      return;
    }
    setBusy(true);
    try {
      const categoryId = resolveOrCreateCategory(categoryText);
      const created = await api.createUser({
        name: name.trim(),
        phone: clean,
        whatsapp: whatsapp.replace(/\D/g, '') || undefined,
        password,
        city,
        area: area.trim() || 'Centre-ville',
        specialty: specialty.trim(),
        servicesOffered: categoryId ? [categoryId] : [],
        roleType,
        avatarUrl,
      });
      afterAuth(created);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.localized('fr') : t('errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  const categoryOptions = [...categories]
    .map((c) => (lang === 'fr' ? c.nameFr ?? c.name : c.name))
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="text-center">
        <h1 className="font-display text-2xl text-ink-900">{t('authTitle')}</h1>
        <p className="mt-1.5 text-[13.5px] text-ink-500">{t('authLead')}</p>
      </div>

      <div className="mt-6 mb-5 grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-1">
        <button
          onClick={() => setMode('login')}
          className={`rounded-lg py-2 text-[13px] font-semibold transition-colors ${
            mode === 'login' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
          }`}
        >
          {t('authLogin')}
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`rounded-lg py-2 text-[13px] font-semibold transition-colors ${
            mode === 'signup' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
          }`}
        >
          {t('authSignupTab')}
        </button>
      </div>

      {mode === 'login' && (
        <div className="space-y-4">
          <Field label={t('phoneLabel')} required>
            <div className="relative">
              <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="6 77 11 22 33"
                className="pl-10"
              />
            </div>
          </Field>
          <Field label={t('passwordLabel')} required>
            <PasswordInput value={password} onChange={setPassword} onKeyDown={(e) => e.key === 'Enter' && submitLogin()} />
          </Field>
          <Button variant="primary" size="lg" className="w-full" loading={busy} onClick={submitLogin}>
            {t('authLogin')}
          </Button>
          <p className="text-center text-[12.5px] text-ink-500">
            {t('noAccountYet')}{' '}
            <button onClick={() => setMode('signup')} className="font-semibold text-brand-600 hover:underline">
              {t('authSignupTab')}
            </button>
          </p>
        </div>
      )}

      {mode === 'signup' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="group relative shrink-0"
              aria-label={t('addPhoto')}
            >
              <Avatar src={avatarUrl} name={name || '?'} size={64} ring />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-brand-950/0 text-transparent transition-colors group-hover:bg-brand-950/50 group-hover:text-white">
                <Camera size={18} />
              </span>
              {avatarError && (
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickAvatar(e.target.files?.[0])}
            />
            <div className="min-w-0 flex-1">
              <p className={`text-[12.5px] font-semibold ${avatarError ? 'text-red-600' : 'text-ink-700'}`}>
                {t('photoRequired')}
              </p>
              <p className="text-[11.5px] text-ink-400">{t('photoHint')}</p>
            </div>
          </div>

          <Field label={t('nameLabel')} required>
            <div className="relative">
              <UserIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-10" placeholder="Ex. Arlette Ngando" />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('phoneLabel')} required>
              <div className="relative">
                <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="6 77 11 22 33"
                  className="pl-10"
                />
              </div>
            </Field>
            <Field label={t('whatsappLabel')} hint={t('whatsappHint')}>
              <div className="relative">
                <MessageCircle size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  inputMode="tel"
                  placeholder="6 77 11 22 33"
                  className="pl-10"
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('passwordLabel')} required>
              <PasswordInput value={password} onChange={setPassword} />
            </Field>
            <Field label={t('confirmPasswordLabel')} required>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('cityLabel')} required hint={t('cityMissing')}>
              <CityInput value={city} onChange={setCity} placeholder={t('customCity')} />
            </Field>
            <Field label={t('areaLabel')}>
              <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ex. Akwa" />
            </Field>
          </div>

          <Field label={t('professionLabel')} required hint={t('professionHint')}>
            <Input
              value={specialty}
              onChange={(e) => {
                setSpecialty(e.target.value);
                setSpecialtyError(false);
              }}
              placeholder={t('specialtyPlaceholder')}
              className={specialtyError ? '!border-red-400' : ''}
            />
          </Field>
          <Field label={t('categoryOptional')} hint={t('categoryAutoCreateHint')}>
            <Combobox value={categoryText} onChange={setCategoryText} options={categoryOptions} placeholder={t('searchCategory')} />
          </Field>

          <Field label={t('roleLabel')}>
            <div className="grid grid-cols-2 gap-2">
              {(['client', 'provider'] as RoleType[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleType(r)}
                  className={`rounded-xl border-2 py-2 text-[12.5px] font-semibold transition-colors ${
                    roleType === r ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-200 text-ink-600'
                  }`}
                >
                  {t(r === 'client' ? 'roleClient' : 'roleProvider')}
                </button>
              ))}
            </div>
          </Field>

          <Button variant="gold" size="lg" className="w-full" loading={busy} onClick={submitSignup}>
            {t('createAccount')}
          </Button>
          <p className="text-center text-[12.5px] text-ink-500">
            {t('alreadyHaveAccount')}{' '}
            <button onClick={() => setMode('login')} className="font-semibold text-brand-600 hover:underline">
              {t('authLogin')}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
