import {ImageResponse} from 'next/og';
import {routing} from '@/i18n/routing';

// Branded share image (link preview) — the boutique's own peony + lily art on a
// soft magic-wash gradient. Pure inline SVG, so no fonts/external assets needed.
export const alt = 'Remasia — a little flower boutique';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

const PEONY = 'M0 0 C -14 -6 -19 -26 -12 -40 C -9 -47 -4 -45 0 -49 C 4 -45 9 -47 12 -40 C 19 -26 14 -6 0 0 Z';
const LILY = 'M0 0 C 11 -14 13 -38 6 -56 C 4 -62 1 -64 0 -64 C -1 -64 -4 -62 -6 -56 C -13 -38 -11 -14 0 0 Z';

function ring(count: number, base: number, scale: number, fill: string) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const jA = Math.sin(i * 2.3 + base) * 4;
    const jS = 0.94 + ((Math.sin(i * 1.7 + base) + 1) / 2) * 0.12;
    s += `<path d="${PEONY}" fill="${fill}" transform="rotate(${base + (360 / count) * i + jA}) scale(${(scale * jS).toFixed(3)})"/>`;
  }
  return s;
}
function peony(cx: number, cy: number, sc: number, op = 1) {
  const g = ring(9, 0, 1.18, 'url(#po)') + ring(9, 20, 0.92, 'url(#pm)') + ring(8, 8, 0.66, 'url(#pi)') + ring(7, 26, 0.42, 'url(#pc)');
  return `<g opacity="${op}" transform="translate(${cx} ${cy}) scale(${sc})">${g}<circle r="6" fill="#c21c4c" opacity="0.9"/><circle r="3" fill="#ffd9e8"/></g>`;
}
function lily(cx: number, cy: number, sc: number, rot: number, op = 1) {
  let s = '';
  [60, 180, 300].forEach((r) => {
    s += `<path d="${LILY}" fill="url(#lb)" stroke="#ffd0e3" stroke-width="0.8" transform="rotate(${r}) scale(0.9)"/>`;
  });
  [0, 120, 240].forEach((r) => {
    s += `<path d="${LILY}" fill="url(#lt)" stroke="#ffc2da" stroke-width="0.8" transform="rotate(${r})"/>`;
  });
  return `<g opacity="${op}" transform="translate(${cx} ${cy}) scale(${sc}) rotate(${rot})">${s}<circle r="3.4" fill="#ffe7f0"/></g>`;
}
function petal(cx: number, cy: number, sc: number, rot: number, op: number) {
  return `<path d="${PEONY}" fill="#ff9ec2" opacity="${op}" transform="translate(${cx} ${cy}) rotate(${rot}) scale(${sc})"/>`;
}

function cardSvg() {
  const defs =
    '<defs>' +
    '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7fb"/><stop offset="0.52" stop-color="#ffeaf3"/><stop offset="1" stop-color="#f6d8e6"/></linearGradient>' +
    '<radialGradient id="w1"><stop offset="0" stop-color="#ffc9e0" stop-opacity="0.9"/><stop offset="1" stop-color="#ffc9e0" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="w2"><stop offset="0" stop-color="#e3d4ff" stop-opacity="0.85"/><stop offset="1" stop-color="#e3d4ff" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="glow"><stop offset="0" stop-color="#ffb8d5" stop-opacity="0.7"/><stop offset="1" stop-color="#ffb8d5" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="po" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#fff4f9"/><stop offset="1" stop-color="#ffbdda"/></linearGradient>' +
    '<linearGradient id="pm" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#ffd2e6"/><stop offset="1" stop-color="#ff93bb"/></linearGradient>' +
    '<linearGradient id="pi" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#ffa9cc"/><stop offset="1" stop-color="#f06a9e"/></linearGradient>' +
    '<linearGradient id="pc" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#ec5f93"/><stop offset="1" stop-color="#c21c4c"/></linearGradient>' +
    '<linearGradient id="lt" x1="0.5" y1="1" x2="0.5" y2="0"><stop offset="0" stop-color="#ffd0e3"/><stop offset="0.5" stop-color="#ffeef5"/><stop offset="1" stop-color="#fffcfd"/></linearGradient>' +
    '<linearGradient id="lb" x1="0.5" y1="1" x2="0.5" y2="0"><stop offset="0" stop-color="#ffdcea"/><stop offset="1" stop-color="#fff7fb"/></linearGradient>' +
    '</defs>';

  const flora =
    petal(150, 110, 1.0, 30, 0.5) + petal(1080, 120, 1.1, 120, 0.45) + petal(120, 500, 0.9, 200, 0.4) +
    petal(1100, 520, 1.2, -20, 0.45) + petal(620, 60, 0.8, 60, 0.4) + petal(1010, 320, 0.8, 10, 0.4) +
    lily(360, 215, 1.7, -16, 0.95) + lily(852, 205, 1.6, 18, 0.95) + lily(610, 100, 1.35, 0, 0.9) +
    peony(330, 415, 2.0, 0.92) + peony(885, 405, 2.2, 0.95) +
    peony(600, 300, 4.0, 1);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">` +
    defs +
    `<rect width="1200" height="630" fill="url(#bg)"/>` +
    `<ellipse cx="900" cy="200" rx="460" ry="380" fill="url(#w1)"/>` +
    `<ellipse cx="170" cy="540" rx="380" ry="320" fill="url(#w2)"/>` +
    `<circle cx="600" cy="300" r="290" fill="url(#glow)"/>` +
    flora +
    `<rect x="28" y="28" width="1144" height="574" rx="36" fill="none" stroke="#c9184a" stroke-opacity="0.18" stroke-width="2"/>` +
    `</svg>`
  );
}

export default function Image() {
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(cardSvg()).toString('base64')}`;
  return new ImageResponse(
    (
      <div style={{display: 'flex', width: '100%', height: '100%'}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={1200} height={630} alt="" />
      </div>
    ),
    {...size}
  );
}
