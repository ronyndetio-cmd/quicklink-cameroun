/**
 * All imagery in QuickLink is generated locally as SVG data URIs.
 * Nothing is fetched from a third-party image host, so avatars and work
 * samples render instantly, look consistent, and never 404 offline.
 */

const PALETTES: [string, string, string][] = [
  ['#0B1B22', '#1D4ED8', '#93C5FD'],
  ['#0F2A4A', '#2563EB', '#BFDBFE'],
  ['#1E3A8A', '#3B82F6', '#DBEAFE'],
  ['#123540', '#0EA5E9', '#7DD3FC'],
  ['#1E1B4B', '#4F46E5', '#C7D2FE'],
  ['#082F49', '#0284C7', '#7DD3FC'],
  ['#172554', '#60A5FA', '#EFF6FF'],
  ['#1E40AF', '#38BDF8', '#E0F2FE'],
];

export function hashOf(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function encode(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'QL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Portrait-style avatar: layered shoulders + head silhouette + initials monogram. */
export function avatarFor(name: string, seed = name): string {
  const h = hashOf(seed);
  const [dark, mid, light] = PALETTES[h % PALETTES.length];
  const initials = initialsOf(name);
  const rot = (h % 40) - 20;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${mid}"/>
        <stop offset="1" stop-color="${dark}"/>
      </linearGradient>
      <clipPath id="c"><circle cx="60" cy="60" r="60"/></clipPath>
    </defs>
    <g clip-path="url(#c)">
      <rect width="120" height="120" fill="url(#g)"/>
      <g transform="rotate(${rot} 60 60)" opacity="0.22">
        <circle cx="18" cy="22" r="34" fill="${light}"/>
        <circle cx="104" cy="96" r="26" fill="${light}"/>
      </g>
      <circle cx="60" cy="104" r="42" fill="${dark}" opacity="0.55"/>
      <circle cx="60" cy="48" r="22" fill="${dark}" opacity="0.55"/>
      <text x="60" y="70" text-anchor="middle" font-family="Georgia, serif"
        font-size="40" font-weight="600" fill="${light}" opacity="0.96">${initials}</text>
    </g>
  </svg>`;
  return encode(svg);
}

/** Wide "cover photo" band for profiles. */
export function coverFor(seed: string): string {
  const h = hashOf(seed + 'cover');
  const [dark, mid, light] = PALETTES[h % PALETTES.length];
  const bars = Array.from({ length: 9 }, (_, i) => {
    const x = i * 100 + (hashOf(seed + i) % 40);
    const w = 26 + (hashOf(seed + 'w' + i) % 46);
    return `<rect x="${x}" y="0" width="${w}" height="260" fill="${light}" opacity="${0.05 + (i % 4) * 0.03}"/>`;
  }).join('');
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 260">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${dark}"/><stop offset="0.6" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
    </linearGradient></defs>
    <rect width="900" height="260" fill="url(#g)"/>${bars}
    <circle cx="760" cy="60" r="120" fill="${light}" opacity="0.07"/>
  </svg>`;
  return encode(svg);
}

/** Category tile artwork — abstract "tool marks" over the category colour. */
export function categoryTile(categoryId: string, color: string): string {
  const h = hashOf(categoryId);
  const marks = Array.from({ length: 14 }, (_, i) => {
    const x = 20 + ((hashOf(categoryId + i) % 360) | 0);
    const y = 20 + ((hashOf(categoryId + 'y' + i) % 200) | 0);
    const r = 6 + (hashOf(categoryId + 'r' + i) % 26);
    const t = (h + i) % 3;
    if (t === 0) return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.22"/>`;
    if (t === 1) return `<rect x="${x}" y="${y}" width="${r * 2}" height="${r}" rx="${r / 2}" fill="#fff" opacity="0.12"/>`;
    return `<line x1="${x}" y1="${y}" x2="${x + r * 2}" y2="${y + r}" stroke="#fff" stroke-width="2" opacity="0.18"/>`;
  }).join('');
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#0B1B22"/>
    </linearGradient></defs>
    <rect width="400" height="240" fill="url(#g)"/>${marks}
  </svg>`;
  return encode(svg);
}

/**
 * "Work sample" image: a stylised job-site composition whose shapes vary by
 * category, so a plumbing gallery reads differently from a tailoring one.
 */
export function workPhoto(categoryId: string, index = 0, color = '#1F7A8C'): string {
  const seed = `${categoryId}-${index}`;
  const h = hashOf(seed);
  const sky = ['#0B1B22', '#123540', '#0F2A4A', '#172554'][h % 4];
  const horizon = 150 + (h % 40);
  const shapes: string[] = [];

  const kind = h % 5;
  if (kind === 0) {
    for (let i = 0; i < 5; i++) {
      const w = 40 + (hashOf(seed + i) % 70);
      const hh = 40 + (hashOf(seed + 'h' + i) % 110);
      shapes.push(
        `<rect x="${i * 78 + 10}" y="${horizon - hh}" width="${w}" height="${hh}" fill="${color}" opacity="${0.35 + i * 0.1}"/>`,
      );
    }
  } else if (kind === 1) {
    shapes.push(`<circle cx="200" cy="${horizon - 40}" r="70" fill="${color}" opacity="0.5"/>`);
    shapes.push(`<circle cx="200" cy="${horizon - 40}" r="42" fill="#fff" opacity="0.14"/>`);
    shapes.push(`<rect x="188" y="${horizon - 40}" width="24" height="110" rx="10" fill="${color}" opacity="0.7"/>`);
  } else if (kind === 2) {
    for (let i = 0; i < 7; i++) {
      shapes.push(
        `<rect x="${i * 56 + 6}" y="${60 + (hashOf(seed + i) % 50)}" width="46" height="${100 + (hashOf(seed + 'b' + i) % 60)}" rx="6" fill="${color}" opacity="${0.3 + (i % 3) * 0.18}"/>`,
      );
    }
  } else if (kind === 3) {
    shapes.push(`<path d="M0 ${horizon} L110 ${horizon - 90} L220 ${horizon} Z" fill="${color}" opacity="0.6"/>`);
    shapes.push(`<path d="M180 ${horizon} L300 ${horizon - 120} L400 ${horizon} Z" fill="${color}" opacity="0.4"/>`);
  } else {
    for (let i = 0; i < 18; i++) {
      const x = (hashOf(seed + 'x' + i) % 390) + 5;
      const y = (hashOf(seed + 'y' + i) % 180) + 20;
      shapes.push(`<rect x="${x}" y="${y}" width="34" height="34" rx="4" fill="${color}" opacity="${0.2 + (i % 5) * 0.12}" transform="rotate(${(i * 23) % 60} ${x + 17} ${y + 17})"/>`);
    }
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
    <defs>
      <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="${color}" stop-opacity="0.45"/>
      </linearGradient>
      <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0B1B22" stop-opacity="0.1"/><stop offset="1" stop-color="#0B1B22" stop-opacity="0.75"/>
      </linearGradient>
    </defs>
    <rect width="400" height="260" fill="url(#s)"/>
    ${shapes.join('')}
    <rect y="${horizon}" width="400" height="${260 - horizon}" fill="#0B1B22" opacity="0.5"/>
    <rect width="400" height="260" fill="url(#f)"/>
  </svg>`;
  return encode(svg);
}

/** Poster image attached to a task. */
export function taskPhoto(taskId: string, categoryId: string, color: string): string {
  return workPhoto(`${categoryId}-task-${taskId}`, hashOf(taskId) % 5, color);
}

let watermarkImg: HTMLCanvasElement | Promise<HTMLCanvasElement> | null = null;

/**
 * Lazily loads the logo once, keys out its white background so it can be
 * stamped as a genuinely transparent watermark (the source file is a flat
 * logo-on-white JPEG export, not a pre-cut PNG), and reuses the result for
 * every photo stamped afterwards.
 */
function loadWatermark(): Promise<HTMLCanvasElement> {
  if (watermarkImg instanceof HTMLCanvasElement) return Promise.resolve(watermarkImg);
  if (watermarkImg) return watermarkImg;
  watermarkImg = import('../assets/logo.png').then(
    (mod) =>
      new Promise<HTMLCanvasElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('canvas-unsupported'));
          ctx.drawImage(img, 0, 0);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const px = frame.data;
          for (let i = 0; i < px.length; i += 4) {
            // Near-white pixels become transparent; keep the logo's ink/blue.
            if (px[i] > 235 && px[i + 1] > 235 && px[i + 2] > 235) px[i + 3] = 0;
          }
          ctx.putImageData(frame, 0, 0);
          watermarkImg = canvas;
          resolve(canvas);
        };
        img.onerror = reject;
        img.src = mod.default;
      }),
  );
  return watermarkImg;
}

/**
 * Reads a user-picked file from local storage (phone gallery / camera roll),
 * re-encodes it as a downscaled JPEG, and stamps a small transparent
 * QuickLink watermark in the corner — every photo on the site should carry
 * one. Phone camera photos are routinely 3-8MB — at a projected ~2M users,
 * storing those raw would blow up both the request size and the database,
 * so capping the longest edge keeps every upload in the tens-of-KB range.
 */
export function readAndCompressImage(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('invalid-image'));
      img.onload = async () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas-unsupported'));
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const mark = await loadWatermark();
          const markW = Math.min(width * 0.32, 140);
          const markH = markW * (mark.height / mark.width);
          const pad = Math.max(8, width * 0.02);
          ctx.globalAlpha = 0.55;
          ctx.drawImage(mark, width - markW - pad, height - markH - pad, markW, markH);
          ctx.globalAlpha = 1;
        } catch {
          /* watermark is decorative — never block the upload on it */
        }

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
