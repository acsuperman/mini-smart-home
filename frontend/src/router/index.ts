import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/login',
            component: () => import('@/pages/login/index.vue'),
            meta: { requiresAuth: false }
        },
        {
            path: '/home',
            component: () => import('@/pages/home/index.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/login',
        },
    ],
})

router.beforeEach((to) => {
    const userStore = useUserStore()
    if (to.meta.requiresAuth && !userStore.cloudSideConnect) {
        return '/login'
    }
    if (to.path === "/login" && userStore.cloudSideConnect) {
        return "/home"
    }
})

export default router
