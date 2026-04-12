import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Text, Paper } from '@mantine/core';
import {
  IconBrandGithub,
  IconThermometer,
  IconHome2,
  IconAdjustments,
  IconDeviceMobile,
} from '@tabler/icons-react';

import loginBrandLogo from '../../assets/login-brand-logo.svg';

import { isLoggedIn } from '../../auth/auth-utils';
import styles from './login.module.scss';

const features = [
  {
    id: 'real-time-sensors',
    icon: IconThermometer,
    title: 'Real-time Sensors',
    desc: 'Temperature, humidity, air quality, and much more, always up to date.',
  },
  {
    id: 'homes-and-rooms',
    icon: IconHome2,
    title: 'Homes and Rooms',
    desc: 'Organize every device by home and room with ease.',
  },
  {
    id: 'remote-control',
    icon: IconAdjustments,
    title: 'Remote Control',
    desc: 'Send commands to actuators and control your smart devices from a single point.',
  },
  {
    id: 'anywhere-you-are',
    icon: IconDeviceMobile,
    title: 'Anywhere You Are',
    desc: 'Available as a web app and as a native Android app: access your system from a browser or directly from your smartphone.',
  },
];

export function Login() {
  const navigate = useNavigate();

  function onLogin() {
    if (window && window.location && window.location.href) {
      window.location.href = '/api/login';
    }
  }

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className={styles['login-page']}>
      {/* ── Left: brand & description ── */}
      <div className={styles['login-brand']}>
        <div className={styles['login-brand-inner']}>
          <div className={styles['login-brand-logo']}>
            <img
              src={loginBrandLogo}
              alt="Home Anthill"
              className={styles['login-brand-icon']}
            />
            <Text
              size="xl"
              fw={700}
              c="orange"
              className={styles['login-brand-name'] ?? ''}
            >
              Home Anthill
            </Text>
          </div>

          <p className={styles['login-brand-tagline']}>
            Your smart ecosystem,
            <br />
            <span className={styles['login-brand-tagline-accent']}>
              all under control.
            </span>
          </p>

          <p className={styles['login-brand-desc']}>
            Home Anthill is the IoT platform that transforms your home into a
            smart and connected organism. Like an anthill, every sensor and
            every device works together precisely and coordinated — and you have
            full visibility on everything, in one place.
          </p>

          <ul className={styles['login-features']}>
            {features.map(({ id, icon: Icon, title, desc }) => (
              <li key={id} className={styles['login-features-item']}>
                <div className={styles['login-features-icon']}>
                  <Icon size={18} stroke={1.8} />
                </div>
                <div className={styles['login-features-text']}>
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right: login card ── */}
      <div className={styles['login-panel']}>
        <Paper className={styles['login-card'] ?? ''} p="xl" radius="md" withBorder>
          <div className={styles['login-header']}>
            <img
              src={loginBrandLogo}
              alt="Home Anthill"
              className={styles['login-card-icon']}
            />
            <Text
              size="xl"
              fw={700}
              c="orange"
              className={styles['login-card-title'] ?? ''}
            >
              Home Anthill
            </Text>
            <Text
              size="sm"
              c="dimmed"
              mt={4}
              style={{ textAlign: 'center' }}
              className={styles['login-card-subtitle'] ?? ''}
            >
              Your smart ecosystem, all under control.
            </Text>
            <Text size="sm" c="dimmed" mt="xs" style={{ textAlign: 'center' }}>
              Log in to manage your home IoT system
            </Text>
          </div>

          <Button
            leftSection={<IconBrandGithub size={20} />}
            fullWidth
            size="lg"
            color="orange"
            mt="xl"
            onClick={onLogin}
          >
            Sign in with GitHub
          </Button>

          <Text size="xs" c="dimmed" style={{ textAlign: 'center' }} mt="md">
            No account? Just use your GitHub credentials.
          </Text>
        </Paper>
      </div>
    </div>
  );
}

export default Login;
