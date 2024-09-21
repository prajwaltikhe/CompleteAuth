import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import FloatingShapes from './components/FloatingShapes';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden">
      <FloatingShapes />
      <AppRoutes />
      <Toaster />
    </div>
  );
};

export default App;
