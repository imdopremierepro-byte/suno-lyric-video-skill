import React from 'react';
import {Composition} from 'remotion';
import {DURATION_IN_FRAMES, FPS} from './lyrics';
import {LyricVideo} from './LyricVideo';

export const Root: React.FC = () => {
  return (
    <Composition
      id="LyricVideo"
      component={LyricVideo}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{
        title: 'PSALM',
        subtitle: '이로운',
        artist: 'Suno Music Album Automation'
      }}
    />
  );
};
