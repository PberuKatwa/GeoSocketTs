import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import map from '@/views/map.vue'
import mapServe from '@/components/mapServe.vue'

const routes:Array<RouteRecordRaw> =[

  {
    path:'/map-test',
    name:'map-test',
    component:map
  },
  {
    path:'/map-serve',
    name:'map-test',
    component:mapServe
  },

]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
