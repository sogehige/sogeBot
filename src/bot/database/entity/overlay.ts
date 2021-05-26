import { EntitySchema } from 'typeorm';

export interface OverlayMapperInterface {
  id: string;
  value: string | null;
  opts: null
}

export interface OverlayMapperOBSWebsocket {
  id: string;
  value: 'obswebsocket';
  opts: null | {
    allowedIPs: string[],
  },
}
export interface OverlayMapperOBSClipsCarousel {
  id: string;
  value: 'clipscarousel';
  opts: null | {
    volume: number,
  },
}

export type OverlayMappers = OverlayMapperInterface | OverlayMapperOBSWebsocket | OverlayMapperOBSClipsCarousel;

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