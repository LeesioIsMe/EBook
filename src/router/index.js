import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/personal',
    children: [
      {
        path: 'personal',
        component: () => import('@/views/personal/index'),
        name: 'personal',
        meta: { title: '个人中心', icon: 'user', affix: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/resources',
    component: Layout,
    name: 'Resource',
    redirect: '/resources/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/resources/index'),
        name: 'ResourceAudit',
        meta: {
          title: '资源审核',
          icon: 'lock',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/ebook',
    component: Layout,
    name: 'EBook',
    redirect: '/ebook/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/ebook/index'),
        name: 'EbookManagement',
        meta: {
          title: '图书管理',
          icon: 'documentation',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    name: 'User',
    redirect: '/user/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/user/index'),
        name: 'UserManagement',
        meta: {
          title: '用户管理',
          icon: 'peoples',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/catrgory',
    component: Layout,
    name: 'Catrgory',
    redirect: '/catrgory/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/category/index'),
        name: 'CatrgoryManagement',
        meta: {
          title: '图书检索',
          icon: 'component',
          roles: ['admin', 'user'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/rend',
    component: Layout,
    name: 'Rend',
    redirect: '/rend/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/rend/index'),
        name: 'RendManagement',
        meta: {
          title: '借阅记录',
          icon: 'list',
          roles: ['admin', 'user'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/download',
    component: Layout,
    name: 'Download',
    redirect: '/download/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/download/index'),
        name: 'DownloadManagement',
        meta: {
          title: '下载记录',
          icon: 'star',
          roles: ['admin', 'user'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/upload',
    component: Layout,
    name: 'Upload',
    redirect: '/upload/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/upload/index'),
        name: 'UploadManagement',
        meta: {
          title: '我上传的',
          icon: 'people',
          roles: ['admin', 'user'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/statistic',
    component: Layout,
    name: 'Statistic',
    redirect: '/statistic/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/statistic/index'),
        name: 'StatisticAnalyze',
        meta: {
          title: '数据分析',
          icon: 'dashboard',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },

  {
    path: '/error',
    component: Layout,
    hidden: true,
    redirect: 'noRedirect',
    name: 'ErrorPages',
    meta: {
      title: 'Error Pages',
      icon: '404'
    },
    children: [
      {
        path: '401',
        component: () => import('@/views/error-page/401'),
        name: 'Page401',
        meta: { title: '401', noCache: true }
      },
      {
        path: '404',
        component: () => import('@/views/error-page/404'),
        name: 'Page404',
        meta: { title: '404', noCache: true }
      }
    ]
  },

  {
    path: '/error-log',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'log',
        component: () => import('@/views/error-log/index'),
        name: 'ErrorLog',
        meta: { title: 'Error Log', icon: 'bug' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
