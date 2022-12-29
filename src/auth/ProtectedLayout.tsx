import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import useAuth from '../hooks/useAuth';

// Record<string, never> is equivalent to an empty object {}
export default function ProtectedLayout(props: PropsWithChildren<Record<string, never>>) {
  const {isLogged} = useAuth();
  const location = useLocation();

  if (!isLogged()) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{from: location}}/>;
  }

  return props.children;
}
