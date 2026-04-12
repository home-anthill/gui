import { Avatar, Burger, Text, NavLink, Drawer } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigate, useLocation } from 'react-router';
import { IconDevices, IconHome2 } from '@tabler/icons-react';

import { useProfile } from '../../hooks/useProfile';
import appIcon from '../../assets/logo.svg';

import styles from './navbar.module.scss';

const NAV_ITEMS = [
  { label: 'Devices', icon: IconDevices, path: '/' },
  { label: 'Homes', icon: IconHome2, path: '/homes' },
] as const;

export function Navbar() {
  const { profile } = useProfile();
  const [drawerOpened, { toggle, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleNavigate = (path: string) => {
    navigate(path);
    close();
  };

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <>
      <header className={styles['app-header']}>
        <div className={styles['app-header-inner']}>
          {/* Left: burger (mobile) + brand */}
          <div className={styles['app-header-left']}>
            {isMobile && (
              <Burger
                opened={drawerOpened}
                onClick={toggle}
                size="sm"
                color="orange"
                aria-label="Open navigation"
              />
            )}
            <div
              className={styles['app-header-brand']}
              onClick={() => handleNavigate('/')}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate('/')}
              aria-label="Home Anthill – go to devices"
            >
              <img
                src={appIcon}
                alt=""
                className={styles['app-header-brand-icon']}
              />
              <span className={styles['app-header-brand-name']}>
                Home Anthill
              </span>
            </div>
          </div>

          {/* Center: nav links (desktop only) */}
          {!isMobile && (
            <nav
              className={styles['app-header-nav']}
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
                <div
                  key={path}
                  className={`${styles['app-header-nav-link']}${isActive(path) ? ` ${styles.active}` : ''}`}
                  onClick={() => handleNavigate(path)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleNavigate(path)}
                  aria-current={isActive(path) ? 'page' : undefined}
                >
                  <Icon size={18} stroke={1.5} />
                  <Text size="sm" fw={500}>
                    {label}
                  </Text>
                </div>
              ))}
            </nav>
          )}

          {/* Right: profile avatar */}
          <Avatar
            className={styles['app-header-profile'] ?? ''}
            size="sm"
            radius="xl"
            color="orange"
            onClick={() => handleNavigate('/profile')}
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === 'Enter' && handleNavigate('/profile')
            }
            aria-label={`Profile – ${profile?.github?.name}`}
            title={`${profile?.github?.name}\n${profile?.github?.email}`}
            alt="profile"
            src={profile?.github?.avatarURL ?? ''}
          ></Avatar>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={close}
        title={
          <div className={styles['app-drawer-title']}>
            <img src={appIcon} alt="" className={styles['app-drawer-icon']} />
            <Text fw={700} c="orange">
              Home Anthill
            </Text>
          </div>
        }
        size="xs"
        padding="md"
        classNames={{ content: styles['app-drawer'] ?? '' }}
      >
        <nav
          className={styles['app-drawer-menu']}
          aria-label="Mobile navigation"
        >
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              label={label}
              leftSection={<Icon size={20} stroke={1.5} />}
              active={isActive(path)}
              onClick={() => handleNavigate(path)}
              className={styles['app-drawer-item'] ?? ''}
              aria-current={isActive(path) ? 'page' : undefined}
            />
          ))}
        </nav>

        {/* Profile summary at bottom of drawer */}
        <div
          className={styles['app-drawer-profile']}
          onClick={() => handleNavigate('/profile')}
          role="link"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === 'Enter' && handleNavigate('/profile')
          }
          aria-label="Go to profile"
        >
          <Avatar
            size="md"
            radius="xl"
            color="orange"
            alt="profile icon"
            src={profile?.github?.avatarURL ?? ''}
          ></Avatar>
          <div className={styles['app-drawer-profile-info']}>
            <Text size="sm" fw={600} c="white">
              {profile?.github?.name}
            </Text>
            <Text size="xs" c="dimmed">
              {profile?.github?.email}
            </Text>
          </div>
        </div>
      </Drawer>
    </>
  );
}
