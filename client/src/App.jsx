import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Setup from './pages/Setup';
import Debate from './pages/Debate';
import History from './pages/History';
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalLoader from './components/layout/GlobalLoader';
import NotFound from './pages/NotFound';
import VerifyEmail from './pages/VerifyEmail';


import { useAuth } from './context/AuthContext'; 

function AppContent() {
  const { loading } = useAuth(); 

  return (
    <GlobalLoader isLoading={loading}>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/setup' element={
          <ProtectedRoute><Setup/></ProtectedRoute>
        }/>
        <Route path='/debate/new' element={
          <ProtectedRoute><Debate/></ProtectedRoute>
        }/>
        <Route path='/debate/:id' element={
          <ProtectedRoute><Debate/></ProtectedRoute>
        }/>
        <Route path='/history' element={
          <ProtectedRoute><History/></ProtectedRoute>
        }/>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </GlobalLoader>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;