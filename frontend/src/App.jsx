import react from "react"
import {BrowserRouter,Routes,Route,Navigate} from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import Trash from "./pages/Trash"
import NotFound from "./pages/NotFound"
import Register from "./pages/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"


function Logout(){
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout(){
  localStorage.clear()
  return <Register />
}


function App() {
 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"  element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/trash"  element={<ProtectedRoute><Trash /></ProtectedRoute>} />
        <Route path="/login"  element={<Login />}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/register"  element={<RegisterAndLogout />}/>

        <Route path="*"  element={<NotFound />}/>
        <Route path="/logout"  element={<Logout />}/>

      </Routes>
    
    </BrowserRouter>
  )
}

export default App;
