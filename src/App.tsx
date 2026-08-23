import { useState } from 'react';
import {
  Bookmark,
  ClipboardList,
  Facebook,
  Globe,
  Grid3x3,
  Home,
  Instagram,
  Map as MapIcon,
  Menu,
  MessageCircleQuestion,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react';
import { I18nProvider, useI18n } from './i18n';
import { ToastProvider } from './components/Toast';
import { StoreProvider, useStore, type Section } from './store';
import { Avatar, Button, WhatsAppIcon } from './components/ui';
import { SUPPORT_WHATSAPP } from './types';
import { Hub } from './views/Hub';
import { Categories } from './views/Categories';
import { Tasks } from './views/Tasks';
import { Professionals } from './views/Professionals';
import { MapView } from './views/MapView';
import { Saved } from './views/Saved';
import { Profile } from './views/Profile';
import { ProfileEdit } from './views/ProfileEdit';
import { ProfileSettings } from './views/ProfileSettings';
import { MyTasks } from './views/MyTasks';
import { PublicProfile } from './views/PublicProfile';
import { Auth } from './views/Auth';
import { Support } from './views/Support';
import { UnlockModal } from './components/modals/UnlockModal';
import { CitiesModal } from './components/modals/CitiesModal';
import { ProfessionsModal } from './components/modals/ProfessionsModal';
import { InterestsModal } from './components/modals/InterestsModal';
import { Lightbox } from './components/modals/Lightbox';
import { VideoModal } from './components/modals/VideoModal';
import logoUrl from './assets/logo.png';

// The account chip on the right (once signed in) already opens the profile —
// no separate "My profile" nav entry, so there's only one way to get there.
const NAV: { id: Section; icon: typeof Home; key: 'navHub' | 'navCategories' | 'navTasks' | 'navServices' | 'navMap' | 'navSaved'; auth?: boolean }[] = [
  { id: 'hub', icon: Home, key: 'navHub' },
  { id: 'categories', icon: Grid3x3, key: 'navCategories' },
  { id: 'tasks', icon: ClipboardList, key: 'navTasks' },
  { id: 'services', icon: Wrench, key: 'navServices' },
  { id: 'map', icon: MapIcon, key: 'navMap' },
  { id: 'saved', icon: Bookmark, key: 'navSaved' },
];

function Logo() {
  const { goTo } = useStore();
  return (
    <button onClick={() => goTo('hub')} className="flex shrink-0 items-center">
      <img src={logoUrl} alt="QuickLink Cameroun" className="h-9 w-auto object-contain sm:h-10" />
    </button>
  );
}

function NavLink({
  n,
  active,
  onClick,
  block,
}: {
  n: (typeof NAV)[number];
  active: boolean;
  onClick: () => void;
  block?: boolean;
}) {
  const { t } = useI18n();
  const NavIcon = n.icon;
  if (block) {
    return (
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold transition-colors ${
          active ? 'bg-brand-950 text-white' : 'text-ink-600 hover:bg-ink-100'
        }`}
      >
        <NavIcon size={16} />
        {t(n.key)}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
        active ? 'bg-brand-950 text-white' : 'text-ink-600 hover:bg-ink-100'
      }`}
    >
      <NavIcon size={14} />
      {t(n.key)}
    </button>
  );
}

function Header() {
  const { t, lang, toggle } = useI18n();
  const { section, goTo, user } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (n: (typeof NAV)[number]) => {
    setMobileOpen(false);
    goTo(n.id);
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Logo />

        <nav className="no-scrollbar ml-auto hidden items-center gap-1 overflow-x-auto whitespace-nowrap md:flex">
          {NAV.map((n) => (
            <NavLink key={n.id} n={n} active={section === n.id} onClick={() => go(n)} />
          ))}
        </nav>

        <div className="flex items-center gap-1.5 max-md:ml-auto">
          <button
            onClick={toggle}
            className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1.5 text-[12px] font-semibold text-ink-600 transition-colors hover:border-brand-300"
            aria-label={t('language')}
          >
            <Globe size={13} />
            {lang.toUpperCase()}
          </button>

          {user ? (
            <button
              onClick={() => goTo('profile')}
              className="hidden items-center gap-1.5 rounded-full border border-ink-200 py-1 pl-1 pr-2.5 transition-colors hover:border-brand-300 sm:flex"
            >
              <Avatar src={user.avatarUrl} name={user.name} size={26} />
              <span className="hidden max-w-[8rem] truncate text-[12.5px] font-semibold text-ink-800 md:inline">
                {user.name}
              </span>
            </button>
          ) : (
            <Button variant="primary" size="sm" className="hidden sm:inline-flex" onClick={() => goTo('auth')}>
              {t('signIn')}
            </Button>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-full border border-ink-200 p-2 text-ink-700 md:hidden"
            aria-label={t('menu')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {mobileOpen && (
            <button
              aria-hidden
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 cursor-default md:hidden"
            />
          )}

          {mobileOpen && (
            <div className="a-rise absolute right-0 top-full z-50 mt-2 w-64 max-w-[80vw] rounded-2xl border border-ink-200 bg-white p-3 shadow-lift md:hidden">
              <nav className="flex flex-col gap-1">
                {NAV.map((n) => (
                  <NavLink key={n.id} n={n} active={section === n.id} onClick={() => go(n)} block />
                ))}
              </nav>
              <div className="mt-3 border-t border-ink-100 pt-3">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        goTo('profile');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold text-ink-600 hover:bg-ink-100"
                    >
                      <Avatar src={user.avatarUrl} name={user.name} size={22} />
                      <span className="truncate">{user.name}</span>
                    </button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false);
                      goTo('auth');
                    }}
                  >
                    {t('signIn')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useI18n();
  const { goTo, setCitiesOpen, setProfessionsOpen } = useStore();
  return (
    <footer className="mt-10 bg-brand-950">
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:grid-cols-3 sm:px-6">
        <div>
          <img src={logoUrl} alt="QuickLink Cameroun" className="h-6 w-auto object-contain brightness-0 invert" />
          <div className="mt-2.5 flex items-center gap-2">
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}`}
              target="_blank"
              rel="noopener"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={14} />
            </a>
            {/* Facebook & Instagram keep their real brand colors, not the app's accent. */}
            <a
              href="#"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
              style={{ backgroundColor: '#1877F2' }}
              aria-label="Facebook"
            >
              <Facebook size={13} />
            </a>
            <a
              href="#"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
              style={{ background: 'radial-gradient(circle at 30% 110%, #FDF497 0%, #FDF497 5%, #FD5949 45%, #D6249F 60%, #285AEB 90%)' }}
              aria-label="Instagram"
            >
              <Instagram size={13} />
            </a>
          </div>
        </div>

        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/40">{t('footerExplore')}</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-white/70">
            <li><button onClick={() => goTo('tasks')} className="hover:text-white hover:underline">{t('navTasks')}</button></li>
            <li><button onClick={() => goTo('services')} className="hover:text-white hover:underline">{t('navServices')}</button></li>
            <li><button onClick={() => goTo('map')} className="hover:text-white hover:underline">{t('navMap')}</button></li>
            <li><button onClick={() => setCitiesOpen(true)} className="hover:text-white hover:underline">{t('quickCities')}</button></li>
            <li><button onClick={() => setProfessionsOpen(true)} className="hover:text-white hover:underline">{t('quickProfessions')}</button></li>
            <li><button onClick={() => goTo('profile')} className="hover:text-white hover:underline">{t('navProfile')}</button></li>
          </ul>
        </div>

        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/40">{t('footerSafety')}</p>
          <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed text-white/50">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-forest-400" />
            {t('safetyNotice')}
          </p>
        </div>
      </div>
      <div className="px-4 py-2.5 sm:px-6">
        <p className="mx-auto max-w-6xl text-[10.5px] text-white/35">
          © {new Date().getFullYear()} {t('brand')} {t('brandSub')}. {t('footerRights')}
        </p>
      </div>
    </footer>
  );
}

function SupportButton() {
  const { t } = useI18n();
  const { goTo } = useStore();
  return (
    <button
      onClick={() => goTo('support')}
      className="fixed bottom-5 right-4 z-30 flex items-center gap-2 rounded-full bg-brand-950 px-4 py-3 text-[13px] font-semibold text-gold-300 shadow-lift transition-transform hover:scale-105 sm:right-6"
      aria-label={t('supportTitle')}
    >
      <MessageCircleQuestion size={17} />
      <span className="hidden sm:inline">{t('supportTitle')}</span>
    </button>
  );
}

function Main() {
  const { section, profileId } = useStore();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {profileId ? (
        <div key={`profile-${profileId}`} className="a-rise">
          <PublicProfile id={profileId} />
        </div>
      ) : (
        <div key={section} className="a-rise">
          {section === 'hub' && <Hub />}
          {section === 'categories' && <Categories />}
          {section === 'tasks' && <Tasks />}
          {section === 'services' && <Professionals />}
          {section === 'map' && <MapView />}
          {section === 'saved' && <Saved />}
          {section === 'profile' && <Profile />}
          {section === 'profileEdit' && <ProfileEdit />}
          {section === 'profileSettings' && <ProfileSettings />}
          {section === 'myTasks' && <MyTasks />}
          {section === 'auth' && <Auth />}
          {section === 'support' && <Support />}
        </div>
      )}
    </main>
  );
}

function Shell() {
  const { section, profileId } = useStore();
  const showFooter = section === 'hub' && !profileId;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Main />
      {showFooter && <Footer />}
      <SupportButton />

      <UnlockModal />
      <CitiesModal />
      <ProfessionsModal />
      <InterestsModal />
      <VideoModal />
      <Lightbox />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <StoreProvider>
          <Shell />
        </StoreProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
