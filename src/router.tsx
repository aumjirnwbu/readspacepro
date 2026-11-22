import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './components/RootLayout';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { CollectionPage } from './pages/CollectionPage';
import { PointsPage } from './pages/PointsPage';
import { AboutPage } from './pages/AboutPage';
import { AuthPage } from './pages/AuthPage';
import { ManageComicsPage } from './pages/ManageComicsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'comic/:id', element: <DetailPage /> },
      { path: 'collection', element: <CollectionPage /> },
      { path: 'points', element: <PointsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'login', element: <AuthPage /> },
      { path: 'admin/comics', element: <ManageComicsPage /> },
    ],
  },
]);