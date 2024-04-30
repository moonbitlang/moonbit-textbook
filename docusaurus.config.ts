import fs from 'node:fs/promises';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import rehypeShiki, { RehypeShikiOptions } from '@shikijs/rehype';
import { bundledLanguages } from 'shiki';

const rehypeShikiPlugin = [
  rehypeShiki,
  {
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    langs: [
      ...(Object.keys(bundledLanguages) as Array<keyof typeof bundledLanguages>),
      async () => JSON.parse(await fs.readFile('./languages/moonbit.tmLanguage.json', 'utf-8')),
    ],
  } as RehypeShikiOptions,
];

const config: Config = {
  title: 'Modern Programming Ideology',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://moonbitlang.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/moonbit-textbook/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'moonbitlang', // Usually your GitHub org/user name.
  projectName: 'moonbit-textbook', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeMathjax, rehypeShikiPlugin],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ]
  ],

  themeConfig: {
    navbar: {
      title: 'Modern Programming Ideology',
      logo: {
        alt: 'MoonBit Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'textbookSidebar',
          position: 'left',
          label: 'Textbook',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} IDEA. All rights reserved.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
