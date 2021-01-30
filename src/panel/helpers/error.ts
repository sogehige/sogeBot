import { EventBus } from './event-bus';

const error = (err: string, title?: string) => {
  EventBus.$emit('snack', 'red', `<h4>${title || 'Unexpected error'}</h4><p>${err}</p>`);
  console.error(err);
};

const success = (message: string, title: string) => {
  EventBus.$emit('success', { name: title, message });
};

export { error, success };