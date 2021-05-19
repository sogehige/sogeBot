import { EntitySchema } from 'typeorm';

export declare namespace QuickActions {
  namespace Options {
    type Default = {
      label: string,
      color: string,
    };

    type Command = {
      command: string,
    };
  }

  type Types = 'command';

  type Item<T extends QuickActions.Types> = {
    id: string,
    userId: string,
    order: number,
    type: T,
    options: QuickActions.Options.Default
    & (T extends 'command' ? QuickActions.Options.Command : Record<string, never>),
  };
}

export const QuickAction = new EntitySchema<Readonly<Required<QuickActions.Item<QuickActions.Types>>>>({
  name:    'quickaction',
  columns: {
    id: {
      type: 'uuid', primary: true, generated: 'uuid',
    },
    userId:  { type: String },
    order:   { type: Number },
    type:    { type: String },
    options: { type: 'simple-json' },
  },
});