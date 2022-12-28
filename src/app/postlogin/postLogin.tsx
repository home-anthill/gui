import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import useAuth from '../../hooks/useAuth';

export function PostLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token: string | null = new URLSearchParams(location.search).get('token');
    if (!token) {
      console.error('postlogin - cannot read token from query parameters');
      return;
    }
    login(token);
    navigate('/main');
  });

  return (
    <div>
      <h1>PostLogin</h1>
      <div>{location.pathname}</div>
    </div>
  );
}

export default PostLogin;
