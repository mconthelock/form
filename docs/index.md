---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
features:
  - icon: 💪
    title: Annual Plan follow up
    details: Monitor and track the progress of your yearly IT plans. Stay updated with the status and advancements of each project to ensure timely completion.
  - icon: ☠️
    title: DataCenter Health Check
    details: Ensure the reliability of your data synchronization with Oracle GoldenGate. Monitor the status and detect any errors in data syncing to maintain data integrity.
  - icon: 🖨️
    title: Put additional information on ID Tags.
    details: Enhance your AS400-generated PDF files with crucial information such as CN No., QC inspection dates, images, and First Lot No. for streamlined Bom material processes.
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'
const imgdir = `public/image/wsd/`;
const members = [
    {
        avatar: `${imgdir}sq12069.jpg`,
        name: 'Chalormsak S.',
        title: 'Developer',
        links: [
        { icon: 'github', link: 'https://github.com/mconthelock' },
        { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
        ]
    },
    {
        avatar: `${imgdir}sq12069.jpg`,
        name: 'Kanittha S.',
        title: 'Form1/Form4 Creator',
        links: [
        { icon: 'github', link: 'https://github.com/yyx990803' },
        { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
        ]
    },
    {
        avatar: 'images/member/sq15199.jpg',
        name: 'Supamid S.',
        title: 'Form3/Specification Form Creator',
        links: [
        { icon: 'github', link: 'https://github.com/yyx990803' },
        { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
        ]
    },
    {
        avatar: 'images/member/sq14198.jpg',
        name: 'Kunyanee L.',
        title: 'Form Release Creator',
        links: [
        { icon: 'github', link: 'https://github.com/yyx990803' },
        { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
        ]
    },
]
</script>
<div style="margin-top: 50px;"></div>
<!-- # Our Team -->
<!-- <VPTeamMembers size="small" :members="members" /> -->
