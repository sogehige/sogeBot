<template>
  <span>
    <v-app-bar v-if="$vuetify.breakpoint.mobile" fixed app dense>
      <v-app-bar-nav-icon
        @click.stop="drawer = !drawer"
      />
      <v-toolbar-title>{{translate('menu.' + $route.name.toLowerCase())}}</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      app
      bottom
    >
      <vue-headful :title="name.toUpperCase() + '@' + channelName" />
      <user />

      <v-spacer />
      <navmenu />
      <template #append>
        <div class="text-center text-caption">
          <a href="https://github.com/sogehige/SogeBot">GitHub</a> |
          <a href="https://github.com/sogehige/SogeBot/issues">Issues</a> |
          <a href="https://github.com/sogehige/SogeBot/blob/master/LICENSE">GPL-3.0 License</a>
        </div>
      </template>
    </v-navigation-drawer>
  </span>
</template>

<script lang="ts">
import {
<<<<<<< HEAD
  faBars, faSignInAlt, faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { getSocket } from '@sogebot/ui-helpers/socket';
import translate from '@sogebot/ui-helpers/translate';
import {
  defineComponent, onMounted, ref,
=======
  defineAsyncComponent, defineComponent, onMounted, ref,
>>>>>>> feat(vuetify): add vuetify UI
} from '@vue/composition-api';
import vueHeadful from 'vue-headful';
import translate from 'src/panel/helpers/translate';

<<<<<<< HEAD
Vue.component('VueHeadful', vueHeadful);
library.add(faBars, faSignInAlt, faSignOutAlt);
=======
import { getSocket } from 'src/panel/helpers/socket';

const socket = getSocket('/', true);
>>>>>>> feat(vuetify): add vuetify UI

const navmenu = defineAsyncComponent({ loader: () => import('src/panel/components/navbar/menu.vue') });
const user = defineAsyncComponent({ loader: () => import('src/panel/components/navbar/user.vue') });

export default defineComponent({
  components: {
    vueHeadful,
    navmenu,
    user,
  },
  setup(props, ctx) {
    const name = ref('');
    const channelName = ref('');
    const drawer = ref(!ctx.root.$vuetify.breakpoint.mobile);

    onMounted(() => {
      socket.emit('name', (recvName: string) => name.value = recvName );
      socket.emit('channelName', (recvName: string) => channelName.value = recvName );
    });

    return {
      name, channelName, drawer, translate
    };
  },
});
</script>