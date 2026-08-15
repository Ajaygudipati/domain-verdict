import {
BrowserRouter,
Routes,
Route
} from "react-router-dom";

import Home from "./pages/Home";
import Analysis from "./pages/Analysis";
import History from "./pages/History";
import Login from "./pages/Login";
import About from "./pages/About";
import AiAssistant from "./pages/AiAssistant";
import Workspace from "./pages/Workspace";
import Extension from "./pages/Extension";
import SharedReport from "./pages/SharedReport";
import EmailLab from "./pages/EmailLab";
import ForgotPassword from "./pages/ForgotPassword";
import Users from "./pages/Users";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function App(){

return(

<ThemeProvider><AuthProvider><BrowserRouter>

<Routes>

<Route
path="/"
element={<Home/>}
/>

<Route
path="/analysis"
element={<Analysis/>}
/>

<Route
path="/history"
element={<History/>}
/>

<Route path="/login" element={<Login/>} />

<Route path="/forgot-password" element={<ForgotPassword/>} />

<Route path="/reset-password" element={<ForgotPassword/>} />

<Route path="/users" element={<Users/>} />

<Route path="/about" element={<About/>} />

<Route path="/ai" element={<AiAssistant/>} />

<Route path="/workspace" element={<Workspace/>} />

<Route path="/email-lab" element={<EmailLab/>} />

<Route path="/extension" element={<Extension/>} />

<Route path="/shared/:token" element={<SharedReport/>} />

</Routes>

</BrowserRouter></AuthProvider></ThemeProvider>

)

}
