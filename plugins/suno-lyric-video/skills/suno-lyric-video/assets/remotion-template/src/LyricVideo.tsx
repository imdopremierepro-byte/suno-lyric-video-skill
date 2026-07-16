import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';
import {LYRICS} from './lyrics';

type LyricVideoProps = {
  title: string;
  subtitle: string;
  artist: string;
};

const lyricCues = LYRICS.filter((cue) => !cue.isSection);

const LYRIC_OFFSET_SECONDS = 0;
const LYRIC_ROW_HEIGHT = 82;
const VISIBLE_RADIUS = 4;

type LyricLine = {
  start: number;
  end: number;
  text: string;
};

const lyricLines: LyricLine[] = lyricCues.map((cue, index) => ({
  start: cue.start,
  end: lyricCues[index + 1]?.start ?? cue.end + 4,
  text: cue.text
}));

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getCurrentBlockIndex = (time: number) => {
  if (time < lyricLines[0].start) {
    return -1;
  }

  const activeIndex = lyricLines.findIndex((line) => time >= line.start && time < line.end);
  if (activeIndex !== -1) {
    return activeIndex;
  }

  let latestIndex = 0;
  for (let index = 0; index < lyricLines.length; index += 1) {
    if (lyricLines[index].start <= time) {
      latestIndex = index;
    }
  }
  return latestIndex;
};

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

export const LyricVideo: React.FC<LyricVideoProps> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const lyricTime = time - LYRIC_OFFSET_SECONDS;
  const currentIndex = getCurrentBlockIndex(lyricTime);
  const current = currentIndex === -1 ? undefined : lyricLines[currentIndex];
  const blockStartFrame = ((current?.start ?? 0) + LYRIC_OFFSET_SECONDS) * fps;
  const blockEndFrame = ((current?.end ?? 4) + LYRIC_OFFSET_SECONDS) * fps;
  const lyricProgress = current
    ? clamp((frame - blockStartFrame) / Math.max(1, blockEndFrame - blockStartFrame), 0, 1)
    : 0;
  const easedProgress = easeOutCubic(lyricProgress);
  const visibleStart = Math.max(0, currentIndex - VISIBLE_RADIUS);
  const visibleEnd = Math.min(lyricLines.length, currentIndex + VISIBLE_RADIUS + 3);
  const visibleLines = lyricLines.slice(visibleStart, visibleEnd);

  return (
    <AbsoluteFill style={styles.stage}>
      <Audio src={staticFile('audio.mp3')} />

      <Img src={staticFile('album-cover.png')} style={styles.backdropImage} />
      <div style={styles.backdropWash} />
      <div style={styles.texture} />
      <div style={styles.lightVeil} />

      <header style={styles.header}>
        <div style={styles.title}>
          {title} - {subtitle}
        </div>
      </header>

      <main style={styles.layout}>
        <section style={styles.coverColumn}>
          <div style={styles.coverGlow} />
          <Img src={staticFile('album-cover.png')} style={styles.coverImage} />
          <div style={styles.coverMeta}>
            <span style={styles.coverTitle}>{title}</span>
            <span style={styles.coverSubtitle}>{subtitle}</span>
          </div>
        </section>

        <section style={styles.lyricPanel}>
          <div style={styles.lyricGlow} />
          <div style={styles.lyricRows}>
            {visibleLines.map((line, index) => {
              const absoluteIndex = visibleStart + index;
              const relative = absoluteIndex - currentIndex - easedProgress;
              const distance = Math.abs(relative);
              const isCurrent = absoluteIndex === currentIndex;
              const isPast = absoluteIndex < currentIndex;
              const opacity = isCurrent
                ? interpolate(frame, [blockStartFrame, blockStartFrame + 8], [0.78, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                  })
                : isPast
                  ? Math.max(0, 0.42 - distance * 0.18)
                  : Math.max(0.14, 0.78 - distance * 0.2);
              const scale = isCurrent ? 1.045 : 1 - Math.min(distance, 4) * 0.028;

              return (
                <div
                  key={`${line.text}-${absoluteIndex}`}
                  style={{
                    ...styles.lyricRow,
                    opacity,
                    transform: `translateY(${relative * LYRIC_ROW_HEIGHT}px) scale(${scale})`,
                    filter: distance > 3.4 ? 'blur(1.2px)' : 'none',
                    fontWeight: isCurrent ? 900 : 780
                  }}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </AbsoluteFill>
  );
};

const baseFont =
  '"Apple SD Gothic Neo", "Noto Sans KR", "Pretendard", Inter, system-ui, sans-serif';

const styles: Record<string, React.CSSProperties> = {
  stage: {
    background:
      'linear-gradient(112deg, #f39a43 0%, #f8c873 32%, #dcefc7 48%, #9ddcf3 72%, #e8fbff 100%)',
    color: '#172330',
    fontFamily: baseFont,
    overflow: 'hidden'
  },
  backdropImage: {
    position: 'absolute',
    inset: '-12%',
    width: '124%',
    height: '124%',
    objectFit: 'cover',
    filter: 'blur(52px) saturate(1.18) brightness(1.08)',
    opacity: 0.5,
    transform: 'scale(1.05)'
  },
  backdropWash: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, rgba(255, 138, 53, 0.72) 0%, rgba(255, 210, 132, 0.36) 41%, rgba(113, 207, 244, 0.58) 100%), radial-gradient(circle at 31% 48%, rgba(255,255,255,0.56), rgba(255,255,255,0.18) 34%, transparent 58%)'
  },
  texture: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.13) 1px, transparent 1px)',
    backgroundSize: '64px 64px',
    opacity: 0.2
  },
  lightVeil: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.28) 48%, rgba(255,255,255,0.12))',
    zIndex: 1
  },
  header: {
    position: 'absolute',
    top: 58,
    left: 120,
    right: 120,
    zIndex: 3,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none'
  },
  title: {
    color: '#ffffff',
    fontSize: 68,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: 0,
    textAlign: 'center',
    textShadow:
      '0 3px 8px rgba(31, 73, 91, 0.34), 0 16px 34px rgba(219, 109, 31, 0.24)'
  },
  layout: {
    position: 'absolute',
    inset: '96px 118px 96px',
    zIndex: 2,
    display: 'grid',
    gridTemplateColumns: '540px 1fr',
    gap: 96,
    alignItems: 'center'
  },
  coverColumn: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 680
  },
  coverGlow: {
    position: 'absolute',
    width: 560,
    height: 560,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.52), rgba(128, 222, 255, 0.2))',
    filter: 'blur(28px)',
    opacity: 0.82
  },
  coverImage: {
    position: 'relative',
    width: 530,
    height: 530,
    objectFit: 'cover',
    borderRadius: 6,
    boxShadow:
      '0 46px 94px rgba(45, 91, 108, 0.24), 0 22px 44px rgba(194, 100, 33, 0.2), 0 0 0 1px rgba(255,255,255,0.52)'
  },
  coverMeta: {
    position: 'relative',
    marginTop: 26,
    width: 530,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    color: '#ffffff',
    textShadow:
      '0 2px 5px rgba(28, 66, 82, 0.34), 0 10px 24px rgba(200, 99, 34, 0.24)'
  },
  coverTitle: {
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: 0
  },
  coverSubtitle: {
    fontSize: 24,
    fontWeight: 850,
    letterSpacing: 0,
    color: 'rgba(255,255,255,0.92)'
  },
  lyricPanel: {
    position: 'relative',
    height: 610,
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    overflow: 'hidden',
    maskImage: 'linear-gradient(to bottom, transparent 0%, #000 18%, #000 72%, transparent 100%)'
  },
  lyricGlow: {
    position: 'absolute',
    inset: '38px 8px 56px',
    background:
      'radial-gradient(ellipse at center, rgba(31, 91, 115, 0.2), rgba(31, 91, 115, 0.07) 42%, transparent 74%)',
    filter: 'blur(18px)',
    opacity: 0.9
  },
  lyricRows: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    willChange: 'transform'
  },
  lyricRow: {
    position: 'absolute',
    left: 0,
    top: -34,
    width: '100%',
    minHeight: 68,
    padding: '0 36px',
    color: 'rgba(255,255,255,0.98)',
    fontSize: 38,
    lineHeight: 1.22,
    letterSpacing: 0,
    textAlign: 'center',
    textShadow:
      '0 2px 5px rgba(22, 58, 74, 0.45), 0 8px 18px rgba(22, 58, 74, 0.36), 0 16px 34px rgba(219, 109, 31, 0.18)',
    textWrap: 'balance',
    transformOrigin: 'center center',
    willChange: 'transform, opacity, filter'
  }
};
