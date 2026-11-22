import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const RootLayout = () => (
  <div className="min-h-screen flex flex-col bg-base-200/50">
    <Navbar />
    <main className="grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);
