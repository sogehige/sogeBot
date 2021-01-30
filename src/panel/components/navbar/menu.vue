<template>
<<<<<<< HEAD
  <perfect-scrollbar
    class="main-menu"
    :options="{useBothWheelAxes: true, suppressScrollY: true}"
  >
    <nav
      id="menu-detach"
      class="nav d-flex justify-content-between"
      style="width: max-content"
    >
      <span
        v-for="category of categories"
        :key="category"
      >
        <b-dropdown variant="light">
          <template #button-content>
            {{ translate('menu.' + category) }}
          </template>
          <b-dropdown-item
            v-for="item of menu.filter(o => o.category === category && o.enabled)"
            :key="item.id + item.name + item.category"
            :href="'#/' + item.id.replace(/\./g, '/')"
          >
            {{ translate('menu.' + item.name) }}
          </b-dropdown-item>
          <b-dropdown-group
            v-if="menu.filter(o => o.category === category && !o.enabled).length > 0"
            id="dropdown-group-1"
            class="pt-2"
          >
            <template #header>
              <header
                class="p-1"
                style="cursor: pointer;"
                @click.prevent="isDisabledHidden = !isDisabledHidden"
              >
                {{ translate('disabled') }}
                <small>
                  <fa
                    v-if="isDisabledHidden"
                    icon="plus"
                    fixed-width
                  />
                  <fa
                    v-else
                    icon="minus"
                    fixed-width
                  />
                </small>
              </header>
            </template>
            <template v-if="!isDisabledHidden">
              <b-dropdown-item
                v-for="item of menu.filter(o => o.category === category && !o.enabled)"
                :key="item.id + item.name + item.category"
                :href="'#/' + item.id.replace(/\./g, '/')"
              >
                {{ translate('menu.' + item.name) }}
              </b-dropdown-item>
            </template>
          </b-dropdown-group>
        </b-dropdown>
      </span>
    </nav>
  </perfect-scrollbar>
=======
  <v-list
    nav
    dense
  >
    <v-list-item
      v-for="item of menu.filter(o => typeof o.category === 'undefined')"
      :key="item.name"
      :href="'#/' + item.id.replace(/\./g, '/')"
    >
      <v-list-item-icon>
        <v-icon>{{ icons.get(item.name) }}</v-icon>
      </v-list-item-icon>
      <v-list-item-title>{{ translate('menu.' + item.name) }}</v-list-item-title>
    </v-list-item>
    <v-list-group
      v-for="category of categories"
      :key="category"
      :value="false"
      :prepend-icon="icons.get(category)"
    >
      <template #activator>
        <v-list-item-title>{{ translate('menu.' + category) }}</v-list-item-title>
      </template>

      <v-list-item
        v-for="item of menu.filter(o => o.category === category)"
        :key="item.name"
        :href="'#/' + item.id.replace(/\./g, '/')"
      >
        <v-list-item-title
          :class="{
            'grey--text': !item.enabled,
            'darken-3': !item.enabled,
          }"
        >
          {{ translate('menu.' + item.name) }}
        </v-list-item-title>
      </v-list-item>
    </v-list-group>
  </v-list>
>>>>>>> feat(vuetify): add vuetify UI
</template>

<script lang="ts">
import { getSocket } from '@sogebot/ui-helpers/socket';
import translate from '@sogebot/ui-helpers/translate';
import {
  mdiCog, mdiExclamationThick, mdiFormatListBulletedSquare, mdiInformationVariant, mdiViewDashboard, mdiWrench,
} from '@mdi/js';
import {
  defineComponent, onMounted, ref,
} from '@vue/composition-api';

import type { menu as menuType } from 'src/bot/helpers/panel';

type menuWithEnabled = Omit<typeof menuType[number], 'this'> & { enabled: boolean };

const socket = getSocket('/');

const icons = new Map<string, string>([
  ['dashboard', mdiViewDashboard],
  ['commands', mdiExclamationThick],
  ['settings', mdiCog],
  ['manage', mdiWrench],
  ['stats', mdiInformationVariant],
  ['registry', mdiFormatListBulletedSquare],
]);

export default defineComponent({
  setup() {
    const menu = ref([] as menuWithEnabled[]);
    const categories = ['commands', 'manage', 'settings', 'registry', /* 'logs', */ 'stats'];
    const isDisabledHidden = ref(true);

    onMounted(async () => {
      const isLoaded = await Promise.race([
        new Promise<boolean>(resolve => {
          socket.emit('menu', (err: string | null, data: menuWithEnabled[]) => {
            if (err) {
              return console.error(err);
            }
            console.groupCollapsed('menu::menu');
            console.log({ data });
            console.groupEnd();
            for (const item of data.sort((a, b) => {
              return translate('menu.' + a.name).localeCompare(translate('menu.' + b.name));
            })) {
              menu.value.push(item);
            }
            resolve(true);
          });
        }),
        new Promise<boolean>(resolve => {
          setTimeout(() => resolve(false), 4000);
        }),
      ]);

      if (!isLoaded) {
        console.error('menu not loaded, refreshing page');
        location.reload();
      }
    });

    return {
      menu, categories, isDisabledHidden, translate, icons,
    };
  },
});

</script>
<style>
.ps__rail-x {
  height: 0;
  position: relative;
  top: 2px;
}
.ps__thumb-x {
  height: 4px;
}
.ps__rail-x:hover > .ps__thumb-x, .ps__rail-x:focus > .ps__thumb-x, .ps__rail-x.ps--clicking .ps__thumb-x {
  height: 6px;
}
</style>