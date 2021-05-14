import { EntitySchema } from 'typeorm';

declare namespace QuickActions {
  type RunCommand = {
    type: 'run-command';
    command: string;
  };
}

export interface QuickActionInterface {
  id?: string;
  userId: string;
  order: number;
  title: string;
  action: QuickActions.RunCommand
}

export const QuickAction = new EntitySchema<Readonly<Required<QuickActionInterface>>>({
  name:    'quickaction',
  columns: {
    id: {
      type: 'uuid', primary: true, generated: 'uuid',
    },
    userId: { type: String },
    order:  { type: Number },
    title:  { type: String },
    action: { type: 'simple-json' },
  },
});