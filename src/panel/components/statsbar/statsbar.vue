<template>
  <div>
    <v-alert
      v-if="!$store.state.configuration.isChannelSet"
      type="danger"
      dismissible
      prominent
      dense
    >
      <h5>{{ translate('errors.channel_is_not_set') }}</h5>
      <div
        class="text-caption"
        v-html="translate('errors.please_set_your_channel')"
      />
    </v-alert>
    <v-alert
      v-if="!$store.state.configuration.isCastersSet"
      type="info"
      dismissible
      prominent
      dense
    >
      <h5>{{ translate('errors.owner_and_broadcaster_oauth_is_not_set') }}</h5>
      <div
        class="text-caption"
        v-html="translate('errors.please_set_your_broadcaster_oauth_or_owners')"
      />
    </v-alert>
    <v-alert
      v-if="update.version"
      type="info"
      dismissible
      prominent
      dense
    >
      <h5>{{ translate('errors.new_update_available') }}</h5>
      <div
        class="text-caption"
        v-html="translate('errors.new_bot_version_available_at').replace(/\$version/gmi, update.version)"
      />
    </v-alert>

    <v-container
      fluid
      class="pa-1"
    >
      <v-row no-gutters>
        <v-col
          cols="6"
          lg="2"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-hover
            v-else
            v-slot="{ hover }"
          >
            <v-card
              tile
              min-height="60"
              elevation="1"
              @click="saveHighlight"
            >
              <v-card-title
                :key="timestamp"
                class="pa-1"
              >
                {{ getTime(uptime, false) }}
              </v-card-title>
              <v-card-subtitle class="pa-1 text-caption">
                {{ translate('uptime') }}
                <template v-if="hover">
                  {{ translate('click-to-highlight') }}
                </template>
              </v-card-subtitle>
            </v-card>
          </v-hover>
        </v-col>

        <v-col
          cols="6"
          lg="1"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-hover
            v-else
            v-slot="{ hover }"
          >
            <v-card
              tile
              min-height="60"
              elevation="1"
              @click="toggleViewerShow"
            >
              <v-card-title
                :key="timestamp"
                class="pa-1"
              >
                <template v-if="!hideStats">
                  {{
                    Intl.NumberFormat($store.state.configuration.lang).format(
                      isStreamOnline
                        ? currentStats.currentViewers
                        : 0
                    )
                  }}
                </template>
                <small v-else>{{ translate('hidden') }}</small>
              </v-card-title>
              <v-card-subtitle class="pa-1 text-caption">
                {{ translate('viewers') }}
                <template v-if="hover">
                  {{ translate('click-to-toggle-display') }}
                </template>
              </v-card-subtitle>
            </v-card>
          </v-hover>
        </v-col>

        <v-col
          cols="6"
          lg="1"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-hover
            v-else
            v-slot="{ hover }"
          >
            <v-card
              tile
              min-height="60"
              elevation="1"
              @click="toggleViewerShow"
            >
              <v-card-title
                :key="timestamp"
                class="pa-1"
              >
                <template v-if="!hideStats">
                  {{
                    Intl.NumberFormat($store.state.configuration.lang).format(
                      isStreamOnline
                        ? currentStats.maxViewers
                        : 0
                    )
                  }}
                  <small
                    v-if="b_showAvgDiff && isStreamOnline && currentStats.maxViewers - averageStats.maxViewers !== 0"
                    class="text-caption"
                    :class="{
                      'green--text': isTrending('maxViewers'),
                      'red--text': !isTrending('maxViewers'),
                    }"
                  >
                    <v-icon
                      :style="{
                        'vertical-align': isTrending('maxViewers') ? 'super' : 'sub',
                      }"
                      x-small
                      :color="isTrending('maxViewers') ? 'green' : 'red'"
                    >{{ isTrending('maxViewers') ? mdiTrendingUp : mdiTrendingDown }}</v-icon>
                    <span
                      :style="{
                        'vertical-align': isTrending('maxViewers') ? 'super' : 'sub',
                      }"
                      v-html="
                        Intl.NumberFormat($store.state.configuration.lang, {
                          style: b_percentage ? 'percent' : 'decimal'
                        }).format(b_percentage ? Math.abs(currentStats.maxViewers - averageStats.maxViewers) / (averageStats.maxViewers || 1) : currentStats.maxViewers - averageStats.maxViewers)
                      "
                    />
                  </small>
                </template>
                <small v-else>{{ translate('hidden') }}</small>
              </v-card-title>
              <v-card-subtitle class="pa-1 text-caption">
                {{ translate('max-viewers') }}
                <template v-if="hover">
                  {{ translate('click-to-toggle-display') }}
                </template>
              </v-card-subtitle>
            </v-card>
          </v-hover>
        </v-col>

        <v-col
          cols="6"
          lg="1"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-hover
            v-else
            v-slot="{ hover }"
          >
            <v-card
              tile
              min-height="60"
              elevation="1"
              @click="toggleViewerShow"
            >
              <v-card-title
                :key="timestamp"
                class="pa-1"
              >
                <template v-if="!hideStats">
                  <span
                    v-html="
                      Intl.NumberFormat($store.state.configuration.lang, {
                        notation: b_shortenNumber ? 'compact' : 'standard',
                        maximumFractionDigits: b_shortenNumber ? 1 : 0,
                      }).formatToParts(isStreamOnline ? currentStats.newChatters : 0).reduce(numberReducer, '')
                    "
                  />
                  <small
                    v-if="b_showAvgDiff && isStreamOnline && currentStats.newChatters - averageStats.newChatters !== 0"
                    class="text-caption"
                    :class="{
                      'green--text': isTrending('newChatters'),
                      'red--text': !isTrending('newChatters'),
                    }"
                  >
                    <v-icon
                      :style="{
                        'vertical-align': isTrending('newChatters') ? 'super' : 'sub',
                      }"
                      x-small
                      :color="isTrending('newChatters') ? 'green' : 'red'"
                    >{{ isTrending('newChatters') ? mdiTrendingUp : mdiTrendingDown }}</v-icon>
                    <span
                      :style="{
                        'vertical-align': isTrending('newChatters') ? 'super' : 'sub',
                      }"
                      v-html="
                        Intl.NumberFormat($store.state.configuration.lang, {
                          style: b_percentage ? 'percent' : 'decimal',
                          notation: b_shortenNumber ? 'compact' : 'standard',
                          maximumFractionDigits: b_shortenNumber && !b_percentage ? 1 : 0,
                        }).format(b_percentage ? Math.abs(currentStats.newChatters - averageStats.newChatters) / (averageStats.newChatters || 1) : currentStats.newChatters - averageStats.newChatters)
                      "
                    />
                  </small>
                </template>
                <small v-else>{{ translate('hidden') }}</small>
              </v-card-title>
              <v-card-subtitle class="pa-1 text-caption">
                {{ translate('new-chatters') }}
                <template v-if="hover">
                  {{ translate('click-to-toggle-display') }}
                </template>
              </v-card-subtitle>
            </v-card>
          </v-hover>
        </v-col>

        <v-col
          cols="6"
          lg="1"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-card
            v-else
            tile
            min-height="60"
            elevation="1"
          >
            <v-card-title
              :key="timestamp"
              class="pa-1"
            >
              <span
                v-html="
                  Intl.NumberFormat($store.state.configuration.lang, {
                    notation: b_shortenNumber ? 'compact' : 'standard',
                    maximumFractionDigits: b_shortenNumber ? 1 : 0,
                  }).formatToParts(isStreamOnline ? currentStats.chatMessages : 0).reduce(numberReducer, '')
                "
              />
              <small
                v-if="b_showAvgDiff && isStreamOnline && currentStats.chatMessages - averageStats.chatMessages !== 0"
                class="text-caption"
                :class="{
                  'green--text': isTrending('chatMessages'),
                  'red--text': !isTrending('chatMessages'),
                }"
              >
                <v-icon
                  :style="{
                    'vertical-align': isTrending('chatMessages') ? 'super' : 'sub',
                  }"
                  x-small
                  :color="isTrending('chatMessages') ? 'green' : 'red'"
                >{{ isTrending('chatMessages') ? mdiTrendingUp : mdiTrendingDown }}</v-icon>
                <span
                  :style="{
                    'vertical-align': isTrending('chatMessages') ? 'super' : 'sub',
                  }"
                  v-html="
                    Intl.NumberFormat($store.state.configuration.lang, {
                      style: b_percentage ? 'percent' : 'decimal',
                      notation: b_shortenNumber ? 'compact' : 'standard',
                      maximumFractionDigits: b_shortenNumber && !b_percentage ? 1 : 0,
                    }).format(b_percentage ? Math.abs(currentStats.chatMessages - averageStats.chatMessages) / (averageStats.chatMessages || 1) : currentStats.chatMessages - averageStats.chatMessages)
                  "
                />
              </small>
            </v-card-title>
            <v-card-subtitle class="pa-1 text-caption">
              {{ translate('chat-messages') }}
            </v-card-subtitle>
          </v-card>
        </v-col>

        <v-col
          cols="6"
          lg="1"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-card
            v-else
            tile
            min-height="60"
            elevation="1"
          >
            <v-card-title
              :key="timestamp"
              class="pa-1"
            >
              <span
                v-html="
                  Intl.NumberFormat($store.state.configuration.lang, {
                    notation: b_shortenNumber ? 'compact' : 'standard',
                    maximumFractionDigits: b_shortenNumber ? 1 : 0,
                  }).formatToParts(currentStats.currentViews).reduce(numberReducer, '')
                "
              />
              <small
                v-if="b_showAvgDiff && isStreamOnline && currentStats.currentViews - averageStats.currentViews !== 0"
                class="text-caption"
                :class="{
                  'green--text': isTrending('currentViews'),
                  'red--text': !isTrending('currentViews'),
                }"
              >
                <v-icon
                  :style="{
                    'vertical-align': isTrending('currentViews') ? 'super' : 'sub',
                  }"
                  x-small
                  :color="isTrending('currentViews') ? 'green' : 'red'"
                >{{ isTrending('currentViews') ? mdiTrendingUp : mdiTrendingDown }}</v-icon>
                <span
                  :style="{
                    'vertical-align': isTrending('currentViews') ? 'super' : 'sub',
                  }"
                  v-html="
                    Intl.NumberFormat($store.state.configuration.lang, {
                      style: b_percentage ? 'percent' : 'decimal',
                      notation: b_shortenNumber ? 'compact' : 'standard',
                      maximumFractionDigits: b_shortenNumber && !b_percentage ? 1 : 0,
                    }).format(b_percentage ? Math.abs(currentStats.currentViews - averageStats.currentViews) / (averageStats.currentViews || 1) : currentStats.currentViews - averageStats.currentViews)
                  "
                />
              </small>
            </v-card-title>
            <v-card-subtitle class="pa-1 text-caption">
              {{ translate('views') }}
            </v-card-subtitle>
          </v-card>
        </v-col>

        <v-col
          cols="6"
          lg="1"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-card
            v-else
            tile
            min-height="60"
            elevation="1"
          >
            <v-card-title
              :key="timestamp"
              class="pa-1"
            >
              <span
                v-html="
                  Intl.NumberFormat($store.state.configuration.lang, {
                    notation: b_shortenNumber ? 'compact' : 'standard',
                    maximumFractionDigits: b_shortenNumber ? 1 : 0,
                  }).formatToParts(currentStats.currentFollowers).reduce(numberReducer, '')
                "
              />
              <small
                v-if="b_showAvgDiff && isStreamOnline && currentStats.currentFollowers - averageStats.currentFollowers !== 0"
                class="text-caption"
                :class="{
                  'green--text': isTrending('currentFollowers'),
                  'red--text': !isTrending('currentFollowers'),
                }"
              >
                <v-icon
                  :style="{
                    'vertical-align': isTrending('currentFollowers') ? 'super' : 'sub',
                  }"
                  x-small
                  :color="isTrending('currentFollowers') ? 'green' : 'red'"
                >{{ isTrending('currentFollowers') ? mdiTrendingUp : mdiTrendingDown }}</v-icon>
                <span
                  :style="{
                    'vertical-align': isTrending('currentFollowers') ? 'super' : 'sub',
                  }"
                  v-html="
                    Intl.NumberFormat($store.state.configuration.lang, {
                      style: b_percentage ? 'percent' : 'decimal',
                      notation: b_shortenNumber ? 'compact' : 'standard',
                      maximumFractionDigits: b_shortenNumber && !b_percentage ? 1 : 0,
                    }).format(b_percentage ? Math.abs(currentStats.currentFollowers - averageStats.currentFollowers) / (averageStats.currentFollowers || 1) : currentStats.currentFollowers - averageStats.currentFollowers)
                  "
                />
              </small>
            </v-card-title>
            <v-card-subtitle class="pa-1 text-caption">
              {{ translate('followers') }}
            </v-card-subtitle>
          </v-card>
        </v-col>

        <v-col
          cols="6"
          lg="1"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-card
            v-else
            tile
            min-height="60"
            elevation="1"
          >
            <v-card-title
              v-if="broadcasterType !== ''"
              class="pa-1"
            >
              <span
                v-html="
                  Intl.NumberFormat($store.state.configuration.lang, {
                    notation: b_shortenNumber ? 'compact' : 'standard',
                    maximumFractionDigits: b_shortenNumber ? 1 : 0,
                  }).formatToParts(currentStats.currentSubscribers).reduce(numberReducer, '')
                "
              />
              <small
                v-if="b_showAvgDiff && isStreamOnline && currentStats.currentSubscribers - averageStats.currentSubscribers !== 0"
                class="text-caption"
                :class="{
                  'green--text': isTrending('currentSubscribers'),
                  'red--text': !isTrending('currentSubscribers'),
                }"
              >
                <v-icon
                  :style="{
                    'vertical-align': isTrending('currentSubscribers') ? 'super' : 'sub',
                  }"
                  x-small
                  :color="isTrending('currentSubscribers') ? 'green' : 'red'"
                >{{ isTrending('currentSubscribers') ? mdiTrendingUp : mdiTrendingDown }}</v-icon>
                <span
                  :style="{
                    'vertical-align': isTrending('currentSubscribers') ? 'super' : 'sub',
                  }"
                  v-html="
                    Intl.NumberFormat($store.state.configuration.lang, {
                      style: b_percentage ? 'percent' : 'decimal',
                      notation: b_shortenNumber ? 'compact' : 'standard',
                      maximumFractionDigits: b_shortenNumber && !b_percentage ? 1 : 0,
                    }).format(b_percentage ? Math.abs(currentStats.currentSubscribers - averageStats.currentSubscribers) / (averageStats.currentSubscribers || 1) : currentStats.currentSubscribers - averageStats.currentSubscribers)
                  "
                />
              </small>
            </v-card-title>
            <v-card-title
              v-else
              class="pa-1"
            >
              {{ translate('not-affiliate-or-partner') }}
            </v-card-title>
            <v-card-subtitle class="pa-1 text-caption">
              {{ translate('subscribers') }}
            </v-card-subtitle>
          </v-card>
        </v-col>

        <v-col
          cols="6"
          lg="1"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-card
            v-else
            tile
            min-height="60"
            elevation="1"
          >
            <v-card-title
              v-if="broadcasterType !== ''"
              class="pa-1"
            >
              <span
                v-html="
                  Intl.NumberFormat($store.state.configuration.lang, {
                    notation: b_shortenNumber ? 'compact' : 'standard',
                    maximumFractionDigits: b_shortenNumber ? 1 : 0,
                  }).formatToParts(isStreamOnline ? currentStats.currentBits : 0).reduce(numberReducer, '')
                "
              />
              <small
                v-if="b_showAvgDiff && isStreamOnline && currentStats.currentBits - averageStats.currentBits !== 0"
                class="text-caption"
                :class="{
                  'green--text': isTrending('currentBits'),
                  'red--text': !isTrending('currentBits'),
                }"
              >
                <v-icon
                  :style="{
                    'vertical-align': isTrending('currentBits') ? 'super' : 'sub',
                  }"
                  x-small
                  :color="isTrending('currentBits') ? 'green' : 'red'"
                >{{ isTrending('currentBits') ? mdiTrendingUp : mdiTrendingDown }}</v-icon>
                <span
                  :style="{
                    'vertical-align': isTrending('currentBits') ? 'super' : 'sub',
                  }"
                  v-html="
                    Intl.NumberFormat($store.state.configuration.lang, {
                      style: b_percentage ? 'percent' : 'decimal',
                      notation: b_shortenNumber ? 'compact' : 'standard',
                      maximumFractionDigits: b_shortenNumber && !b_percentage ? 1 : 0,
                    }).format(b_percentage ? Math.abs(currentStats.currentBits - averageStats.currentBits) / (averageStats.currentBits || 1) : currentStats.currentBits - averageStats.currentBits)
                  "
                />
              </small>
            </v-card-title>
            <v-card-title
              v-else
              class="pa-1"
            >
              {{ translate('not-affiliate-or-partner') }}
            </v-card-title>
            <v-card-subtitle class="pa-1 text-caption">
              {{ translate('bits') }}
            </v-card-subtitle>
          </v-card>
        </v-col>

        <v-col
          cols="6"
          lg="1"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-card
            v-else
            tile
            min-height="60"
            elevation="1"
          >
            <v-card-title
              :key="timestamp"
              class="pa-1"
            >
              <span
                v-html="
                  Intl.NumberFormat($store.state.configuration.lang, {
                    style: 'currency',
                    currency: $store.state.configuration.currency,
                  }).formatToParts(isStreamOnline ? currentStats.currentTips : 0).reduce(numberReducer, '')
                "
              />
              <small
                v-if="b_showAvgDiff && isStreamOnline && currentStats.currentTips - averageStats.currentTips !== 0"
                class="text-caption"
                :class="{
                  'green--text': isTrending('currentTips'),
                  'red--text': ~isTrending('currentTips'),
                }"
              >>
                <v-icon
                  :style="{
                    'vertical-align': isTrending('currentTips') ? 'super' : 'sub',
                  }"
                  x-small
                  :color="isTrending('currentTips') ? 'green' : 'red'"
                >{{ isTrending('currentTips') ? mdiTrendingUp : mdiTrendingDown }}</v-icon>
                <span
                  :style="{
                    'vertical-align': isTrending('currentTips') ? 'super' : 'sub',
                  }"
                  v-html="
                    Intl.NumberFormat($store.state.configuration.lang, {
                      style: b_percentage ? 'percent' : 'currency',
                      currency: $store.state.configuration.currency,
                    }).format(b_percentage ? Math.abs(currentStats.currentTips - averageStats.currentTips) / (averageStats.currentTips || 1) : currentStats.currentTips - averageStats.currentTips)
                  "
                />
              </small>
            </v-card-title>
            <v-card-subtitle class="pa-1 text-caption">
              {{ translate('tips') }}
            </v-card-subtitle>
          </v-card>
        </v-col>

        <v-col
          cols="6"
          lg="1"
          md="4"
          sm="4"
        >
          <v-skeleton-loader
            v-if="!isLoaded"
            type="card"
            min-height="60"
            max-height="60"
          />
          <v-card
            v-else
            tile
            min-height="60"
            elevation="1"
          >
            <v-card-title
              :key="timestamp"
              class="pa-1"
            >
              <span
                class="data"
                v-html="
                  [
                    ...Intl.NumberFormat($store.state.configuration.lang, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).formatToParts((isStreamOnline ? currentStats.currentWatched : 0) / 1000 / 60 / 60),
                    { type:'', value: ' '},
                    { type:'currency', value: 'h'}
                  ].reduce(numberReducer, '')
                "
              />
              <small
                v-if="b_showAvgDiff && isStreamOnline && currentStats.currentWatched - averageStats.currentWatched !== 0"
                class="text-caption"
                :class="{
                  'green--text': isTrending('currentWatched'),
                  'red--text': ~isTrending('currentWatched'),
                }"
              >
                <v-icon
                  :style="{
                    'vertical-align': isTrending('currentWatched') ? 'super' : 'sub',
                  }"
                  x-small
                  :color="isTrending('currentWatched') ? 'green' : 'red'"
                >{{ isTrending('currentWatched') ? mdiTrendingUp : mdiTrendingDown }}</v-icon>
                <span
                  v-if="b_percentage"
                  :style="{
                    'vertical-align': isTrending('currentWathced') ? 'super' : 'sub',
                  }"
                  v-html="
                    [
                      ...Intl.NumberFormat($store.state.configuration.lang, {
                        style: 'percent',
                      }).formatToParts(averageStats.currentWatched / currentStats.currentWatched),
                    ].reduce(numberReducer, '')
                  "
                />
                <span
                  v-else
                  :style="{
                    'vertical-align': isTrending('currentWathced') ? 'super' : 'sub',
                  }"
                  v-html="
                    [
                      ...Intl.NumberFormat($store.state.configuration.lang, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).formatToParts((currentStats.currentWatched - averageStats.currentWatched) / 1000 / 60 / 60),
                      { type:'', value: ' '},
                      { type:'', value: 'h'}
                    ].reduce(numberReducer, '')
                  "
                />
              </small>
            </v-card-title>
            <v-card-subtitle class="pa-1 text-caption">
              {{ translate('watched-time') }}
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
  <!--div
    ref="quickwindow"
    class="stream-info-container container-fluid"
    :class="{ 'sticky-top': b_sticky }"
    :style="{ 'top': b_sticky ? top + 'px' : undefined }"
  >
    <b-toast
      v-for="error of errors"
      :key="error.name + error.message + error.date"
      :title="error.name"
      :no-auto-hide="getErrorType(error.type) !== 'success'"
      visible
      :variant="getErrorType(error.type)"
    >
      <div v-html="error.message" />
    </b-toast>
    <b-toast
      v-if="!$store.state.configuration.isChannelSet"
      :title="translate('errors.channel_is_not_set')"
      no-auto-hide
      visible
      variant="danger"
      solid
    >
      <div v-html="translate('errors.please_set_your_channel')" />
    </b-toast>
    <b-toast
      v-if="!$store.state.configuration.isCastersSet"
      :title="translate('errors.owner_and_broadcaster_oauth_is_not_set')"
      no-auto-hide
      visible
      variant="danger"
      solid
    >
      <div v-html="translate('errors.please_set_your_broadcaster_oauth_or_owners')" />
    </b-toast>
    <b-toast
      v-if="update.version"
      :title="translate('errors.new_update_available')"
      no-auto-hide
      visible
      variant="info"
      solid
    >
      <div v-html="translate('errors.new_bot_version_available_at').replace(/\$version/gmi, update.version)" />
    </b-toast>
    <template v-if="!isLoaded">
      <div class="mx-auto text-center p-3 pt-4">
        <div
          class="spinner-grow"
          role="status"
        />
      </div>
    </template>
    <template v-else>

      <div class="row">
        <div
          class="col-12 col-sm-12 col-md-4 col-lg-4 stream-info"
          @click="showGameAndTitleDlg"
        >
          <span
            v-if="game"
            class="data"
            :title="game"
          >{{ game }}</span>
          <span
            v-else
            class="data"
          >{{ translate('not-available') }}</span>
          <h2>
            <span>{{ translate('game') }}</span>
            <small>{{ translate('click-to-change') }}</small>
          </h2>
        </div>

        <div
          class="col-12 col-sm-12 col-md-4 col-lg-4 stream-info"
          @click="showGameAndTitleDlg"
        >
          <span
            v-if="title"
            class="data"
            :title="rawStatus"
            v-html="title"
          />
          <span
            v-else
            class="data"
          >{{ translate('not-available') }}</span>
          <span class="data">
            <small
              v-for="tag of filterTags(true)"
              :key="tag.name"
              :class="{ 'text-muted': tag.is_auto }"
              :title="tag.is_auto ? 'Automatically added tag' : 'Manual tag'"
            >
              {{ tag.name }}
            </small>
            <span
              v-for="tag of filterTags(false)"
              :key="tag.name"
              :class="{ 'text-muted': tag.is_auto }"
              :title="tag.is_auto ? 'Automatically added tag' : 'Manual tag'"
            >
              {{ tag.name }}
            </span>
          </span>
          <h2>
            <span>{{ translate('title') }}</span>
            <small>{{ translate('click-to-change') }}</small>
          </h2>
        </div>

        <div class="col-12 col-sm-12 col-md-4 col-lg-4 stream-info">
          <span class="data">
            {{ currentSong }}
          </span>
          <h2>
            <span>{{ translate('currentsong') }}</span>
          </h2>
        </div>
      </div>
    </template>
  </div-->
</template>

<script lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
<<<<<<< HEAD
import { getSocket } from '@sogebot/ui-helpers/socket';
import translate from '@sogebot/ui-helpers/translate';
=======
import { mdiTrendingDown, mdiTrendingUp } from '@mdi/js';
>>>>>>> feat(vuetify): add vuetify UI
import {
  computed, ComputedRef, defineComponent, onMounted, onUnmounted, reactive, ref, watch,
} from '@vue/composition-api';
import type { Ref } from '@vue/composition-api';
import { isNil } from 'lodash-es';

import { getTime } from 'src/bot/helpers/getTime';
import { EventBus } from 'src/panel/helpers/event-bus';

library.add(faCaretDown, faCaretUp);

let interval = 0;
let UIErrorInterval = 0;

const highlightsSocket = getSocket('/systems/highlights');
const socket = getSocket('/');

const numberReducer = (out: string, item: any) => {
  if (['currency', 'compact'].includes(item.type)) {
    out += `<small class="text-muted">${item.value}</small>`;
  } else {
    out += item.value;
  }
  return out;
};

export default defineComponent({
  setup(props, context) {
    const averageStats: any = reactive({});
    const currentStats: any = reactive({});
    const hideStats = ref(localStorage.getItem('hideStats') === 'true');
    const timestamp: Ref<null | number> = ref(null);
    const uptime = ref(null);
    const currentSong = ref(null);
    const broadcasterType = ref('');
    const tags: Ref<{ is_auto: boolean; localization_names: { [x:string]: string } }[]> = ref([]);
    const version = ref('');
    const update: {
      version: null | string;
    } = reactive({ version: null });
    const title: Ref<null | string> = ref(null);
    const game: Ref<null | string> = ref(null);
    const rawStatus = ref('');
    const cachedTitle = ref('');
    const isLoaded = ref(false);
    const top = ref('50');

    const isStreamOnline = computed(() => uptime.value !== null);
    const b_percentage = computed(() => context.root.$store.state.configuration.core.ui.percentage);
    const b_showAvgDiff = computed(() => context.root.$store.state.configuration.core.ui.showdiff);
    const b_shortenNumber: ComputedRef<boolean> = computed(() => context.root.$store.state.configuration.core.ui.shortennumbers);

    // $refs
    const quickwindow = ref(null);

    watch(isStreamOnline, () => {
      getLatestStats();
    });

    const showGameAndTitleDlg = () => EventBus.$emit('show-game_and_title_dlg');
    const loadCustomVariableValue = async (variable: string) => {
      return new Promise<string>((resolve, reject) => {
        socket.emit('custom.variable.value', variable, (err: string | null, value: string) => {
          resolve(value);
        });
      });
    };
    const generateTitle = async (current: string, raw: string) => {
      if (raw.length === 0) {
        return current;
      }

      const variables = raw.match(/(\$_[a-zA-Z0-9_]+)/g);
      if (cachedTitle.value === current && isNil(variables)) {
        return cachedTitle.value;
      }

      if (!isNil(variables)) {
        for (const variable of variables) {
          const value = await loadCustomVariableValue(variable);
          raw = raw.replace(variable, `<strong style="border-bottom: 1px dotted gray" data-toggle="tooltip" data-placement="bottom" title="${variable}">${value}</strong>`);
        }
      }
      cachedTitle.value = raw;
      return raw;
    };
    const saveHighlight = () => highlightsSocket.emit('highlight');
    const filterTags = (is_auto: boolean) => {
      return tags.value.filter(o => !!o.is_auto === is_auto).map((o) => {
        const key = Object.keys(o.localization_names).find(key2 => key2.includes(context.root.$store.state.configuration.lang));
        return { name: o.localization_names[key || 'en-us'], is_auto: !!o.is_auto };
      }).sort((a, b) => {
        if ((a || { name: '' }).name < (b || { name: '' }).name)  { //sort string ascending
          return -1;
        }
        if ((a || { name: '' }).name > (b || { name: '' }).name) {
          return 1;
        }
        return 0; //default return value (no sorting)
      });
    };
    const toggleViewerShow = () => {
      hideStats.value = !hideStats.value;
      localStorage.setItem('hideStats', String(hideStats.value));
    };
    const getLatestStats = () => {
      socket.emit('getLatestStats', (err: string | null, data: any) => {
        console.groupCollapsed('navbar::getLatestStats');
        if (err) {
          return console.error(err);
        }
        console.log(data);
        console.groupEnd();
        for (const key of Object.keys(data)) {
          averageStats[key] = data[key];
        }
      });
    };

    onMounted(() => {

      socket.emit('version', async (recvVersion: string) => {
        version.value = recvVersion;

        const { response } = await new Promise<{ response: Record<string, any>}>(resolve => {
          const request = new XMLHttpRequest();
          request.open('GET', 'https://api.github.com/repos/sogehige/sogebot/releases/latest', true);

          request.onload = function() {
            if (!(this.status >= 200 && this.status < 400)) {
              console.error('Error getting version from git', this.status, this.response);
            }
            resolve({ response: JSON.parse(this.response) });
          };
          request.onerror = function() {
            console.error('Connection error to github');
            resolve( { response: {} });
          };

          request.send();
        });
        const botVersion = recvVersion.replace('-SNAPSHOT', '').split('.').map(o => Number(o));
        const gitVersion = (response.tag_name as string).split('.').map(o => Number(o));
        console.debug({ botVersion, gitVersion });

        let isNewer = false;
        for (let index = 0; index < botVersion.length; index++) {
          if (botVersion[index] < gitVersion[index]) {
            isNewer = true;
            break;
          } else if (botVersion[index] === gitVersion[index]) {
            continue;
          } else {
            isNewer = false;
            break;
          }
        }

        if (isNewer) {
          update.version = gitVersion.join('.');
        }
      });

      UIErrorInterval = window.setInterval(() => {
        socket.emit('panel::alerts', (err: string | null, data: { errors: { name: string; message: string }[], warns: { name: string; message: string }[] }) => {
          if (err) {
            return console.error(err);
          }
          for (const error of data.errors) {
            console.error(`UIError: ${error.name} ¦ ${error.message}`);
            EventBus.$emit('snack', 'red', `<h4>${error.name}</h4><div>${error.message}</div>`);
          }
          for (const error of data.warns) {
            console.info(`UIWarn: ${error.name} ¦ ${error.message}`);
            EventBus.$emit('snack', 'orange', `<h4>${error.name}</h4><div>${error.message}</div>`);
          }
        });
      }, 5000);

      getLatestStats();

      socket.emit('panel::resetStatsState');
      socket.on('panel::stats', async (data: Record<string, any>) => {
        console.groupCollapsed('panel::stats');
        console.log(data);
        console.groupEnd();

        broadcasterType.value = data.broadcasterType;
        uptime.value = data.uptime;
        for (const key of Object.keys(data)) {
          currentStats[key] = data[key];
        }
        isLoaded.value = true;
        title.value = await generateTitle(data.status, data.rawStatus);
        rawStatus.value = data.rawStatus;

        context.root.$store.commit('setCurrentGame', game.value);
        context.root.$store.commit('setCurrentTitle', title.value);
        context.root.$store.commit('setCurrentTags', tags.value);
      });

      interval = window.setInterval(() => {
        timestamp.value = Date.now();
      }, 1000);
    });
    onUnmounted(() => {
      clearInterval(interval);
      clearInterval(UIErrorInterval);
    });

    const isTrending = (key: string) => {
      return currentStats[key] - averageStats[key] > 0;
    };

    return {
      isTrending,
      averageStats,
      currentStats,
      hideStats,
      timestamp,
      uptime,
      currentSong,
      broadcasterType,
      tags,
      version,
      update,
      title,
      game,
      rawStatus,
      cachedTitle,
      isLoaded,
      top,
      isStreamOnline,
      b_percentage,
      b_showAvgDiff,
      b_shortenNumber,
      showGameAndTitleDlg,
      saveHighlight,
      filterTags,
      toggleViewerShow,
      quickwindow,
      getTime,
      translate,
      numberReducer,
      mdiTrendingDown, mdiTrendingUp,
    };
  },
});
</script>

<style scoped>
@media (max-width : 576px) {
  .stream-info:first-child::before {
    border-left: 0;
  }
  .stream-info:nth-child(2n-1)::before {
    border-left: 0;
  }
}

@media (min-width : 576px) and (max-width : 992px) {
  .stream-info:first-child::before {
    border-left: 0;
  }
  .stream-info:nth-child(3n+1)::before {
    border-left: 0;
  }
}

@media (min-width : 992px){
  .stream-info:nth-child(13)::before {
    border-left: 0;
  }
}
</style>