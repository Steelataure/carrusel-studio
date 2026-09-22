import fs from 'fs';
import path from 'path';

const TRACKS_TO_DOWNLOAD = [
  {
    name: 'montagem-pr-funk.mp3',
    url: 'https://archive.org/download/montagem-pr-funk_202405/MONTAGEM%20-%20PR%20FUNK.mp3',
  },
  {
    name: 'orquestra-maldita.mp3',
    url: 'https://archive.org/download/orquestra-maldita-brazilian-phonk-320kbps/ORQUESTRA%20MALDITA%20%28BRAZILIAN%20PHONK%29_320kbps.mp3',
  },
  {
    name: 'gigachad-phonk.mp3',
    url: 'https://archive.org/download/soundcloud-1412271310/1412271310.mp3',
  },
  {
    name: 'tech-edm-pulse.mp3',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/EDM%20Detection%20Mode.mp3',
  },
  {
    name: 'cyberpunk-synthwave.mp3',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Super%20Power%20Cool%20Dude.mp3',
  },
  {
    name: 'cloud-dancer-house.mp3',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cloud%20Dancer.mp3',
  },
  {
    name: 'wall-street-groove.mp3',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hitman.mp3',
  },
  {
    name: 'crypto-volatile-rush.mp3',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Volatile%20Reaction.mp3',
  },
  {
    name: 'business-cut-and-run.mp3',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cut%20and%20Run.mp3',
  },
  {
    name: 'lofi-chill-groove.mp3',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Groove%20Grove.mp3',
  },
  {
    name: 'kick-shock-upbeat.mp3',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Kick%20Shock.mp3',
  },
  {
    name: 'daily-beetle-chill.mp3',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Daily%20Beetle.mp3',
  },
];

const destDir = path.resolve(process.cwd(), 'public', 'audio');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function downloadFile(track) {
  const destPath = path.join(destDir, track.name);
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
    console.log(`[SKIP] ${track.name} already exists (${(fs.statSync(destPath).size / 1024).toFixed(0)} KB)`);
    return true;
  }

  console.log(`[DOWNLOADING] ${track.name} from ${track.url}...`);
  try {
    const res = await fetch(track.url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!res.ok) {
      console.error(`[ERROR] HTTP ${res.status} for ${track.name}`);
      return false;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 5000) {
      console.error(`[ERROR] File too small (${buffer.length} bytes) for ${track.name}`);
      return false;
    }

    fs.writeFileSync(destPath, buffer);
    console.log(`[SUCCESS] ${track.name} saved (${(buffer.length / 1024).toFixed(0)} KB)`);
    return true;
  } catch (err) {
    console.error(`[FAIL] ${track.name}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('Starting MP3 downloads into public/audio/...');
  for (const track of TRACKS_TO_DOWNLOAD) {
    await downloadFile(track);
  }
  console.log('All downloads processed!');
}

main();
