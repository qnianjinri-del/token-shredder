import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const assetsDir = resolve(root, 'docs/assets');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

mkdirSync(assetsDir, { recursive: true });

const assetPath = (...parts) => resolve(root, ...parts);
const outPath = (name) => resolve(assetsDir, name);

const dataUri = (relativePath) => {
  const filePath = assetPath(relativePath);
  const base64 = readFileSync(filePath).toString('base64');
  return `data:image/png;base64,${base64}`;
};

const hasCommand = (command) => {
  try {
    execFileSync('which', [command], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const findChrome = () => {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  for (const command of ['google-chrome', 'chromium', 'chromium-browser']) {
    if (hasCommand(command)) {
      return command;
    }
  }

  return null;
};

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const frame = {
  idle: dataUri('public/assets/shredder-frames-tight/0-idle.png'),
  feed: dataUri('public/assets/shredder-frames-tight/1-feed.png'),
  half: dataUri('public/assets/shredder-frames-tight/3-shred-50.png'),
  full: dataUri('public/assets/shredder-frames-tight/5-shred-full.png'),
  burst: dataUri('public/assets/shredder-frames-tight/6-burst.png'),
  pile: dataUri('public/assets/shredder-frames-tight/7-pile.png'),
};

const skins = [
  {
    label: 'Classic',
    image: frame.full,
  },
  {
    label: 'Chomp',
    image: dataUri('public/assets/skins/codex-chomp-frames/2.png'),
  },
  {
    label: 'Furnace',
    image: dataUri('public/assets/skins/token-furnace-frames/3.png'),
  },
  {
    label: 'Black Hole',
    image: dataUri('public/assets/skins/budget-black-hole-frames/3.png'),
  },
];

const styles = `
  .bg { fill: #070a16; }
  .panel { fill: rgba(15, 23, 42, 0.84); stroke: rgba(94, 234, 212, 0.35); stroke-width: 2; }
  .panel2 { fill: rgba(15, 23, 42, 0.68); stroke: rgba(148, 163, 184, 0.32); stroke-width: 2; }
  .ink { fill: #f8fafc; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .muted { fill: #cbd5e1; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .cyan { fill: #5eead4; }
  .lime { fill: #bef264; }
  .amber { fill: #fbbf24; }
  .caption { font-weight: 800; letter-spacing: 0; }
  .title { font-weight: 950; letter-spacing: 0; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
`;

const defs = `
  <defs>
    <linearGradient id="heroGrad" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#08111f"/>
      <stop offset="52%" stop-color="#10172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.22)" stroke-width="1"/>
    </pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#020617" flood-opacity="0.45"/>
    </filter>
  </defs>
`;

const svgShell = ({ width, height, content, extraStyle = '' }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Token Shredder launch asset">
  ${defs}
  <style>${styles}${extraStyle}</style>
  <rect width="${width}" height="${height}" fill="url(#heroGrad)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.85"/>
  <circle cx="${Math.round(width * 0.16)}" cy="${Math.round(height * 0.12)}" r="${Math.round(width * 0.22)}" fill="#14b8a6" opacity="0.13"/>
  <circle cx="${Math.round(width * 0.86)}" cy="${Math.round(height * 0.08)}" r="${Math.round(width * 0.18)}" fill="#fbbf24" opacity="0.11"/>
  ${content}
</svg>`;

const pill = (x, y, text, color = '#5eead4') => `
  <rect x="${x}" y="${y}" width="${text.length * 8 + 34}" height="34" rx="17" fill="rgba(15,23,42,0.78)" stroke="${color}" stroke-opacity="0.48"/>
  <text x="${x + 17}" y="${y + 23}" class="ink caption" font-size="14" fill="${color}">${escapeXml(text)}</text>
`;

const socialPreview = () =>
  svgShell({
    width: 1280,
    height: 640,
    content: `
      ${pill(68, 54, `macOS v${packageJson.version} · local-first`, '#bef264')}
      <text x="68" y="168" class="ink title" font-size="72">Token Shredder</text>
      <text x="72" y="224" class="muted caption" font-size="26">一个本机运行的 AI token 成本桌面宠物</text>
      <text x="72" y="264" class="muted caption" font-size="25">A tiny desktop pet that shreds AI token spend in real time.</text>
      <g transform="translate(72 326)">
        <rect width="472" height="74" rx="16" fill="#5eead4"/>
        <text x="26" y="47" class="title mono" font-size="24" fill="#020617">POST /usage → TOKEN chunks</text>
      </g>
      <g transform="translate(72 424)">
        ${pill(0, 0, 'No cloud', '#5eead4')}
        ${pill(136, 0, 'No prompt logging', '#bef264')}
        ${pill(344, 0, 'Editable pricing', '#fbbf24')}
      </g>
      <g filter="url(#shadow)">
        <rect x="760" y="72" width="410" height="470" rx="28" class="panel"/>
        <image href="${frame.full}" x="850" y="104" width="230" height="250" image-rendering="pixelated"/>
        <rect x="802" y="412" width="326" height="74" rx="14" fill="#020617" stroke="rgba(94,234,212,0.42)"/>
        <text x="830" y="448" class="ink title" font-size="25">$3.42 shredded</text>
        <text x="830" y="472" class="muted caption" font-size="14">3 full bills · 42% through the next one</text>
      </g>
    `,
  });

const gettingStarted = () =>
  svgShell({
    width: 1600,
    height: 900,
    content: `
      <text x="80" y="110" class="ink title" font-size="70">First real usage in 3 paths</text>
      <text x="84" y="158" class="muted caption" font-size="24">打开后台，从“开始”分区选择最短路径。失败时复制排查报告。</text>
      ${[
        ['1', 'No-key demo', '先看宠物动一次，不请求模型。', frame.feed],
        ['2', 'Copy to Codex', '把接入提示词发给 coding agent。', frame.half],
        ['3', 'POST /usage', '脚本有 token 数就直接上报。', frame.burst],
      ]
        .map(
          ([index, title, body, image], i) => `
            <g transform="translate(${80 + i * 500} 230)" filter="url(#shadow)">
              <rect width="430" height="520" rx="24" class="panel"/>
              <circle cx="54" cy="56" r="28" fill="#bef264"/>
              <text x="44" y="67" class="title" font-size="28" fill="#020617">${index}</text>
              <text x="90" y="68" class="ink title" font-size="32">${escapeXml(title)}</text>
              <text x="42" y="122" class="muted caption" font-size="20">${escapeXml(body)}</text>
              <rect x="48" y="160" width="334" height="260" rx="18" fill="#020617" stroke="rgba(94,234,212,0.25)"/>
              <image href="${image}" x="112" y="184" width="210" height="228" image-rendering="pixelated"/>
              <rect x="48" y="450" width="334" height="42" rx="10" fill="${i === 1 ? '#5eead4' : '#bef264'}"/>
              <text x="70" y="478" class="title" font-size="18" fill="#020617">${i === 0 ? 'Click 一键试玩' : i === 1 ? 'Copy prompt' : 'Send JSON usage'}</text>
            </g>
          `,
        )
        .join('')}
    `,
  });

const troubleshooting = () =>
  svgShell({
    width: 1600,
    height: 900,
    content: `
      <text x="78" y="110" class="ink title" font-size="68">When setup fails, show the next move</text>
      <text x="82" y="158" class="muted caption" font-size="24">Provider 测试失败后，不再只给一句“连接失败”。</text>
      <g transform="translate(80 220)" filter="url(#shadow)">
        <rect width="720" height="560" rx="26" class="panel"/>
        <text x="42" y="64" class="ink title" font-size="34">Provider troubleshooting card</text>
        ${[
          ['API Key / 权限', '401 / 403 / Unauthorized', '#fb7185'],
          ['模型或 endpoint', '404 / model not found', '#fbbf24'],
          ['限流或额度', '429 / quota / rate limit', '#fde047'],
          ['连接成功但无 usage', 'switch to POST /usage if needed', '#5eead4'],
        ]
          .map(
            ([title, detail, color], i) => `
              <g transform="translate(44 ${106 + i * 94})">
                <rect width="620" height="68" rx="14" fill="rgba(2,6,23,0.72)" stroke="${color}" stroke-opacity="0.55"/>
                <circle cx="34" cy="34" r="13" fill="${color}"/>
                <text x="64" y="30" class="ink title" font-size="20">${escapeXml(title)}</text>
                <text x="64" y="52" class="muted caption mono" font-size="15">${escapeXml(detail)}</text>
              </g>
            `,
          )
          .join('')}
        <rect x="44" y="498" width="260" height="42" rx="10" fill="#5eead4"/>
        <text x="66" y="526" class="title" font-size="18" fill="#020617">Copy no-secret report</text>
      </g>
      <g transform="translate(930 245)">
        <image href="${frame.burst}" x="0" y="0" width="360" height="390" image-rendering="pixelated"/>
        <text x="-70" y="450" class="ink title" font-size="34">No prompt logging</text>
        <text x="-70" y="492" class="muted caption" font-size="23">No API keys in reports · local-first</text>
      </g>
    `,
  });

const demoStoryboard = () =>
  svgShell({
    width: 960,
    height: 540,
    content: `
      <text x="50" y="72" class="ink title" font-size="48">Watch tokens become visible</text>
      <text x="54" y="108" class="muted caption" font-size="18">A local pet reacts only when usage arrives.</text>
      ${[
        ['Idle', frame.idle],
        ['Feed', frame.feed],
        ['Shred', frame.half],
        ['Burst', frame.burst],
      ]
        .map(
          ([label, image], i) => `
            <g transform="translate(${54 + i * 222} 150)" filter="url(#shadow)">
              <rect width="178" height="268" rx="20" class="panel2"/>
              <image href="${image}" x="15" y="24" width="148" height="160" image-rendering="pixelated"/>
              <text x="28" y="224" class="ink title" font-size="24">${escapeXml(label)}</text>
              <text x="28" y="250" class="muted caption" font-size="13">${i === 0 ? 'waits quietly' : i === 1 ? 'usage arrives' : i === 2 ? 'cost advances' : 'TOKEN drops'}</text>
            </g>
          `,
        )
        .join('')}
    `,
  });

const animatedDemo = () =>
  svgShell({
    width: 960,
    height: 540,
    extraStyle: `
      .demoFrame { animation: frameSwap 4.8s steps(1, end) infinite; opacity: 0; }
      .f0 { animation-delay: 0s; }
      .f1 { animation-delay: -3.6s; }
      .f2 { animation-delay: -2.4s; }
      .f3 { animation-delay: -1.2s; }
      @keyframes frameSwap {
        0%, 24.99% { opacity: 1; }
        25%, 100% { opacity: 0; }
      }
    `,
    content: `
      <text x="56" y="74" class="ink title" font-size="48">Tiny pet. Real usage.</text>
      <text x="60" y="112" class="muted caption" font-size="19">Send token counts to localhost and watch the desktop pet react.</text>
      <g transform="translate(86 154)" filter="url(#shadow)">
        <rect width="360" height="300" rx="26" class="panel"/>
        <image class="demoFrame f0" href="${frame.idle}" x="86" y="34" width="190" height="206" image-rendering="pixelated"/>
        <image class="demoFrame f1" href="${frame.feed}" x="86" y="34" width="190" height="206" image-rendering="pixelated"/>
        <image class="demoFrame f2" href="${frame.half}" x="86" y="34" width="190" height="206" image-rendering="pixelated"/>
        <image class="demoFrame f3" href="${frame.burst}" x="86" y="34" width="190" height="206" image-rendering="pixelated"/>
      </g>
      <g transform="translate(510 166)">
        <rect width="356" height="260" rx="18" fill="#020617" stroke="rgba(94,234,212,0.34)"/>
        <text x="26" y="46" class="mono caption" font-size="18" fill="#bef264">$ curl -X POST /usage</text>
        <text x="26" y="88" class="mono caption" font-size="17" fill="#cbd5e1">inputTokens: 120000</text>
        <text x="26" y="122" class="mono caption" font-size="17" fill="#cbd5e1">outputTokens: 45000</text>
        <text x="26" y="174" class="ink title" font-size="30">$0.70 shredded</text>
        <text x="26" y="214" class="muted caption" font-size="18">No cloud · no prompt logging</text>
      </g>
    `,
  });

const skinShowcase = () =>
  svgShell({
    width: 1600,
    height: 900,
    content: `
      <text x="78" y="112" class="ink title" font-size="72">Choose the pet that hurts best</text>
      <text x="82" y="160" class="muted caption" font-size="24">原创像素皮肤，展示同一个 token 花费反馈。</text>
      ${skins
        .map(
          (skin, i) => `
            <g transform="translate(${90 + i * 370} 250)" filter="url(#shadow)">
              <rect width="300" height="420" rx="26" class="panel"/>
              <image href="${skin.image}" x="42" y="44" width="216" height="250" image-rendering="pixelated" preserveAspectRatio="xMidYMid meet"/>
              <text x="40" y="348" class="ink title" font-size="30">${escapeXml(skin.label)}</text>
              <text x="40" y="382" class="muted caption" font-size="17">TOKEN spend visualized</text>
            </g>
          `,
        )
        .join('')}
    `,
  });

const writeSvg = (name, svg) => {
  const filePath = outPath(name);
  writeFileSync(filePath, svg);
  console.log(`wrote ${filePath}`);
  return filePath;
};

const renderSvgToPng = (svgPath, pngPath, width, height) => {
  const chrome = findChrome();

  if (!chrome) {
    console.log(`skip png render for ${basename(svgPath)}: Chrome or Chromium required`);
    return false;
  }

  const tmpDir = resolve(root, 'tmp/launch-assets-chrome');
  rmSync(tmpDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });
  rmSync(pngPath, { force: true });
  const result = spawnSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=1000',
    `--user-data-dir=${tmpDir}`,
    `--window-size=${width},${height}`,
    `--screenshot=${pngPath}`,
    `file://${svgPath}`,
  ], {
    encoding: 'utf8',
    timeout: 25_000,
  });
  if (!existsSync(pngPath)) {
    const reason = result.error instanceof Error ? result.error.message : result.stderr || 'Chrome screenshot missing';
    console.log(`skip png render for ${basename(svgPath)}: ${reason}`);
    return false;
  }
  console.log(`wrote ${pngPath}`);
  return true;
};

const convertPngToJpeg = (pngPath, jpgPath) => {
  if (process.platform !== 'darwin' || !hasCommand('sips') || !existsSync(pngPath)) {
    console.log(`skip jpg render for ${basename(pngPath)}: sips required`);
    return false;
  }

  execFileSync('sips', ['-s', 'format', 'jpeg', pngPath, '--out', jpgPath], {
    stdio: 'ignore',
  });
  console.log(`wrote ${jpgPath}`);
  return true;
};

const outputs = [
  {
    svg: 'token-shredder-social-preview.svg',
    png: 'token-shredder-social-preview.png',
    jpg: 'token-shredder-social-preview.jpg',
    width: 1280,
    height: 640,
    render: socialPreview,
  },
  {
    svg: 'token-shredder-getting-started.svg',
    png: 'token-shredder-getting-started.png',
    width: 1600,
    height: 900,
    render: gettingStarted,
  },
  {
    svg: 'token-shredder-troubleshooting.svg',
    png: 'token-shredder-troubleshooting.png',
    width: 1600,
    height: 900,
    render: troubleshooting,
  },
  {
    svg: 'token-shredder-demo-storyboard.svg',
    png: 'token-shredder-demo-storyboard.png',
    width: 960,
    height: 540,
    render: demoStoryboard,
  },
  {
    svg: 'token-shredder-demo-animated.svg',
    width: 960,
    height: 540,
    render: animatedDemo,
  },
  {
    svg: 'token-shredder-skins.svg',
    png: 'token-shredder-skins.png',
    width: 1600,
    height: 900,
    render: skinShowcase,
  },
];

for (const output of outputs) {
  const svgPath = writeSvg(output.svg, output.render());
  if (output.png) {
    const pngPath = outPath(output.png);
    const rendered = renderSvgToPng(svgPath, pngPath, output.width, output.height);
    if (rendered && output.jpg) {
      convertPngToJpeg(pngPath, outPath(output.jpg));
    }
  }
}
