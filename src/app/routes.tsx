import { createBrowserRouter } from 'react-router-dom';

import RootLayout from './rootlayout';
import Login from './login/login';
import PostLogin from './postlogin/postLogin';
import Profile from './profile/profile';
import Homes from './homes/homes';
import Devices from './devices/devices';
import DeviceDetail from './devicedetail/devicedetails';
import ProtectedLayout from '../auth/ProtectedLayout';
import { AuthLayout } from '../auth/AuthLayout';
import { NotFoundPage } from '../shared/notfound/notfoundpage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      // --- Public routes ---
      { path: '/login', Component: Login },
      { path: '/postlogin', Component: PostLogin },
      // --- Protected routes ---
      {
        path: '/',
        element: (
          <ProtectedLayout>
            <RootLayout />
          </ProtectedLayout>
        ),
        children: [
          { index: true, Component: Devices }, // match path: 'main/'
          { path: 'devices', Component: Devices },
          { path: 'devices/:id', Component: DeviceDetail },
          { path: 'homes', Component: Homes },
          { path: 'profile', Component: Profile },
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
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
