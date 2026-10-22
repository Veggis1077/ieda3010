import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useProgress } from './store/progress';
import { getUser } from './store/user';
import UserPicker from './pages/UserPicker';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ChapterPage = lazy(() => import('./pages/ChapterPage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const LabPage = lazy(() => import('./pages/LabPage'));
const ExercisesPage = lazy(() => import('./pages/ExercisesPage'));
const ExamHub = lazy(() => import('./pages/ExamHub'));
const ExamSession = lazy(() => import('./pages/ExamSession'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const AidSheet = lazy(() => import('./pages/AidSheet'));
const Inventory = lazy(() => import('./pages/Inventory'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const LabsIndex = lazy(() => import('./pages/LabsIndex'));

function Loading() {
  return <div className="p-8 text-sm text-mute">Laster …</div>;
}

function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Fant ikke siden</h1>
      <p className="mt-2 text-mute">Lenken finnes ikke. Bruk menyen til venstre.</p>
    </div>
  );
}

export default function App() {
  const loc = useLocation();
  const setLastPath = useProgress((s) => s.setLastPath);
  useEffect(() => {
    if (loc.pathname.startsWith('/leksjon') || loc.pathname.startsWith('/lab')) setLastPath(loc.pathname);
    window.scrollTo({ top: 0 });
  }, [loc.pathname, setLastPath]);
  if (!getUser()) return <UserPicker />;
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kapittel/:chapterId" element={<ChapterPage />} />
          <Route path="/leksjon/:lessonId" element={<LessonPage />} />
          <Route path="/lab" element={<LabsIndex />} />
          <Route path="/lab/:labId" element={<LabPage />} />
          <Route path="/oppgaver" element={<ExercisesPage />} />
          <Route path="/eksamen" element={<ExamHub />} />
          <Route path="/eksamen/:sessionId" element={<ExamSession />} />
          <Route path="/repetisjon" element={<ReviewPage />} />
          <Route path="/formelark" element={<AidSheet />} />
          <Route path="/kildeoversikt" element={<Inventory />} />
          <Route path="/fremgang" element={<ProgressPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
