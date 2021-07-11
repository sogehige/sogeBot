import { EntitySchema } from 'typeorm';

export interface OverlayMapperInterface {
  id: string;
  value: string | null;
  opts: null
}
export interface OverlayMapperEmotes {
  id: string;
  value: 'emotes';
  opts: null | {
    emotesSize: 1 | 2 | 3,
    maxEmotesPerMessage: number,
    animation: 'fadeup' | 'fadezoom' | 'facebook',
    animationTime: number,
  },
}

export interface OverlayMapperEmotesFireworks {
  id: string;
  value: 'emotesfireworks';
  opts: null | {
    emotesSize: 1 | 2 | 3,
    animationTime: number,
    numOfEmotesPerExplosion: number,
    numOfExplosions: number,
  },
}
export interface OverlayMapperEmotesExplode {
  id: string;
  value: 'emotesexplode';
  opts: null | {
    emotesSize: 1 | 2 | 3,
    animationTime: number,
    numOfEmotes: number,
  },
}

export interface OverlayMapperClipsCarousel {
  id: string;
  value: 'clipscarousel';
  opts: null | {
    customPeriod: number,
    numOfClips: number,
    volume: number,
  },
}

export interface OverlayMapperTTS {
  id: string;
  value: 'tts';
  opts: null | {
    voice: string,
    volume: number,
    rate: number,
    pitch: number,
    triggerTTSByHighlightedMessage: boolean,
  },
}

export interface OverlayMapperPolls {
  id: string;
  value: 'polls';
  opts: null | {
    theme: 'light' | 'dark' | 'Soge\'s green',
    hideAfterInactivity: boolean,
    inactivityTime: number,
    align: 'top' | 'bottom',
  },
}

export interface OverlayMapperOBSWebsocket {
  id: string;
  value: 'obswebsocket';
  opts: null | {
    allowedIPs: string[],
  },
}

export type OverlayMappers = OverlayMapperEmotes | OverlayMapperEmotesExplode | OverlayMapperEmotesFireworks | OverlayMapperPolls | OverlayMapperTTS | OverlayMapperInterface | OverlayMapperOBSWebsocket | OverlayMapperClipsCarousel;

export const OverlayMapper = new EntitySchema<Readonly<Required<OverlayMappers>>>({
  name:    'overlay_mapper',
  columns: {
    id: {
      type: String, primary: true, generated: 'uuid',
    },
    value: { type: String, nullable: true },
    opts:  { type: 'simple-json', nullable: true },
  },
});