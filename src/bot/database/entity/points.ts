import { EntitySchema } from 'typeorm';

export interface PointsChangelogInterface {
  id: number;
  userId: number;
  originalValue: number;
  updatedValue: number;
  updatedAt: number;
  command: 'set' | 'add' | 'remove';
}

export const PointsChangelog = new EntitySchema<Readonly<Required<PointsChangelogInterface>>>({
  name: 'points_changelog',
  columns: {
    id: { type: Number, primary: true, generated: 'rowid' },
    userId: { type: Number },
    originalValue: { type: Number },
    updatedValue: { type: Number },
    updatedAt: { type: Number },
    command: { type: String },
  },
  indices: [
    { name: 'IDX_points_changelog_userId', columns: ['userId'] },
  ],
});