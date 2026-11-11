import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { AuthGate } from './lib/auth';
import { AiReview } from './pages/AiReview';
import { ContentLibrary } from './pages/ContentLibrary';
import { VerseReview } from './pages/VerseReview';

export function App() {
  return (
    <AuthGate>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Navigate to="/content" replace />} />
            <Route path="/content" element={<ContentLibrary />} />
            <Route path="/verses/:id" element={<VerseReview />} />
            <Route path="/ai" element={<AiReview />} />
            <Route path="*" element={<Navigate to="/content" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthGate>
  );
}
