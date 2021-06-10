<template>
  <div>
    <b-form>

      <b-form-group
        v-if="event === 'rewardredeems'"
        :label="translate('events.definitions.titleOfReward.label')"
        :label-for="'selectReward'"
      >
        <rewards
          :value.sync="reward"
          :state="null"
        />
      </b-form-group>
    </b-form>
  </div>
</template>
<script lang="ts">
import { getSocket } from '@sogebot/ui-helpers/socket';
import translate from '@sogebot/ui-helpers/translate';
import {
  computed, defineComponent, ref,
} from '@vue/composition-api';

import { EmitData } from 'src/bot/database/entity/alert';
import { shuffle } from 'src/bot/helpers/array/shuffle';
import { generateUsername } from 'src/bot/helpers/generateUsername';

const socket = getSocket('/registries/alerts');

export default defineComponent({
  components: { 'rewards': () => import('src/panel/components/rewardDropdown.vue') },
  setup(props, ctx) {
    const event = ref('follows' as typeof events[number]);
    const username = ref('');
    const reward = ref(null as null | string);
    const isUsernameRandomized = ref(true);

    const recipient = ref('');
    const isRecipientRandomized = ref(true);
    const haveRecipient = computed(() => {
      return ['rewardredeems', 'subgift'].includes(event.value);
    });

    const message = ref('');
    const isMessageRandomized = ref(true);
    const haveMessage = computed(() => {
      return ['cheers', 'resubs', 'rewardredeems'].includes(event.value);
    });

    const amount = ref(5);
    const isAmountRandomized = ref(true);
    const haveAmount = computed(() => {
      return amountLabel.value !== null;
    });
    const currency = ref(ctx.root.$store.state.configuration.currency);
    const amountLabel = computed(() => {
      switch(event.value) {
        case 'hosts':
        case 'raids':
          return translate('registry.alerts.testDlg.amountOfViewers');
        case 'cheers':
        case 'cmdredeems':
          return translate('registry.alerts.testDlg.amountOfBits');
        case 'tips':
          return translate('registry.alerts.testDlg.amountOfTips');
        case 'subcommunitygifts':
          return translate('registry.alerts.testDlg.amountOfGifts');
        case 'resubs':
        case 'subgifts':
          return translate('registry.alerts.testDlg.amountOfMonths');
        default:
          return null;
      }
    });

    const tier = ref('Prime' as typeof tiers[number]);
    const isTierRandomized = ref(true);
    const haveTier = computed(() => {
      return ['subs', 'resubs'].includes(event.value);
    });

    const tiers = ['Prime', '1', '2', '3'] as const;
    const events = ['follows', 'cheers', 'tips', 'subs', 'resubs', 'subcommunitygifts', 'subgifts', 'hosts', 'raids', 'cmdredeems', 'rewardredeems'] as const;

    const onSubmit = () => {
      const messages = [
        'Lorem ipsum dolor sit amet, https://www.google.com',
        'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Etiam dictum tincidunt diam. Aliquam erat volutpat. Mauris tincidunt sem sed arcu. Etiam sapien elit, consequat eget, tristique non, venenatis quis, ante. Praesent id justo in neque elementum ultrices. Integer pellentesque quam vel velit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Etiam commodo dui eget wisi. Cras pede libero, dapibus nec, pretium sit amet, tempor quis. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
        'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
        'This is some testing message :)',
        'Lorem ipsum dolor sit amet',
        '',
      ];

      const emit: EmitData = {
        amount: isAmountRandomized.value ? Math.floor(Math.random() * 1000) : amount.value,
        name:
          event.value === 'rewardredeems' ? reward.value || ''
            : (isUsernameRandomized.value ? generateUsername() : username.value),
        tier:       isTierRandomized.value ? tiers[shuffle([0,1,2,3])[0]] : tier.value,
        recipient:  isRecipientRandomized.value ? generateUsername() : recipient.value,
        currency:   currency.value,
        message:    isMessageRandomized.value ? shuffle(messages)[0] : message.value,
        event:      event.value,
        monthsName: '', // will be added at server
      };
      socket.emit('test', emit);
    };
    return {
      event,
      events,

      reward,
      username,
      isUsernameRandomized,

      recipient,
      isRecipientRandomized,
      haveRecipient,

      amount,
      isAmountRandomized,
      haveAmount,
      amountLabel,
      currency,

      tier,
      tiers,
      haveTier,
      isTierRandomized,

      message,
      isMessageRandomized,
      haveMessage,

      onSubmit,

      translate,
    };
  },
});
</script>