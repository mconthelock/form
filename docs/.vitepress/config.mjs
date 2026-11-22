import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitepress';
import dotenv from 'dotenv';
import * as sidebar from './sidebar.js';

// โหลดไฟล์ .env ที่ root ของโปรเจกต์
dotenv.config();

const APP_NAME = process.env.APP_NAME || 'form';
const APP_ID = process.env.APP_ID || '1';
const APP_HOST = process.env.APP_HOST || '';
const APP_ENV = process.env.APP_ENV || '';
const APP_API = process.env.APP_API || '';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'New Webflow',
    description: 'คู่มือการใช้งานระบบ Form (E-Form & Approval Workflow)',
    base: '/form/docs/', // หากไม่ชี้ตาม outDir ต้องมี .htaccess
    outDir: 'dist', // โฟลเดอร์ปลายทางเมื่อ build
    head: [
        [
            'link',
            {
                rel: 'icon',
                href: `${process.env.VITE_APP_HOST || APP_HOST}/assets/images/favicon.ico`,
            },
        ],
    ],
    markdown: {
        image: {
            lazyLoading: true,
        },
    },
    vite: {
        resolve: {
            alias: [
                {
                    find: /^.*\/VPSidebarGroup\.vue$/,
                    replacement: fileURLToPath(
                        new URL(
                            './theme/components/VPSidebarGroup.vue',
                            import.meta.url,
                        ),
                    ),
                },
            ],
        },
    },
    themeConfig: {
        logo: '/image/icon_192.png',
        search: {
            provider: 'local',
        },
        auth: {
            appName: APP_NAME,
            appId: APP_ID,
            appHost: APP_HOST,
            appEnv: APP_ENV,
            appApi: APP_API,
        },
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/quick-start' },
            { text: 'Change Log', link: '/changelog' },
        ],
        sidebar: {
            '/': [
                { text: 'Quick Start', link: '/quick-start', roles: ['*'] },
                { text: 'Change Log', link: '/changelog', roles: ['*'] },
                {
                    text: 'IS Form',
                    link: '/form/isform/is-cfs',
                    roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
                },
                {
                    text: 'QA Form',
                    link: '/form/qaform/qa-ins',
                    roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
                },
                {
                    text: 'Advanced Features',
                    link: '/form/tool/qrcode',
                    roles: ['ADMIN', 'MANAGER'],
                },
            ],
            '/form/isform/': sidebar.isFormItem,
            '/form/qaform/': sidebar.qaFormItem,
            '/form/tool/': sidebar.toolItem,
        },
    },
    // ควบคุมหน้า index.md จาก env
    transformPageData(pageData) {
        if (pageData.relativePath === 'index.md') {
            pageData.frontmatter ||= {};
            pageData.frontmatter.hero = {
                ...(pageData.frontmatter.hero || {}),
                name: process.env.VITE_APP_NAME || 'New Webflow',
                text: process.env.VITE_APP_TEXT || 'E-Form & Approval Manual',
                tagline:
                    process.env.VITE_APP_TAGLINE ||
                    'คู่มือระบบแบบฟอร์มอิเล็กทรอนิกส์และสายการอนุมัติครบวงจร สำหรับทุกหน่วยงาน',
                actions: [
                    {
                        theme: 'brand',
                        text: 'Quick Start',
                        link: '/quick-start',
                    },
                    {
                        theme: 'alt',
                        text: 'Change Log',
                        link: '/changelog',
                    },
                    ...(APP_ENV || APP_HOST
                        ? [
                              {
                                  theme: 'alt',
                                  text: 'เข้าสู่ระบบ Form',
                                  link: APP_ENV
                                      ? `${APP_ENV.replace(/\/+$/, '')}/home`
                                      : `${APP_HOST.replace(/\/+$/, '')}/form/home`,
                              },
                          ]
                        : []),
                ],
            };
        }
    },
});
