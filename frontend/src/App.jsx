// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles'; // Importa ThemeProvider y createTheme
import CssBaseline from '@mui/material/CssBaseline';              // Para normalizar estilos base
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // Provider para DatePickers
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';       // Adaptador para date-fns
import esLocale from 'date-fns/locale/es';                           // Locale español para date-fns
const theme = createTheme(); // O usa el tema por defecto de MUI

// --- Importa tus componentes de página/vista ---
import Home from './components/Home';
import Navbar from './components/Navbar';
import NotFound from './components/NotFound';
import BookingCalendar from './components/BookingCalendar'; // ¡Importa el nuevo componente!
import BookingListPage from './components/BookingListPage';
import ClientListPage from './components/ClientListPage'; // Asegúrate de importar el componente de lista de clientes
import Pricing from './components/Pricing'; // Asegúrate de importar el componente de precios
import SpecialDays from './components/SpecialDays'; // Asegúrate de importar el componente de días especiales
import Report from './components/Report'; // Asegúrate de importar el componente de reportes
// --- Fin Importaciones Componentes ---

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>

          <div className="container"> {/* Considera usar <Container> de MUI si quieres */}
            <Navbar /> {/* Tu barra de navegación */}
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/booking" element={<BookingCalendar/>} />
              <Route path="/bookinglist" element={<BookingListPage />} /> {/* <-- Añade esta ruta */}
              <Route path="/clientlist" element={<ClientListPage />} /> {/* <-- Añade esta ruta */}
              <Route path="/pricing" element={<Pricing />} /> {/* <-- Añade esta ruta */}
              <Route path="/specialdays" element={<SpecialDays />} /> {/* <-- Añade esta ruta */}
              <Route path="/report" element={<Report />} /> {/* <-- Añade esta ruta */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </LocalizationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;