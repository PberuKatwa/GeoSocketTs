import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LibreMap from '@/components/LibreMap.vue'
import index from '@/views/index.vue'

const routes:Array<RouteRecordRaw> =[
  {
    path:'/',
    name:'index',
    component:index
  },
  {
    path:'/libre-map/:id',
    name:'libre-map',
    component:LibreMap
  },

]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
