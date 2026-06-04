import { useRouteError } from 'react-router-dom';

import { ErrorFallback } from './ErrorFallback';

export function RouteErrorBoundary() {
  const error = useRouteError();

  return <ErrorFallback error={error} />;
}
