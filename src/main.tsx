import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { PRList } from './features/purchase-requests/components/PRList'
import { PRCreateForm } from './features/purchase-requests/components/PRCreateForm'
import './index.css'

const rootRoute = createRootRoute({ component: AppLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const prListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/purchase-requests',
  component: PRList,
})

const prCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/purchase-requests/create',
  component: PRCreateForm,
})

const routeTree = rootRoute.addChildren([indexRoute, prListRoute, prCreateRoute])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)