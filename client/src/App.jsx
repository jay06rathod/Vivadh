import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login'
import Register from './pages/Register'
import Setup from './pages/Setup'
import Debate from './pages/Debate'
import History from './pages/History'
import Landing from "./pages/Landing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/setup' element={<Setup/>}/>
        <Route path='/debate/:id' element={<Debate/>}/>
        <Route path='/history' element={<History/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

// // src/App.jsx
// import Landing from '../src/pages/Landing';
// import '../src/index.css'; // Assuming Tailwind styles are imported here

// function App() {
//   return (
//     <div className="App">
//       <Landing />
//     </div>
//   );
// }

// export default App;