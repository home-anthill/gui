import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import Login from './login/login';
import PostLogin from './postlogin/postLogin';
import Profile from './profile/profile';
import Main from './main';
import ProtectedLayout from '../auth/ProtectedLayout';
import Homes from './homes/homes';
import EditHome from './edithome/edithome';
import Devices from './devices/devices';
import DeviceSettings from './devicesettings/devicesettings';
import Controller from './controller/controller';
import Sensor from './sensor/sensor';
import { AuthLayout } from '../auth/AuthLayout';

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthLayout />}>
      <Route path="/" element={<Login/>}/>
      <Route path="login" element={<Login/>}/>
      <Route path="postlogin" element={<PostLogin/>}/>

      <Route path="profile" element={<ProtectedLayout><Profile/></ProtectedLayout>}/>
      <Route path="main" element={<ProtectedLayout><Main/></ProtectedLayout>}>
        <Route index element={<ProtectedLayout><Devices/></ProtectedLayout>}/>
        <Route path="devices" element={<ProtectedLayout><Devices/></ProtectedLayout>}/>
        <Route path="devices/:id" element={<ProtectedLayout><DeviceSettings/></ProtectedLayout>}/>
        <Route path="devices/:id/controller" element={<ProtectedLayout><Controller/></ProtectedLayout>}/>
        <Route path="devices/:id/sensor" element={<ProtectedLayout><Sensor/></ProtectedLayout>}/>
        <Route path="homes" element={<ProtectedLayout> <Homes/> </ProtectedLayout>}/>
        <Route path="homes/:id/edit" element={<ProtectedLayout> <EditHome/> </ProtectedLayout>}/>
        <Route
          path="*"
          element={
            <main style={{padding: '1rem'}}>
              <p>There's nothing here!</p>
            </main>
          }
        />
      </Route>
      <Route
        path="*"
        element={
          <main style={{padding: '1rem'}}>
            <p>There's nothing here!</p>
          </main>
        }
      />
    </Route>
  )
);

export function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline/>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
