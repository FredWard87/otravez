// App.js
import React, { createContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Usuarios from "./Components/RegistroUsuarios/Usuarios";
import Login from "./Components/login/LoginForm"; // Importa el componente de inicio de sesión
import Inicio from './Components/Home/inicio';
import UsuariosRegis from './Components/UsuariosRegistrados/usuariosRegistro'; // Importa el componente UsuariosRegistrados
import Datos from './Components/DatosGenerales/Datos'
import Programas from './Components/ProgramasIn/Programa';
import AuthProvider from './authProvider';
import Revicion from './Components/Reviciones/Revicion';
import Terminada from './Components/Terminadas/Terminada';
import Ishikawa from './Components/Ishikawa/Ishikawa';
import IshikawaRev from './Components/IshikawaRev/IshikawaRev';
import Finalizada from './Components/Finalizada/Finalizada';
import Calendarioss from './Components/Calendarios/AuditCalendar'
import Calendarios from './Components/Calendarios/CalendarioGeneral'
import Departaments from './Components/Departaments/Departaments';
import Diagrama from './Components/DiagramaRe/Diagrama';
import CargaMasiva from './Components/DatosGenerales/CargaMasiva';
import Estadisticas from './Components/Estadisticas/Estadisticas';

export const UserContext = createContext(null);

function App() {
  return (
    <AuthProvider>
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/datos" element={<Datos/>}/>
          <Route path="/programa" element={<Programas/>}/>
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/home" element={<Inicio/>}/>
          <Route path="/usuariosRegistrados" element={<UsuariosRegis />} /> 
          <Route path="/revicion" element={<Revicion />} />
          <Route path="/terminada" element={<Terminada />} />
          <Route path="/ishikawa" element={<Ishikawa/>} />
          <Route path="/ishikawa/:_id/:id/:nombre" element={<IshikawaRev/>}/>
          <Route path="/finalizadas" element={<Finalizada/>}/>
          <Route path="/auditcalendar" element={<Calendarioss />} />
          <Route path="/calendario" element={<Calendarios />} />
          <Route path="/departamento" element={<Departaments />} />
          <Route path="/diagrama" element={<Diagrama />} />
          <Route path="/carga" element={<CargaMasiva />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
        </Routes>
      </Router>
    </div>
    </AuthProvider>
  );
}

export default App;
