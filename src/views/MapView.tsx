import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, MapPin } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { SectionHeading, Avatar, Button, Stars } from '../components/ui';
import { CategoryInput } from '../components/CategoryInput';
import { categoryColor, categoryLabel } from '../data/categories';
import { coordsFor } from '../lib/geo';

const DOUALA: [number, number] = [4.0511, 9.7679];

// Free, no-API-key tile sources — fine for a demo; a production deployment
// should move to an accounted provider (Mapbox, Maptiler, Google) per its ToS.
const LAYERS = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
} as const;

function taskIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50% 50% 50% 0;background:#3B82F6;border:2px solid white;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 16],
    popupAnchor: [0, -16],
  });
}

function FlyToGps({ gps }: { gps: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    // A close, street-level view so "recenter" clearly shows the user's spot —
    // they can zoom back out with the map's own controls afterwards.
    if (gps) map.flyTo([gps.lat, gps.lng], 15, { duration: 0.9 });
  }, [gps, map]);
  return null;
}

export function MapView() {
  const { t, lang } = useI18n();
  const { visibleProfessionals, visibleTasks, gps, homeCity, locating, locateMe, openProfile } = useStore();
  const [layer, setLayer] = useState<keyof typeof LAYERS>('streets');
  const [showTech, setShowTech] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [techCategory, setTechCategory] = useState('');
  const [taskCategory, setTaskCategory] = useState('');

  const techPins = useMemo(
    () =>
      showTech
        ? visibleProfessionals
            .filter((u) => !techCategory || (u.servicesOffered ?? []).includes(techCategory))
            .slice(0, 150)
            .map((u) => ({ user: u, ...coordsFor(u.city, u.area, u.id) }))
        : [],
    [visibleProfessionals, showTech, techCategory],
  );
  const taskPins = useMemo(
    () =>
      showTasks
        ? visibleTasks
            .filter((t) => t.lat && t.lng && (!taskCategory || t.category === taskCategory))
            .slice(0, 150)
        : [],
    [visibleTasks, showTasks, taskCategory],
  );

  const center: [number, number] = gps ? [gps.lat, gps.lng] : DOUALA;
  const icon = useMemo(taskIcon, []);

  return (
    <div>
      <SectionHeading eyebrow={t('navMap')} title={t('mapTitle')} lead={t('mapLead')} />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(Object.keys(LAYERS) as (keyof typeof LAYERS)[]).map((l) => (
          <button
            key={l}
            onClick={() => setLayer(l)}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              layer === l ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600'
            }`}
          >
            {t(l === 'streets' ? 'layerStreets' : l === 'light' ? 'layerLight' : 'layerSatellite')}
          </button>
        ))}
        <button
          onClick={() => setShowTech((v) => !v)}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
            showTech ? 'border-forest-400 bg-forest-50 text-forest-700' : 'border-ink-200 text-ink-500'
          }`}
        >
          {t('showTechnicians')} ({techPins.length})
        </button>
        <CategoryInput
          value={techCategory}
          onChange={setTechCategory}
          placeholder={t('searchCategory')}
          className="!h-[30px] w-40 rounded-full !text-[12px]"
        />
        <button
          onClick={() => setShowTasks((v) => !v)}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
            showTasks ? 'border-gold-400 bg-gold-50 text-gold-700' : 'border-ink-200 text-ink-500'
          }`}
        >
          {t('showTasks')} ({taskPins.length})
        </button>
        <CategoryInput
          value={taskCategory}
          onChange={setTaskCategory}
          placeholder={t('searchCategory')}
          className="!h-[30px] w-40 rounded-full !text-[12px]"
        />
        <button
          onClick={locateMe}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-[12px] font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <Crosshair size={12} />
          {locating ? t('locating') : t('recenter')}
        </button>
      </div>

      <div className="isolate relative aspect-[4/3] w-full overflow-hidden rounded-3xl sm:aspect-[16/9]">
        <MapContainer center={center} zoom={gps ? 15 : 6} scrollWheelZoom className="h-full w-full">
          <TileLayer key={layer} url={LAYERS[layer].url} attribution={LAYERS[layer].attribution} />
          <FlyToGps gps={gps} />

          {gps && (
            <>
              <CircleMarker center={[gps.lat, gps.lng]} radius={16} pathOptions={{ color: '#2E7480', fillColor: '#2E7480', fillOpacity: 0.12, weight: 0 }} />
              <CircleMarker center={[gps.lat, gps.lng]} radius={6} pathOptions={{ color: '#fff', fillColor: '#2E7480', fillOpacity: 1, weight: 2 }} />
            </>
          )}

          {techPins.map(({ user: pro, lat, lng }) => {
            const category = pro.servicesOffered?.[0];
            const color = category ? categoryColor(category) : '#2563EB';
            return (
              <CircleMarker
                key={pro.id}
                center={[lat, lng]}
                radius={8}
                pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 0.95, weight: 2 }}
                eventHandlers={{ click: () => openProfile(pro.id) }}
              >
                <Popup>
                  <div className="flex items-center gap-2">
                    <Avatar src={pro.avatarUrl} name={pro.name} size={32} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-ink-900">{pro.name}</p>
                      <p className="truncate text-[11.5px] text-ink-500">
                        {category ? categoryLabel(category, lang) : pro.specialty}
                      </p>
                      {pro.ratingCount > 0 && <Stars value={pro.ratingAvg} size={10} />}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => openProfile(pro.id)}>
                    {t('viewProfile')}
                  </Button>
                </Popup>
              </CircleMarker>
            );
          })}

          {taskPins.map((task) => (
            <Marker key={task.id} position={[task.lat, task.lng]} icon={icon}>
              <Popup>
                <p className="text-[13px] font-semibold text-ink-900">{task.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-ink-500">
                  <MapPin size={10} />
                  {task.area}, {task.city}
                </p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute left-3 top-3 z-[1000] flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink-700 shadow">
          <Avatar name={homeCity} size={16} />
          {homeCity}
        </div>
      </div>
    </div>
  );
}
