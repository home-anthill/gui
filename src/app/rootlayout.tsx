import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

import { Navbar } from '../shared/navbar/navbar';

import styles from './rootlayout.module.scss';

export default function RootLayout() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <div className={styles['root-layout']}>
        <Navbar />

        <main className={styles['root-layout-main']}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
