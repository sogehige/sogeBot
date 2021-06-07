<template>
<<<<<<< HEAD
  <div class="ml-2 mr-2">
    <b-dropdown
      v-if="$store.state.loggedUser"
      no-caret
      variant="light"
      toggle-class="btn-sm p-0 pl-1 pr-1"
    >
      <template #button-content>
        <b-img
          :src="$store.state.loggedUser.profile_image_url"
          rounded="circle"
          alt="Circle image"
          style="width:30px;"
        />
        {{ $store.state.loggedUser.login }}
      </template>
      <b-dropdown-text
        v-if="isViewerLoaded"
        style="width:300px;"
      >
        <div class="row">
          <div style="position: absolute;right: 1rem;">
            <b-img
              :src="$store.state.loggedUser.profile_image_url"
              rounded="circle"
              alt="Circle image"
              style="width:70px;"
            />
          </div>
          <div
            v-if="viewer"
            class="col-12"
            style="justify-content: center; display: flex; flex-direction: column;"
          >
            <div><strong style="font-size: 1.2rem">{{ $store.state.loggedUser.login }}</strong> <small class="text-muted">({{ $store.state.loggedUser.id }})</small></div>
            <div
              style="font-size: 0.8rem"
              class="text-secondary"
            >
              <span
                v-for="k of viewerIs"
                :key="k"
              > {{ k }} </span>
            </div>
            <div v-if="viewer.permission">
              <strong
                style="font-size: 0.9rem"
                class="text-muted"
              >{{ translate('group') }}:</strong>  {{ viewer.permission.name }}
            </div>
            <div>
              <strong
                style="font-size: 0.9rem"
                class="text-muted"
              >{{ translate('points') }}:</strong>
              {{ Intl.NumberFormat($store.state.configuration.lang).format(viewer.points) }}
            </div>
            <div>
              <strong
                style="font-size: 0.9rem"
                class="text-muted"
              >{{ translate('messages') }}:</strong>
              {{ Intl.NumberFormat($store.state.configuration.lang).format(viewer.messages) }}
            </div>
            <div>
              <strong
                style="font-size: 0.9rem"
                class="text-muted"
              >{{ translate('watched-time') }}:</strong>
              {{ Intl.NumberFormat($store.state.configuration.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(viewer.watchedTime / 1000 / 60 / 60) }} h
            </div>
            <div>
              <strong
                style="font-size: 0.9rem"
                class="text-muted"
              >{{ translate('bits') }}:</strong>
              {{ Intl.NumberFormat($store.state.configuration.lang).format(viewer.aggregatedBits) }}
            </div>
            <div>
              <strong
                style="font-size: 0.9rem"
                class="text-muted"
              >{{ translate('tips') }}:</strong>
              {{ Intl.NumberFormat($store.state.configuration.lang, { style: 'currency', currency: $store.state.configuration.currency }).format(viewer.aggregatedTips) }}
            </div>
          </div>
        </div>
        <b-button-group class="pt-2 w-100">
          <b-button
            v-if="isPublicPage && viewer.permission.id === defaultPermissions.CASTERS"
            variant="dark"
            href="/"
          >
            {{ translate('go-to-admin') }}
          </b-button>
          <b-button
            v-if="!isPublicPage"
            variant="dark"
            href="/public/"
          >
            {{ translate('go-to-public') }}
          </b-button>
          <b-button
            variant="danger"
            class="float-right"
            @click="logout"
          >
            <fa
              icon="sign-out-alt"
              fixed-width
            /> {{ translate('logout') }}
          </b-button>
        </b-button-group>
      </b-dropdown-text>
      <b-dropdown-text
        v-else
        style="width:300px;"
      >
        <loading no-margin />
      </b-dropdown-text>
    </b-dropdown>
    <template v-else>
      <b-button
        class="border-0 ml-1 p-1 pl-2 pr-2 btn-sm"
        variant="light"
        @click="login"
      >
        <fa
          icon="user-circle"
          fixed-width
        />
        {{ translate('not-logged-in') }}
      </b-button>
=======
  <v-list
    nav
    dense
  >
    <template v-if="isViewerLoaded && $store.state.loggedUser">
      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
      >
        <template #activator="{ on, attrs }">
          <v-list-item
            class="px-0"
            style="height: 72px"
            v-bind="attrs"
            v-on="on"
          >
            <v-list-item-avatar>
              <v-avatar>
                <v-img :src="$store.state.loggedUser.profile_image_url" />
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ $store.state.loggedUser.login }}</v-list-item-title>
              <v-list-item-subtitle v-if="viewer.permission">
                {{ viewer.permission.name }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>

        <v-card>
          <v-list>
            <v-list-item>
              <v-list-item-avatar>
                <v-avatar>
                  <v-img :src="$store.state.loggedUser.profile_image_url" />
                </v-avatar>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{ $store.state.loggedUser.login }}</v-list-item-title>
                <v-list-item-subtitle v-if="viewer.permission">
                  {{ viewer.permission.name }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <v-chip
                    v-for="k of viewerIs"
                    :key="k"
                    x-small
                    pill
                    color="orange"
                  >
                    {{ k }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <theme />
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <v-divider />

          <v-container>
            <v-row>
              <v-col class="font-weight-medium text-center pa-1">
                {{ Intl.NumberFormat($store.state.configuration.lang).format(viewer.points) }}
                <div class="font-weight-thin">
                  {{ translate('points') }}
                </div>
              </v-col>
              <v-col class="font-weight-medium text-center pa-1">
                {{ Intl.NumberFormat($store.state.configuration.lang).format(viewer.messages) }}
                <div class="font-weight-thin">
                  {{ translate('messages') }}
                </div>
              </v-col>
              <v-col class="font-weight-medium text-center pa-1">
                {{ Intl.NumberFormat($store.state.configuration.lang).format(viewer.aggregatedBits) }}
                <div class="font-weight-thin">
                  {{ translate('bits') }}
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="font-weight-medium text-center pa-1">
                {{ Intl.NumberFormat($store.state.configuration.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(viewer.watchedTime / 1000 / 60 / 60) }} h
                <div class="font-weight-thin">
                  {{ translate('watched-time') }}
                </div>
              </v-col>
              <v-col class="font-weight-medium text-center pa-1">
                {{ Intl.NumberFormat($store.state.configuration.lang, { style: 'currency', currency: $store.state.configuration.currency }).format(viewer.aggregatedTips) }}
                <div class="font-weight-thin">
                  {{ translate('tips') }}
                </div>
              </v-col>
              <v-col class="font-weight-medium text-center pa-1" />
            </v-row>
          </v-container>

          <v-card-actions>
            <v-spacer />

            <v-btn
              text
              @click="menu = false"
            >
              {{ translate('close') }}
            </v-btn>
            <v-btn
              color="danger"
              text
              @click="logout"
            >
              <v-icon class="red--text">
                {{ mdiLogout }}
              </v-icon>
              {{ translate('logout') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <v-list-item
        v-if="!isPublicPage"
        href="/public/"
        class="mt-3"
      >
        <v-list-item-icon>
          <v-icon>{{ mdiEarth }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ translate('go-to-public') }}</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="isPublicPage && viewer.permission.id === defaultPermissions.CASTERS"
        href="/"
        class="mt-3"
      >
        <v-list-item-icon>
          <v-icon>{{ mdiShield }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ translate('go-to-admin') }}</v-list-item-title>
      </v-list-item>
    </template>
    <template v-else>
      <v-list-item @click="login">
        <v-list-item-icon>
          <v-icon>{{ mdiLogin }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ translate('not-logged-in') }}</v-list-item-title>
      </v-list-item>
>>>>>>> feat(vuetify): add vuetify UI
    </template>
  </v-list>
</template>

<script lang="ts">
<<<<<<< HEAD
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { getSocket } from '@sogebot/ui-helpers/socket';
import translate from '@sogebot/ui-helpers/translate';
import {
  computed, defineComponent, onMounted, onUnmounted, ref,
=======
import {
  mdiEarth, mdiLogin, mdiLogout, mdiShield,
} from '@mdi/js';
import {
  computed, defineAsyncComponent, defineComponent, onMounted, onUnmounted, ref,
>>>>>>> feat(vuetify): add vuetify UI
} from '@vue/composition-api';
import type { Ref } from '@vue/composition-api';

import { defaultPermissions } from 'src/bot/helpers/permissions/defaultPermissions';

import { PermissionsInterface } from '../../../bot/database/entity/permissions';
import { UserInterface } from '../../../bot/database/entity/user';

const socket = getSocket('/core/users', true);
let interval = 0;

const theme = defineAsyncComponent({ loader: () => import('src/panel/components/navbar/theme.vue') });

export default defineComponent({
  components: { theme },
  setup(props, context) {
    const menu = ref(false);
    const isViewerLoaded = ref(false);
    const viewer: Ref<(Required<UserInterface> & { aggregatedTips: number; aggregatedBits: number; permission: PermissionsInterface }) | null> = ref(null);
    const viewerIs = computed(() => {
      const status: string[] = [];
      const isArray = ['isFollower', 'isSubscriber', 'isVIP'] as const;
      isArray.forEach((item: typeof isArray[number]) => {
        if (viewer.value && viewer.value[item]) {
          status.push(item.replace('is', ''));
        }
      });
      return status;
    });
    const isPublicPage = computed(() => window.location.href.includes('public'));

    onMounted(() => {
      refreshViewer();
      interval = window.setInterval(() => {
        refreshViewer();
      }, 60000);
    });
    onUnmounted(() => clearInterval(interval));

    const logout = () => {
      socket.emit('logout', {
        accessToken:  localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
      });
      localStorage.setItem('code', '');
      localStorage.setItem('accessToken', '');
      localStorage.setItem('refreshToken', '');
      localStorage.setItem('userType', 'unauthorized');
      window.location.assign(window.location.origin + '/credentials/login#error=logged+out');
    };
    const login = () => window.location.assign(window.location.origin + '/credentials/login');
    const refreshViewer = () => {
      if (typeof context.root.$store.state.loggedUser === 'undefined'|| context.root.$store.state.loggedUser === null) {
        return;
      }
      socket.emit('viewers::findOne', context.root.$store.state.loggedUser.id, (err: string| number, recvViewer: Readonly<Required<UserInterface>> & { aggregatedTips: number; aggregatedBits: number; permission: PermissionsInterface }) => {
        if (err) {
          return console.error(err);
        }
        if (recvViewer) {
          console.log('Logged in as', recvViewer);
          viewer.value = recvViewer;
          isViewerLoaded.value = true;
        } else {
          console.error('Cannot find user data, try to write something in chat to load data');
        }
      });
    };

    const joinBot = () => socket.emit('joinBot');
    const leaveBot = () => socket.emit('leaveBot');

    return {
<<<<<<< HEAD
      defaultPermissions, isViewerLoaded, viewer, viewerIs, isPublicPage, logout, login, translate,
=======
      menu, defaultPermissions, isViewerLoaded, viewer, viewerIs, isPublicPage, logout, login, translate, joinBot, leaveBot,

      mdiLogout, mdiShield, mdiLogin, mdiEarth,

>>>>>>> feat(vuetify): add vuetify UI
    };
  },
});
</script>

<style>
.v-speed-dial__list {
  width: auto;
}
</style>