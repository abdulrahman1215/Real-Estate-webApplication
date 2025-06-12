import {BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SingIn from './pages/SingIn';
import SingUp from './pages/SingUp';
import About from './pages/About';
import Profile from './pages/profile';

export default function App() {
  return ( <BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />}/>
    <Route path="/sing-in" element={<SingIn/>}/>
    <Route path="/sing-up " element={<SingUp />}/>
    <Route path="/about" element={<About />}/>
    <Route path="/profile" element={<Profile />}/>
  </Routes>
  </BrowserRouter>
  );

}
