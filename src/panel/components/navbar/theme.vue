<template>
<<<<<<< HEAD
  <b-btn
    class="border-0 ml-1 p-1 pl-2 pr-2"
    variant="null"
    @click="toggleTheme"
  >
    <fa
      v-if="theme === 'light'"
      icon="sun"
      fixed-width
      style="color: rgb(253, 177, 0)"
    />
    <fa
      v-else
      icon="moon"
      fixed-width
      style="color: #d0d5d2"
    />
  </b-btn>
</template>

<script lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { getSocket } from '@sogebot/ui-helpers/socket';
=======
  <v-btn
    text
    @click="toggleTheme"
  >
    <v-icon
      v-if="theme === 'light'"
      style="color: rgb(253, 177, 0)"
    >
      {{ mdiWeatherSunny }}
    </v-icon>
    <v-icon
      v-else
      style="color: #d0d5d2"
    >
      {{ mdiMoonWaxingCrescent }}
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import { mdiMoonWaxingCrescent, mdiWeatherSunny } from '@mdi/js';
>>>>>>> feat(vuetify): add vuetify UI
import {
  defineComponent, onMounted, ref,
} from '@vue/composition-api';
import { get } from 'lodash-es';

import { isUserLoggedIn } from 'src/panel/helpers/isUserLoggedIn';

const socket = getSocket('/core/users', true);

export default defineComponent({
  setup(props, context) {
    const theme = ref('light');

    const toggleTheme = () => {
      const _theme = localStorage.getItem('theme');
      if (_theme === null || _theme === 'light') {
        localStorage.setItem('theme', 'dark');
      }
      if (_theme === 'dark') {
        localStorage.setItem('theme', 'light');
      }
      loadTheme(localStorage.getItem('theme') || 'dark');
    };

    const loadTheme = async (themeArg: string) => {
      if (!['light', 'dark'].includes(themeArg)) {
        console.error(`Unknown theme ${themeArg}, setting light theme`);
        themeArg = 'light';
      }

      context.root.$vuetify.theme.dark = themeArg === 'dark';
      theme.value = themeArg;

      // we need to save users preferred theme
      const user = await isUserLoggedIn(false, false);
      if (user) {
        socket.emit('theme::set', { theme: themeArg, userId: user.id }, () => {
          return;
        });
      }
      localStorage.setItem('theme', themeArg);
    };

    onMounted(async () => {
      const user = await isUserLoggedIn(false, false);
      if (user) {
        socket.emit('theme::get', { userId: user.id }, (err: string | null, themeArg: string | null) => {
          loadTheme(themeArg || get(context.root.$store.state.configuration, 'core.ui.theme', 'light'));
        });
      } else {
        loadTheme(localStorage.getItem('theme') || get(context.root.$store.state.configuration, 'core.ui.theme', 'light'));
      }
    });
    return {
      theme, toggleTheme, mdiWeatherSunny, mdiMoonWaxingCrescent, 
    };
  },
});
</script>