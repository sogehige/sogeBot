import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

export default new Vuetify({
  icons:      { iconfont: 'mdiSvg' },
  breakpoint: { mobileBreakpoint: 'sm' }, // This is equivalent to a value of 960
});