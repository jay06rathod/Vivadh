import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Setup from './pages/Setup';
import Debate from './pages/Debate';
import History from './pages/History';
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/setup' element={
          <ProtectedRoute><Setup/></ProtectedRoute>
        }/>
        <Route path='/debate' element={
          <ProtectedRoute><Debate/></ProtectedRoute>
        }/>
        <Route path='/debate/:id' element={
          <ProtectedRoute><Debate/></ProtectedRoute>
        }/>
        <Route path='/history' element={
          <ProtectedRoute><History/></ProtectedRoute>
        }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;