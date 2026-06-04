import { createBrowserRouter } from 'react-router-dom';

import RootLayout from './rootlayout';
import ProtectedLayout from '../auth/ProtectedLayout';
import { AuthLayout } from '../auth/AuthLayout';
import { RouteErrorBoundary } from '../shared/errorboundary/RouteErrorBoundary';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      // --- Public routes ---
      {
        path: '/login',
        lazy: async () => ({
          Component: (await import('./login/login')).default,
        }),
      },
      {
        path: '/postlogin',
        lazy: async () => ({
          Component: (await import('./postlogin/postLogin')).default,
        }),
      },
      // --- Protected routes ---
      {
        path: '/',
        element: (
          <ProtectedLayout>
            <RootLayout />
          </ProtectedLayout>
        ),
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./devices/devices')).default,
            }),
          },
          {
            path: 'devices',
            lazy: async () => ({
              Component: (await import('./devices/devices')).default,
            }),
          },
          {
            path: 'devices/:id',
            lazy: async () => ({
              Component: (await import('./devicedetail/devicedetails')).default,
            }),
          },
          {
            path: 'homes',
            lazy: async () => ({
              Component: (await import('./homes/homes')).default,
            }),
          },
          {
            path: 'notifications',
            lazy: async () => ({
              Component: (await import('./notifications/notifications')).default,
            }),
          },
          {
            path: 'profile',
            lazy: async () => ({
              Component: (await import('./profile/profile')).default,
            }),
          },
          {
            path: '*',
            element: (
              <main style={{ padding: '1rem' }}>
                <p>There's nothing here!</p>
              </main>
            ),
          },
        ],
      },
      // --- Global fallback ---
      {
        path: '*',
        lazy: async () => ({
          Component: (await import('../shared/notfound/notfoundpage'))
            .NotFoundPage,
        }),
      },
    ],
  },
]);
