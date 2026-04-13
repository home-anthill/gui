import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

import useAuth from '../../hooks/useAuth';

export function PostLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const executed = useRef(false);

  useEffect(() => {
    if (executed.current) return;
    executed.current = true;

    const hash = location.hash.slice(1); // strip leading '#'
    const token: string | null = new URLSearchParams(hash).get('token');
    if (!token) {
      navigate('/');
      return;
    }
    login(token);
    navigate('/');
  }, [location, navigate, login]);

  return (
    <div>
      <h1>PostLogin</h1>
    </div>
  );
}

export default PostLogin;
