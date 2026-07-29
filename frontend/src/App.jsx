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
import { AuthProvider } from "./context/AuthContext";

export default function App(){

return(

<AuthProvider><BrowserRouter>

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

<Route path="/about" element={<About/>} />

<Route path="/ai" element={<AiAssistant/>} />

</Routes>

</BrowserRouter></AuthProvider>

)

}
