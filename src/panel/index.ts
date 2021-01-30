// eslint-disable-next-line
import LoadScript from 'vue-plugin-load-script';

import VueCompositionAPI from '@vue/composition-api';
import { get } from 'lodash-es';
import Vue from 'vue';
import LoadScript from 'vue-plugin-load-script';
import VueRouter from 'vue-router';

import { setLocale } from 'src/bot/helpers/dayjs';

import { ButtonStates, states } from './helpers/buttonStates';
import type { getListOfReturn } from './helpers/getListOf';
import { getListOf, populateListOf } from './helpers/getListOf';
import { isBotStarted } from './helpers/isBotStarted';
import { isUserLoggedIn } from './helpers/isUserLoggedIn';
import { store } from './helpers/store';
import urlParam from './helpers/urlParam';
import vuetify from './vuetify'; // path to vuetify export

Vue.use(LoadScript);
Vue.use(VueCompositionAPI);

/* import widely used components */
Vue.component('Panel', () => import('./components/panel.vue'));
Vue.component('HoldButton', () => import('./components/holdButton.vue'));
Vue.component('ButtonWithIcon', () => import('./components/button.vue'));
Vue.component('StateButton', () => import('./components/stateButton.vue'));
Vue.component('TextareaWithTags', () => import('./components/textareaWithTags.vue'));

declare module 'vue/types/vue' {
  interface Vue {
    $loadScript: (script: string) => Promise<void>;
    $unloadScript: (script: string) => Promise<void>;
    $state: states;
    urlParam(key: string): string | null;
    $systems: getListOfReturn['systems'];
    $core: getListOfReturn['core'];
    $integrations: getListOfReturn['integrations'];
  }
}

Vue.use(VueRouter);

const main = async () => {
  // init prototypes
  Vue.prototype.urlParam = (v: string) => urlParam(v);
  store.commit('setLoggedUser', await isUserLoggedIn());

  Vue.prototype.$state = ButtonStates;

  const router = new VueRouter({
    mode:   'hash',
    base:   __dirname,
    routes: [
      {
        path: '/', name: 'Dashboard', component: () => import('./views/dashboard/empty.vue'),
      },
      {
        path: '/stats/api', name: 'api', component: () => import('./views/stats/api.vue'),
      },
      {
        path: '/stats/commandcount', name: 'commandcount', component: () => import('./views/stats/commandcount.vue'),
      },
      {
        path: '/stats/tips', name: 'tips', component: () => import('./views/stats/tips.vue'),
      },
      {
        path: '/stats/bits', name: 'bits', component: () => import('./views/stats/bits.vue'),
      },
      {
        path: '/stats/profiler', name: 'profiler', component: () => import('./views/stats/profiler.vue'),
      },

      {
        path: '/manage/alias', name: 'alias', component: () => import('./views/managers/alias.vue'),
      },
      {
        path: '/manage/commands', name: 'customcommands', component: () => import('./views/managers/commands.vue'),
      },
      {
        path: '/manage/botcommands', name: 'botcommands', component: () => import('./views/managers/botcommands.vue'),
      },
      {
        path: '/manage/cooldowns', name: 'cooldown', component: () => import('./views/managers/cooldowns.vue'),
      },
      {
        path: '/manage/highlights', name: 'highlights', component: () => import('./views/managers/highlights.vue'),
      },
      {
        path: '/manage/hltb', name: 'howlongtobeat', component: () => import('./views/managers/hltb.vue'),
      },
      {
        path: '/manage/polls', name: 'PollsManager', component: () => import('./views/managers/polls.vue'),
      },
      { path: '/manage/events/', redirect: '/manage/events/list' },
      {
        path: '/manage/events/list', name: 'EventsManagerList', component: () => import('./views/managers/events.vue'),
      },
      {
        path: '/manage/events/edit/:id?', name: 'EventsManagerEdit', component: () => import('./views/managers/events.vue'),
      },
      {
        path: '/manage/keywords', name: 'keywords', component: () => import('./views/managers/keyword.vue'),
      },
      {
        path: '/manage/price', name: 'price', component: () => import('./views/managers/price.vue'),
      },
      {
        path: '/manage/quotes', name: 'quotes', component: () => import('./views/managers/quotes.vue'),
      },
      {
        path: '/manage/ranks', name: 'ranks', component: () => import('./views/managers/ranks.vue'),
      },
      {
        path: '/manage/songs/playlist', name: 'songsManagerPlaylist', component: () => import('./views/managers/songs/songs-playlist.vue'),
      },
      {
        path: '/manage/songs/bannedsongs', name: 'bannedsongs', component: () => import('./views/managers/songs/songs-bannedsongs.vue'),
      },
      {
        path: '/manage/spotify/bannedsongs', name: 'spotifybannedsongs', component: () => import('./views/managers/spotify/spotify-bannedsongs.vue'),
      },
      {
        path: '/manage/timers', name: 'timers', component: () => import('./views/managers/timers.vue'),
      },
      {
        path: '/manage/viewers/:id?', name: 'viewers', component: () => import('./views/managers/viewers.vue'),
      },
      {
        path: '/settings/permissions/:id?', name: 'PermissionsSettings', component: () => import('./views/settings/permissions.vue'),
      },
      {
        path: '/settings/translations', name: 'TranslationsSettings', component: () => import('./views/settings/translations.vue'),
      },
      {
        path: '/settings/:type/:id?', name: 'InterfaceSettings', component: () => import('./views/settings/interface.vue'),
      },

      {
        path: '/registry/alerts/list', name: 'alertsList', component: () => import('./views/registries/alerts/alerts-list.vue'),
      },
      {
        path: '/registry/alerts/edit/:id?', name: 'alertsEdit', component: () => import('./views/registries/alerts/alerts-edit.vue'),
      },
      {
        path: '/registry/customvariables/list', name: 'CustomVariableList', component: () => import('./views/registries/custom-variables/custom-variables-list.vue'),
      },
      {
        path: '/registry/customvariables/edit/:id?', name: 'CustomVariableEdit', component: () => import('./views/registries/custom-variables/custom-variables-edit.vue'),
      },
      {
        path: '/registry/carousel/list', name: 'carouselRegistryList', component: () => import('./views/registries/carousel-overlay/carousel-overlay-list.vue'),
      },
      {
        path: '/registry/carousel/edit/:id?', name: 'carouselRegistryEdit', component: () => import('./views/registries/carousel-overlay/carousel-overlay-edit.vue'),
      },
      {
        path: '/registry/obswebsocket/list', name: 'OBSWebsocketRegistryList', component: () => import('./views/registries/obswebsocket.vue'),
      },
      {
        path: '/registry/obswebsocket/edit/:id?', name: 'OBSWebsocketRegistryEdit', component: () => import('./views/registries/obswebsocket.vue'),
      },
      {
        path: '/registry/overlays/list', name: 'overlaysList', component: () => import('./views/registries/overlays/overlays.vue'),
      },
      {
        path: '/registry/randomizer/list', name: 'RandomizerRegistryList', component: () => import('./views/registries/randomizer/randomizer-list.vue'),
      },
      {
        path: '/registry/randomizer/edit/:id?', name: 'RandomizerRegistryEdit', component: () => import('./views/registries/randomizer/randomizer-edit.vue'),
      },
      {
        path: '/registry/textoverlay/list', name: 'TextOverlayList', component: () => import('./views/registries/text-overlay/text-overlay-list.vue'),
      },
      {
        path: '/registry/textoverlay/edit/:id?', name: 'TextOverlayEdit', component: () => import('./views/registries/text-overlay/text-overlay-edit.vue'),
      },
      {
        path: '/registry/gallery/list', name: 'galleryRegistryEdit', component: () => import('./views/registries/gallery/gallery-list.vue'),
      },
      {
        path: '/registry/goals/list', name: 'GoalsRegistryList', component: () => import('./views/registries/goals/goals-list.vue'),
      },
      {
        path: '/registry/goals/edit/:id?', name: 'GoalsRegistryEdit', component: () => import('./views/registries/goals/goals-edit.vue'),
      },
    ],
  });

  const VueApp = new Vue({
    store,
    router,
    vuetify,
    components: {
      dashboard:        () => import('./views/dashboard/dashboard.vue'),
      navbar:           () => import('./components/navbar/navbar.vue'),
      changegamedialog: () => import('./components/dialog/changegamedialog.vue'),
      footerbar:        () => import('./components/footer.vue'),
      snackbar:         () => import('./components/snackbar.vue'),
    },
    created() {
      // set proper dayjs locale
      setLocale(get(this.$store.state, 'configuration.lang', 'en'));
    },
    template: `
      <v-app id="app">
        <template v-if="$store.state.isUILoaded">
          <navbar/>
          <dashboard
            :style="{
              top:  $route.path === '/' ? '0': '-99999999px',
              visibility: $route.path === '/' ? 'visible' : 'hidden',
              position: $route.path === '/' ? 'inherit' : 'absolute'
            }"
          />
          <v-main
            :style="{
              visibility: $route.path !== '/' ? 'visible' : 'hidden',
              position: $route.path !== '/' ? 'inherit' : 'absolute'
            }">
            <router-view/>
            <snackbar/>
          </v-main>
          <footerbar/>
        </template>
        <v-overlay :value="!$store.state.isUILoaded" :dark="$vuetify.theme.dark">
          <v-row>
            <v-col class="text-center">
              <v-progress-circular indeterminate size="48"></v-progress-circular>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="font-weight-light">
              {{ $store.state.loadingMsg }}
            </v-col>
          </v-row>
        </v-overlay>
      </v-app>
    `,
  }).$mount('#app');

  VueApp.$vuetify.theme.dark = (localStorage.getItem('theme') || 'dark') === 'dark';
  await isBotStarted();

  await getTranslations();
  store.commit('setConfiguration', await getConfiguration());
  await populateListOf('core');
  await populateListOf('systems');
  await populateListOf('integrations');

  Vue.prototype.$core = await getListOf('core');
  Vue.prototype.$systems = getListOf('systems');
  Vue.prototype.$integrations = await getListOf('integrations');

  console.debug({
    core:         Vue.prototype.$core,
    systems:      Vue.prototype.$systems,
    integrations: Vue.prototype.$integrations,
  });

  await getTranslations();
  store.commit('setLoggedUser', await isUserLoggedIn(false, false));

  const configuration = await getConfiguration();
  store.commit('setConfiguration', configuration);
  setLocale(configuration.lang as string);
  store.commit('setUILoaded');
};

main();
