import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {basename, extname, join} from 'node:path';

const sourceDirName = process.env.SOURCE_DIR ?? '.';
const sourceDir = join(process.cwd(), sourceDirName);
const publicDir = join(process.cwd(), 'public');
const srtPath = join(publicDir, 'lyrics.srt');
const lrcPath = join(publicDir, 'lyrics.lrc');
const outputPath = join(process.cwd(), 'src', 'lyrics.ts');

const getFilesByExt = (dir, extension) => {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir)
    .filter((file) => extname(file).toLowerCase() === extension)
    .sort((a, b) => a.localeCompare(b, 'ko'));
};

const copyFirst = (extension, targetName, optional = false) => {
  const [sourceFile] = getFilesByExt(sourceDir, extension);
  const targetPath = join(publicDir, targetName);
  if (!sourceFile) {
    if (optional || existsSync(targetPath)) {
      return existsSync(targetPath) ? targetPath : undefined;
    }

    throw new Error(`No ${extension} file found in ${sourceDirName}/`);
  }

  const sourcePath = join(sourceDir, sourceFile);
  copyFileSync(sourcePath, targetPath);
  console.log(`Copied ${basename(sourcePath)} -> public/${targetName}`);
  return targetPath;
};

if (existsSync(sourceDir)) {
  mkdirSync(publicDir, {recursive: true});
  copyFirst('.mp3', 'audio.mp3', true);
  copyFirst('.srt', 'lyrics.srt', true);
  copyFirst('.lrc', 'lyrics.lrc', true);
}

if (!existsSync(join(publicDir, 'audio.mp3'))) {
  throw new Error(`No MP3 found in ${sourceDirName}/ or public/audio.mp3`);
}

if (!existsSync(srtPath) && !existsSync(lrcPath)) {
  throw new Error(`No SRT/LRC found in ${sourceDirName}/ or public/`);
}

const parseTime = (value) => {
  const match = value.trim().match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
  if (!match) {
    throw new Error(`Invalid SRT time: ${value}`);
  }

  const [, hours, minutes, seconds, millis] = match.map(Number);
  return hours * 3600 + minutes * 60 + seconds + millis / 1000;
};

const parseLrcTime = (value) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?$/);
  if (!match) {
    throw new Error(`Invalid LRC time: ${value}`);
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const fraction = match[3] ?? '0';
  const millis = Number(fraction.padEnd(3, '0').slice(0, 3));
  return minutes * 60 + seconds + millis / 1000;
};

const isSectionText = (text) =>
  /^(intro|verse|pre[- ]?chorus|chorus|hook|bridge|outro|final hook|interlude)(?:\s+\d+)?$/i.test(
    text.replace(/^\[(.+)\]$/, '$1').trim()
  );

const getSectionName = (text) => {
  const cleaned = text.trim();
  const bracketMatch = cleaned.match(/^\[(.+)\]$/);
  const section = bracketMatch ? bracketMatch[1].trim() : cleaned;
  return isSectionText(cleaned) ? section : undefined;
};

const parseSrt = () => {
  const srt = readFileSync(srtPath, 'utf8').replace(/\r\n/g, '\n').trim();
  const blocks = srt.split(/\n{2,}/);
  const cues = [];
  let currentSection = '';

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const timingIndex = lines.findIndex((line) => line.includes('-->'));

    if (timingIndex === -1) {
      continue;
    }

    const [startRaw, endRaw] = lines[timingIndex].split('-->').map((part) => part.trim());
    const text = lines.slice(timingIndex + 1).join(' ').trim();
    const sectionName = getSectionName(text);

    if (sectionName) {
      currentSection = sectionName;
    }

    cues.push({
      start: Number(parseTime(startRaw).toFixed(3)),
      end: Number(parseTime(endRaw).toFixed(3)),
      text,
      section: currentSection,
      isSection: Boolean(sectionName)
    });
  }

  return cues;
};

const parseLrc = () => {
  const lrc = readFileSync(lrcPath, 'utf8').replace(/\r\n/g, '\n').trim();
  const entries = [];
  let currentSection = '';

  for (const line of lrc.split('\n')) {
    const matches = [...line.matchAll(/\[([0-9:.]+)\]/g)];
    const text = line.replace(/\[[0-9:.]+\]/g, '').trim();

    if (matches.length === 0 || !text) {
      continue;
    }

    const sectionName = getSectionName(text);
    if (sectionName) {
      currentSection = sectionName;
    }

    for (const match of matches) {
      entries.push({
        start: Number(parseLrcTime(match[1]).toFixed(3)),
        text,
        section: currentSection,
        isSection: Boolean(sectionName)
      });
    }
  }

  return entries
    .sort((a, b) => a.start - b.start)
    .map((entry, index, all) => ({
      ...entry,
      end: Number(((all[index + 1]?.start ?? entry.start + 4) - 0.001).toFixed(3))
    }));
};

const cues = existsSync(srtPath) ? parseSrt() : parseLrc();

if (cues.length === 0) {
  throw new Error('No lyric cues found.');
}

const lastEnd = Math.max(...cues.map((cue) => cue.end));
const getAudioDuration = () => {
  try {
    const output = execFileSync('afinfo', [join(publicDir, 'audio.mp3')], {
      encoding: 'utf8'
    });
    const match = output.match(/estimated duration:\s*([0-9.]+)\s*sec/);
    return match ? Number(match[1]) : 0;
  } catch {
    return 0;
  }
};

const audioDuration = getAudioDuration();
const videoSeconds = Math.ceil(Math.max(lastEnd + 5, audioDuration + 1));
const fps = 30;

const generated = `export type LyricCue = {
  start: number;
  end: number;
  text: string;
  section: string;
  isSection: boolean;
};

export const FPS = ${fps};
export const VIDEO_SECONDS = ${videoSeconds};
export const DURATION_IN_FRAMES = ${videoSeconds * fps};

export const LYRICS: LyricCue[] = ${JSON.stringify(cues, null, 2)};
`;

writeFileSync(outputPath, generated);
console.log(`Wrote ${cues.length} cues to ${outputPath}`);
