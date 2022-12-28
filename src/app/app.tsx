import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import AuthProvider from '../auth/AuthProvider';
import Login from './login/login';
import PostLogin from './postlogin/postLogin';
import Profile from './profile/profile';
import Main from './main';
import RequireAuth from '../auth/RequireAuth';
import Homes from './homes/homes';
import EditHome from './edithome/edithome';
import Devices from './devices/devices';
import DeviceSettings from './devicesettings/devicesettings';
import Controller from './controller/controller';
import Sensor from './sensor/sensor';

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});

export function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline/>
      <AuthProvider>
        <BrowserRouter>
          <Routes>                         
            <Route path="/" element={<Login/>}/>
            <Route path="login" element={<Login/>}/>
            <Route path="postlogin" element={<PostLogin/>}/>
            <Route path="profile" element={<RequireAuth> <Profile/> </RequireAuth>}/>
            <Route path="main" element={<Main/>}>
              <Route index element={<RequireAuth><Devices/></RequireAuth>}/>
              <Route path="devices" element={<RequireAuth><Devices/></RequireAuth>}/>
              <Route path="devices/:id" element={<RequireAuth><DeviceSettings/></RequireAuth>}/>
              <Route path="devices/:id/controller" element={<RequireAuth><Controller/></RequireAuth>}/>
              <Route path="devices/:id/sensor" element={<RequireAuth><Sensor/></RequireAuth>}/>
              <Route path="homes" element={<RequireAuth> <Homes/> </RequireAuth>}/>
              <Route path="homes/:id/edit" element={<RequireAuth> <EditHome/> </RequireAuth>}/>
            </Route>
            <Route
              path="*"
              element={
                <main style={{padding: '1rem'}}>
                  <p>There's nothing here!</p>
                </main>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
