/**
 * 路由配置
 */

import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Dept from '../views/Dept.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true // 需要登录
    }
  },
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/dept',
    name: 'Dept',
    component: Dept,
    meta: {
      requiresAuth: true // 需要登录
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')

  if (to.meta.requiresAuth && !token) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录访问登录页，跳转到主页
    next('/')
  } else {
    next()
  }
})

export default router

