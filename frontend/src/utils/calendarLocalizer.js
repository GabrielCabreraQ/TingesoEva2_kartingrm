// src/utils/calendarLocalizer.js
import { dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es'; // Importar localización en español

// Configura react-big-calendar para usar date-fns con español
const locales = {
  'es': es,
};

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Lunes como inicio de semana
  getDay,
  locales,
});

// Mensajes en Español para react-big-calendar
export const messages = {
  allDay: 'Todo el día',
  previous: '<',
  next: '>',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Reserva',
  noEventsInRange: 'No hay reservas en este rango.',
  showMore: total => `+ Ver más (${total})`
};

// Función auxiliar para formatear fechas para la API (ajusta el formato si es necesario)
export const formatDateForAPI = (date) => {
    if (!date) return '';
    try {
        return format(date, 'yyyy-MM-dd');
    } catch (error) {
        console.error("Error formatting date for API:", date, error);
        return ''; // Devuelve vacío o maneja el error como prefieras
    }
};