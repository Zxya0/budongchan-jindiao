import { createRouter, createWebHistory } from 'vue-router'
import EntryView from '../views/EntryView.vue'
import StageView from '../views/StageView.vue'
import RealEstateStageView from '../views/RealEstateStageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'entry',
      component: EntryView
    },
    {
      path: '/stage',
      name: 'stage',
      component: StageView
    },
    {
      path: '/real-estate-stage',
      name: 'realEstateStage',
      component: RealEstateStageView
    }
  ]
})

export default router
