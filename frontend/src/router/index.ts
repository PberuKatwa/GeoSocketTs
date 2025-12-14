import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import map from '@/views/map.vue'
import mapServe from '@/components/mapServe.vue'
import mapServe2 from '@/components/mapServe2.vue'
import mapServe3 from '@/components/mapServe3.vue'

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
  {
    path:'/map/:id',
    name:'map-driver-id',
    component:mapServe2
  },
  {
    path:'/map2/:id',
    name:'map-driver-id2',
    component:mapServe3
  },

]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
