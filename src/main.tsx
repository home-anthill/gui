import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MantineProvider } from '@mantine/core';

import { store } from './store';
import { theme } from './theme/theme';
import App from './app/app';

import './styles/global.scss';


const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
      <Provider store={store}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <App />
        </MantineProvider>
      </Provider>
  </StrictMode>,
);
