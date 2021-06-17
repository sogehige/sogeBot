<template>
  <div>

          <div class="form-group col-md-12">
            <label>{{ translate('core.permissions.testUser') }}</label>
            <test :key="'test' + item.id" />
          </div>

          <div class="p-3 text-right">
            <hold-button
              v-if="!item.isCorePermission"
              class="btn-danger"
              icon="trash"
              @trigger="removePermission()"
            >
              <template slot="title">
                {{ translate('dialog.buttons.delete') }}
              </template>
              <template slot="onHoldTitle">
                {{ translate('dialog.buttons.hold-to-delete') }}
              </template>
            </hold-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getSocket } from '@sogebot/ui-helpers/socket';
import translate from '@sogebot/ui-helpers/translate';
import { some } from 'lodash-es';
import Vue from 'vue';

import { PermissionsInterface } from 'src/bot/database/entity/permissions';

export default Vue.extend({
  components: {
    userslist: () => import('./userslist.vue'),
    filters:   () => import('./filters.vue'),
    test:      () => import('./test.vue'),
  },
  props: ['permissions'],
  data() {
    const data: {
      translate: typeof translate;
      some: any;
      item: PermissionsInterface | undefined,
      isRouteChange: boolean,
      socket: any,
    } = {
      translate:     translate,
      some:          some,
      item:          this.permissions.find((o: PermissionsInterface) => o.id === this.$route.params.id),
      socket:        getSocket('/core/permissions'),
      isRouteChange: false,
    };
    return data;
  },
  watch: {
    '$route.params.id'(val) {
      this.isRouteChange = true;
      this.item = this.permissions.find((o: PermissionsInterface) => o.id === this.$route.params.id);
      this.isRouteChange = false;
    },
  },
  methods: {
    removePermission() {
      this.$emit('update:permissions', [...this.permissions.filter((o: PermissionsInterface) => o.id !== this.$route.params.id)]);
      this.$router.push({ name: 'PermissionsSettings' });
    },
  },
});
</script>