// https://vitepress.dev/guide/custom-theme
import DefaultTheme from 'vitepress/theme';
import './style.css';
import './custom.css';
import Layout from './components/Layout.vue';
import Indent from './components/Indent.vue';
import FancyLightboxImage from './components/FancyLightboxImage.vue';
import RoleOnly from './components/RoleOnly.vue';
import FormScene from './components/FormScene.vue';

/** @type {import('vitepress').Theme} */
export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        app.component('Indent', Indent);
        app.component('FancyLightboxImage', FancyLightboxImage);
        app.component('RoleOnly', RoleOnly);
        app.component('FormScene', FormScene);
    },
};
