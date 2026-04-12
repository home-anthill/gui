import { RouterProvider } from 'react-router-dom';

import { router } from './routes';
import { ErrorBoundary } from '../shared/errorboundary/ErrorBoundary';
import '../styles/global.scss';

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
