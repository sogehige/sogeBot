<template>
  <div>

    <b-card no-body>
      <b-card-header
        header-tag="header"
        class="p-1"
        role="tab"
      >
        <b-button
          v-b-toggle="'accordion-sound-' + data.id"
          block
          variant="light"
          class="text-left"
        >
          {{ translate('registry.alerts.sound.setting') }}
        </b-button>
      </b-card-header>
      <b-collapse
        :id="'accordion-sound-' + data.id"
        :accordion="'accordion-sound-' + data.id"
        role="tabpanel"
      >
        <b-card-body>
          <b-form-group
            label-cols-sm="4"
            label-cols-lg="3"
            :label="translate('registry.alerts.sound.name')"
            :label-for="'sound' + data.id"
          >
            <media
              :key="'sound-' + data.soundId"
              :media.sync="data.soundId"
              type="audio"
              socket="/registries/alerts"
              :volume="data.soundVolume"
            />
          </b-form-group>
        </b-card-body>
      </b-collapse>
    </b-card>

    <font
      key="form-follow-font"
      :parent="parent.font"
      :data.sync="data.font"
      :is-child="true"
    />

    <hold-button
      icon="trash"
      class="btn-danger btn-block btn-reverse mt-3"
      @trigger="$emit('delete', data.id)"
    >
      <template slot="title">
        {{ translate('dialog.buttons.delete') }}
      </template>
      <template slot="onHoldTitle">
        {{ translate('dialog.buttons.hold-to-delete') }}
      </template>
    </hold-button>
  </div>
</template>

<script lang="ts">
import translate from '@sogebot/ui-helpers/translate';
import { get } from 'lodash-es';
import { codemirror } from 'vue-codemirror';
import {
  Component, Prop, PropSync, Vue, Watch,
} from 'vue-property-decorator';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import 'codemirror/mode/css/css.js';
import 'codemirror/theme/base16-dark.css';
import 'codemirror/theme/base16-light.css';
import 'codemirror/lib/codemirror.css';
import { Validations } from 'vuelidate-property-decorators';
import { minValue, required } from 'vuelidate/lib/validators';

import textjs from 'src/bot/data/templates/alerts-js.txt';
import text from 'src/bot/data/templates/alerts.txt';
import type { AlertInterface, CommonSettingsInterface } from 'src/bot/database/entity/alert';

@Component({
  components: {
    codemirror,
    media:            () => import('src/panel/components/media.vue'),
    'layout-picker':  () => import('./layout-picker.vue'),
    'text-animation': () => import('./text-animation.vue'),
    'animation-in':   () => import('./animation-in.vue'),
    'animation-out':  () => import('./animation-out.vue'),
    'variant':        () => import('./variant.vue'),
    'query-filter':   () => import('./query-filter.vue'),
    'font':           () => import('src/panel/components/font.vue'),
    'hold-button':    () => import('../../../../components/holdButton.vue'),
  },
})
export default class AlertsEditFollowForm extends Vue {
  @PropSync('alert') data !: CommonSettingsInterface;
  @Prop() readonly parent !: AlertInterface;
  @Prop() readonly index !: number;
  @Prop() readonly event !: string;
  @Prop() readonly validationDate !: number;

  theme = localStorage.getItem('theme') || get(this.$store.state, 'configuration.core.ui.theme', 'light');
  customShow: 'html' | 'css' | 'js' = 'html';
  fonts: {text: string; value: string}[] = [];
  get = get;
  translate = translate;
  rules: [string, string][] = [];

  @Watch('validationDate')
  touchValidation() {
    this.$v.$touch();
  }

  @Watch('data', { deep: true })
  @Watch('$v', { deep: true })
  emitValidation() {
    this.$emit('update');
    this.$emit('update:isValid', !this.$v.$error);
  }

  @Validations()
  validations = {
    data: {
      variantAmount:   { required, minValue: minValue(0) },
      messageTemplate: { required },
    },
  };

  revertCode() {
    if (this.customShow === 'css') {
      this.data.advancedMode[this.customShow] = '';
    } else if (this.customShow === 'js') {
      this.data.advancedMode[this.customShow] = textjs;
    } else if (this.customShow === 'html') {
      this.data.advancedMode[this.customShow] = text;
    }
  }

  created() {
    switch (this.$props.event) {
      case 'subs':
        this.rules = [['username', 'string'], ['tier', 'tier']];
        break;
      case 'subgifts':
        this.rules = [['username', 'string'], ['recipient', 'string'], ['amount', 'number']];
        break;
      case 'cmdredeems':
        this.rules = [['name', 'string'], ['recipient', 'string'], ['amount', 'number']];
        break;
      case 'rewardredeems':
        this.rules = [['name', 'string'], ['recipient', 'string']];
        break;
      case 'subcommunitygifts':
      case 'hosts':
      case 'raids':
        this.rules = [['username', 'string'], ['amount', 'number']];
        break;
      default:
        this.rules = [['username', 'string']];
        break;
    }
  }

  async mounted() {
    if (this.data.advancedMode.html === null) {
      this.data.advancedMode.html = text;
    }
    if (this.data.advancedMode.js === null) {
      this.data.advancedMode.js = textjs;
    }
    const { response } = await new Promise<{ response: Record<string, any>}>(resolve => {
      const request = new XMLHttpRequest();
      request.open('GET', '/fonts', true);

      request.onload = function() {
        if (!(this.status >= 200 && this.status < 400)) {
          console.error('Something went wrong getting font', this.status, this.response);
        }
        resolve({ response: JSON.parse(this.response) });
      };
      request.onerror = function() {
        console.error('Connection error to sogebot');
        resolve( { response: {} });
      };

      request.send();
    });
    this.fonts = response.items.map((o: { family: string }) => {
      return { text: o.family, value: o.family };
    });
    this.emitValidation();
  }
}
</script>

<style>
  .col-form-label {
    font-size: 1rem !important;
    font-variant: inherit !important;
    font-weight: inherit !important;
    text-indent: inherit !important;
    letter-spacing: inherit !important;
    text-transform: none !important;
  }

  .custom-switch {
    padding-top: calc(0.375rem + 1px);
  }

  .custom-range {
    padding: 0 !important;
  }
</style>