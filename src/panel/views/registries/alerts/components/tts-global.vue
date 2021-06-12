<template>
  <b-card no-body>
    <b-card-header
      header-tag="header"
      class="p-1"
      role="tab"
    >
      <b-button
        v-b-toggle="'tts-accordion-' + uuid"
        block
        variant="light"
        class="text-left"
      >
        {{ translate('registry.alerts.tts.setting') }}
      </b-button>
    </b-card-header>
    <b-collapse
      :id="'tts-accordion-' + uuid"
      :accordion="'tts-accordion-' + uuid"
      role="tabpanel"
    >
      <b-card-body v-if="state.loaded === $state.success">

        <b-form-group
          label-cols-sm="4"
          label-cols-lg="3"
          :label="translate('registry.alerts.test')"
        >
          <b-textarea v-model="text" />
          <b-button
            type="button"
            variant="primary"
            block
            @click="speak()"
          >
            {{ translate('registry.alerts.test') }}
          </b-button>
        </b-form-group>
      </b-card-body>
      <b-card-body v-if="state.loaded === $state.fail">
        <b-alert
          show
          variant="info"
        >
          ResponsiveVoices key is not properly set, go to
          <a href="#/settings/integrations/responsivevoice">ResponsiveVoice integration settings</a>
          and set your key.
        </b-alert>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script lang="ts">
import translate from '@sogebot/ui-helpers/translate';
import {
  defineComponent, onMounted, ref, watch,
} from '@vue/composition-api';

import type { AlertInterface } from 'src/bot/database/entity/alert';
import { ButtonStates } from 'src/panel/helpers/buttonStates';

declare global {
  interface Window {
    responsiveVoice: any;
  }
}

export default defineComponent({
  props: {
    tts:  Object,
    uuid: String,
  },
  setup(props: { tts: AlertInterface['tts'] | null, uuid: string}, ctx) {
    const text = ref('This message should be said by TTS to test your settings.');
    const state = ref({ loaded: ButtonStates.progress } as { loaded: number });
    const TTSData = ref(props.tts ?? {
      voice:  'UK English Female',
      volume: 1,
      rate:   1,
      pitch:  1,
    });
    const voices = ref([] as {text: string; value: string}[]);

    function initResponsiveVoice() {
      if (typeof window.responsiveVoice === 'undefined') {
        setTimeout(() => initResponsiveVoice(), 200);
        return;
      }
      window.responsiveVoice.init();
      voices.value = window.responsiveVoice.getVoices().map((o: { name: string }) => {
        return { text: o.name, value: o.name };
      });
      state.value.loaded = ButtonStates.success;
    }

    async function speak() {
      for (const toSpeak of text.value.split('/ ')) {
        await new Promise<void>(resolve => {
          if (toSpeak.trim().length === 0) {
            setTimeout(() => resolve(), 500);
          } else {
            window.responsiveVoice.speak(toSpeak.trim(), TTSData.value.voice, {
              rate: TTSData.value.rate, pitch: TTSData.value.pitch, volume: TTSData.value.volume, onend: () => setTimeout(() => resolve(), 500),
            });
          }
        });
      }
    }

    onMounted(() => {
      state.value.loaded = ButtonStates.progress;
      if (ctx.root.$store.state.configuration.integrations.ResponsiveVoice.api.key.trim().length === 0) {
        state.value.loaded = ButtonStates.fail;
      } else {
        if (typeof window.responsiveVoice === 'undefined') {
          ctx.root.$loadScript('https://code.responsivevoice.org/responsivevoice.js?key=' + ctx.root.$store.state.configuration.integrations.ResponsiveVoice.api.key)
            .then(() => initResponsiveVoice());
        } else {
          state.value.loaded = ButtonStates.success;
          voices.value = window.responsiveVoice.getVoices().map((o: { name: string }) => {
            return { text: o.name, value: o.name };
          });
        }
      }
    });

    watch(TTSData, (val) => {
      ctx.emit('update:tts', val);
    }, { deep: true });

    return {
      voices,
      TTSData,
      state,
      text,
      translate,
      speak,
    };
  },
});
</script>