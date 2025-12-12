import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import EventDetailPage from '../pages/EventDetailPage';
import ChatRoomPage from '../pages/ChatRoomPage';
import ProfilePage from '../pages/ProfilePage';
import AuthPage from '../pages/AuthPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/events/:id', element: <EventDetailPage /> },
  { path: '/chat/:id', element: <ChatRoomPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/auth', element: <AuthPage /> }
]);

export default router;
