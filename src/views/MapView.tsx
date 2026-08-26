import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ClipboardList, Crosshair, Layers, MapPin, Wrench } from 'lucide-react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { SectionHeading, Avatar, Button, Stars } from '../components/ui';
import { categoryColor, categoryLabel } from '../data/categories';
import { coordsFor, haversineKm } from '../lib/geo';

const DOUALA: [number, number] = [4.0511, 9.7679];

// Radius applied around the user's (real or default-Douala) location — only
// professionals and tasks within this distance show up on the map.
const MAP_RADIUS_KM = 7;

// Free, no-API-key tile sources — fine for a demo; a production deployment
// should move to an accounted provider (Mapbox, Maptiler, Google) per its ToS.
// "streets" is plain OpenStreetMap cartography, which already renders shop /
// restaurant / fuel / school icons at street-level zoom — the closest
// no-key equivalent to Google Maps' POI layer.
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

// Mapbox's "Streets" style — colorful, rounded cartography with buildings,
// residential streets, and place labels down to neighborhood/quarter level.
// Only offered as a pickable option once VITE_MAPBOX_TOKEN is set (see
// GO_LIVE.md) — see MAPBOX_AVAILABLE below; every other layer needs no
// account or key at all. The key always exists on LAYERS (with an empty
// url when unconfigured) purely so `keyof typeof LAYERS` stays a fixed,
// non-optional set of literals for TypeScript — it's never rendered as a
// choice or loaded as a tile source unless a token is actually present.
const LAYERS = {
  mapbox: {
    url: MAPBOX_TOKEN
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`
      : '',
    attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    preview: MAPBOX_TOKEN ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/5/17/15?access_token=${MAPBOX_TOKEN}` : '',
  },
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    preview: 'https://a.tile.openstreetmap.org/5/17/15.png',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    preview: 'https://a.basemaps.cartocdn.com/light_all/5/17/15.png',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    preview: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/15/17',
  },
} as const;

// The keys actually offered as a choice — "mapbox" only appears once a
// token is configured, so nobody picks a style that has no real tiles.
const LAYER_KEYS = (Object.keys(LAYERS) as (keyof typeof LAYERS)[]).filter((k) => k !== 'mapbox' || Boolean(MAPBOX_TOKEN));

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
    // A close, street-level view so "recenter" clearly shows the user's spot
    // (and lets the base map's own POI icons render) — they can zoom back
    // out with the map's own controls afterwards.
    if (gps) map.flyTo([gps.lat, gps.lng], 17, { duration: 0.9 });
  }, [gps, map]);
  return null;
}

/** Google-Maps-style single button: opens a small picker with a live preview of each style. */
function LayerPicker({
  layer,
  setLayer,
}: {
  layer: keyof typeof LAYERS;
  setLayer: (l: keyof typeof LAYERS) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const labelFor = (l: keyof typeof LAYERS) =>
    l === 'mapbox' ? t('layerMapbox') : l === 'streets' ? t('layerStreets') : l === 'light' ? t('layerLight') : t('layerSatellite');

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        <Layers size={13} />
        {labelFor(layer)}
      </button>

      {open && (
        <div className="a-rise absolute left-0 top-full z-[1100] mt-1.5 flex gap-2 rounded-2xl border border-ink-200 bg-white p-2.5 shadow-lift">
          {LAYER_KEYS.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLayer(l);
                setOpen(false);
              }}
              className={`w-24 overflow-hidden rounded-xl border-2 text-center transition-colors ${
                layer === l ? 'border-brand-500' : 'border-transparent hover:border-ink-200'
              }`}
            >
              <img src={LAYERS[l].preview} alt="" className="h-14 w-full object-cover" loading="lazy" />
              <span className="block whitespace-nowrap bg-ink-50 py-1 text-[10px] font-semibold text-ink-700">{labelFor(l)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MapView() {
  const { t, lang } = useI18n();
  const { visibleProfessionals, visibleTasks, gps, homeCity, locating, locateMe, openProfile, goTo } = useStore();
  const [layer, setLayer] = useState<keyof typeof LAYERS>(MAPBOX_TOKEN ? 'mapbox' : 'streets');

  function nearby<T>(items: T[], getCoords: (item: T) => { lat: number; lng: number }): T[] {
    if (!gps) return items.slice(0, 150);
    return items
      .map((item) => ({ item, ...getCoords(item) }))
      .filter(({ lat, lng }) => haversineKm(gps.lat, gps.lng, lat, lng) <= MAP_RADIUS_KM)
      .slice(0, 150)
      .map(({ item }) => item);
  }

  const techPins = useMemo(
    () => nearby(visibleProfessionals, (u) => coordsFor(u.city, u.area, u.id)).map((u) => ({ user: u, ...coordsFor(u.city, u.area, u.id) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleProfessionals, gps],
  );
  const taskPins = useMemo(
    () => nearby(visibleTasks.filter((t) => t.lat && t.lng), (t) => ({ lat: t.lat, lng: t.lng })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleTasks, gps],
  );

  const center: [number, number] = gps ? [gps.lat, gps.lng] : DOUALA;
  const icon = useMemo(taskIcon, []);

  return (
    <div>
      <SectionHeading eyebrow={t('navMap')} title={t('mapTitle')} lead={t('mapLead')} />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <LayerPicker layer={layer} setLayer={setLayer} />

        <button
          onClick={() => goTo('services', { city: homeCity })}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <Wrench size={13} />
          {t('navServices')} ({techPins.length})
        </button>
        <button
          onClick={() => goTo('tasks', { city: homeCity })}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <ClipboardList size={13} />
          {t('navTasks')} ({taskPins.length})
        </button>

        <button
          onClick={locateMe}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <Crosshair size={12} />
          {locating ? t('locating') : t('recenter')}
        </button>
      </div>

      <div className="isolate relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-3xl sm:aspect-[16/9] sm:h-auto sm:min-h-0">
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
