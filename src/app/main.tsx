import { Outlet } from 'react-router-dom';

import Navbar from '../shared/navbar/navbar';

export default function Main() {
  return (
    <div>
      <Navbar/>
      <main>
        <Outlet/>
      </main>
    </div>
  )
}
