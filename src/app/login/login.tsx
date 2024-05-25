import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Link, Typography } from '@mui/material';

import { isLoggedIn } from '../../auth/auth-utils';
import { useLogin } from '../../hooks/useLogin';

import styles from './login.module.scss';
import logoPng from '../../assets/home-anthill.png'

export function Login() {
  const {login} = useLogin();
  const navigate = useNavigate();

  function onLogin() {
    if (window && window.location && window.location.href) {
      window.location.href = login.loginURL;
    }
  }

  useEffect(() => {
    if (isLoggedIn()) {
      console.log(`login - already logged in, navigating to 'main'`);
      navigate('/main');
    }
  }, [navigate])

  return (
    <div className={styles['login']}>
      <Typography variant="h2" component="h1" textAlign={'center'}>
        Welcome to home-anthill
      </Typography>
      <img className={styles['logo']} src={logoPng} width="250" height="auto" alt="Home Anthill"></img>
      <Button variant="contained" onClick={onLogin} disabled={!login?.loginURL}>LOGIN</Button>
      <Link href="https://www.freepik.com/free-vector/underground-ant-nest-with-red-ants_18582279.htm"
            sx={{marginTop: '45px'}}
            underline="hover"
            title="air conditioner icons">
        Image by brgfx
      </Link>
    </div>
  );
}

export default Login;
