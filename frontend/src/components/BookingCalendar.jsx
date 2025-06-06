// src/components/BookingCalendarMUI.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// Asegúrate que format, addDays, startOfWeek, endOfDay, addMinutes, parse estén importados
import { format, addDays, startOfWeek, endOfDay, addMinutes, parse } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para la navegación


// Importaciones de MUI
import {
    Chip, Tooltip, Box, Container, Paper, Typography, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert,
    FormControl, InputLabel, Select, MenuItem, Grid, IconButton, Divider
} from '@mui/material'; // Añadido Divider para separar secciones en el modal
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
// Asegúrate que DatePicker de '@mui/x-date-pickers/DatePicker' esté importado
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


// Importa tu servicio y la configuración del localizador
import bookingService from '../services/booking.service'; // Asegúrate que la ruta sea correcta
// Asegúrate que localizer, messages, formatDateForAPI estén importados
import { localizer, messages, formatDateForAPI } from '../utils/calendarLocalizer';
// Asegúrate que esLocale de 'date-fns/locale/es' esté importado
import esLocale from 'date-fns/locale/es';


// --- Componente Personalizado para el Evento ---
const EventComponent = ({ event }) => {
    const label = event.title || 'Reserva';
    const startTime = event.start ? format(event.start, 'p', { locale: esLocale }) : '';
    const endTime = event.end ? format(event.end, 'p', { locale: esLocale }) : '';
    const tooltipTitle = `${label} (${startTime} - ${endTime})`;


    return (
        <Tooltip title={tooltipTitle}>
            <Chip
                label={label}
                size="small"
                sx={{
                    backgroundColor: event.resource?.color || 'primary.light',
                    color: 'primary.contrastText',
                    height: 'auto',
                    '& .MuiChip-label': {
                        display: 'block',
                        whiteSpace: 'normal',
                        overflowWrap: 'break-word',
                    },
                    width: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                        opacity: 0.8
                    }
                }}
            />
        </Tooltip>
    );
};


// Helper para calcular el tiempo de fin basado en vueltas
const calculateEndTime = (startTime, numberLap) => {
    if (!startTime || !numberLap) return null;


    const laps = parseInt(numberLap, 10);
    let durationMinutes = 0;


    switch (laps) {
        case 10:
            durationMinutes = 30;
            break;
        case 15:
            durationMinutes = 35;
            break;
        case 20:
            durationMinutes = 40;
            break;
        default:
            durationMinutes = 0;
    }


    return addMinutes(new Date(startTime), durationMinutes);
};


function BookingCalendarMUI() {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    // --- Estado para el Modal ---
    const [showModal, setShowModal] = useState(false);
    // Guarda la información del slot seleccionado (para crear) o del evento completo (para ver detalles/eliminar)
    const [modalInfo, setModalInfo] = useState({
        // Campos para CREACIÓN (se llenan al seleccionar slot o clic en Nueva Reserva)
        start: null, // Fecha/Hora inicio para nuevo
        end: null, // Fecha/Hora fin para nuevo (calculado)
        clientRut: '',
        clientName: '',
        clientBirthDate: null,
        clientEmail: '',
        numberLap: '',
        groupSize: '',
        additionalParticipants: [],
        title: '', // Título para nuevo (opcional)

        // Campo para VER DETALLES/ELIMINAR (se llena al seleccionar un evento)
        selectedBooking: null, // Almacena el objeto booking completo si se seleccionó un evento
    });


    const [isViewingDetails, setIsViewingDetails] = useState(false); // Nuevo estado para saber si el modal muestra detalles
    const [modalError, setModalError] = useState(''); // Errores específicos del modal

    // const navigate = useNavigate(); // Puedes descomentar esto si vuelves a añadir el botón "Ver Todas las Reservas"


    // --- Efecto para calcular el tiempo de fin cuando cambie inicio o vueltas (solo para modo CREAR) ---
    // Se ejecuta solo cuando el modal está en modo creación (!isViewingDetails)
    useEffect(() => {
        if (!isViewingDetails && modalInfo.start && modalInfo.numberLap) {
            const calculatedEnd = calculateEndTime(modalInfo.start, modalInfo.numberLap);
            // Solo actualizar si el nuevo fin calculado es diferente para evitar loops
            if (calculatedEnd && calculatedEnd.getTime() !== modalInfo.end?.getTime()) {
                setModalInfo(prev => ({ ...prev, end: calculatedEnd }));
            }
        } else if (!isViewingDetails && modalInfo.end !== null) {
            // Si está en modo crear pero falta inicio o vueltas, asegurar que el fin esté nulo
            setModalInfo(prev => ({ ...prev, end: null }));
        }
    }, [modalInfo.start, modalInfo.numberLap, modalInfo.end, isViewingDetails]);


    // --- Efecto para inicializar participantes adicionales al cambiar groupSize (solo para modo CREAR) ---
    // Se ejecuta solo cuando el modal está en modo creación (!isViewingDetails)
    useEffect(() => {
        if (!isViewingDetails) {
            const currentParticipantsCount = modalInfo.additionalParticipants.length;
            const groupSizeInt = parseInt(modalInfo.groupSize, 10);
            // Calcular el número de participantes adicionales requeridos (Tamaño del Grupo - 1 cliente principal)
            const requiredParticipantsCount = isNaN(groupSizeInt) || groupSizeInt < 1 ? 0 : groupSizeInt - 1;

            // Si el número actual de participantes adicionales no coincide con el requerido
            if (currentParticipantsCount !== requiredParticipantsCount) {
                setModalInfo(prev => {
                    const newParticipants = Array.from({ length: requiredParticipantsCount }, (_, index) => {
                        // Reutilizar data existente si hay (por índice), si no, crear nueva estructura con ID temporal
                        return prev.additionalParticipants[index] || { id: uuidv4(), rut: '', name: '', birthDate: null, email: '' };
                    });
                    // Si el nuevo tamaño es menor, se truncará automáticamente.
                    return { ...prev, additionalParticipants: newParticipants };
                });
            }
        }
    }, [modalInfo.groupSize, modalInfo.additionalParticipants.length, isViewingDetails]);


    // --- Carga de Datos REAL (se mantiene) ---
    const fetchBookingsForWeek = useCallback(async (date) => {
        console.log("fetchBookingsForWeek fue llamada, ejecutando lógica de carga real.");

        setLoading(true);
        setError(null);
        try {
            const weekStartsOn = 1; // Lunes
            const firstDayOfWeek = startOfWeek(date, { weekStartsOn });
            const lastDayOfWeek = endOfDay(addDays(firstDayOfWeek, 6));


            // Formatear fechas para la API (debe coincidir con lo que tu backend espera en la URL)
            const startDateStr = formatDateForAPI(firstDayOfWeek); // Usará 'yyyy-MM-dd'
            const endDateStr = formatDateForAPI(lastDayOfWeek); // Usará 'yyyy-MM-dd'


            if (!startDateStr || !endDateStr) {
                throw new Error("Fechas inválidas para la API.");
            }


            // Llamada al servicio frontend para obtener reservas
            const response = await bookingService.getbookingbetween(startDateStr, endDateStr);


            console.log("Respuesta COMPLETA del backend (bookings):", response);
            console.log("Datos de reservas del backend (response.data):", response.data);


            const formattedEvents = response.data.map(booking => {
                // --- PARSEO DE FECHA/HORA DE INICIO ---
                // Combinar bookingDate y startTime con un espacio para el parseo
                const startString = (booking.bookingDate && booking.startTime) ? `${booking.bookingDate} ${booking.startTime}` : null;

                // Usar date-fns/parse para el inicio
                const start = startString ? parse(startString, 'yyyy-MM-dd HH:mm:ss', new Date(), { locale: esLocale }) : null;

                // --- CALCULAR HORA DE FIN USANDO calculateEndTime ---
                // No intentamos parsear endTime del backend (ya que es null), lo calculamos.
                // Asegúrate que 'start' sea un objeto Date válido y que 'booking.numberLap' exista.
                const calculatedEnd = (start && !isNaN(start.getTime()) && booking.numberLap)
                                        ? calculateEndTime(start, booking.numberLap)
                                        : null;

                // --- LOGS DETALLADOS ---
                console.log(`Booking ID ${booking.id}: startString (para parsear):`, startString);
                console.log(`Booking ID ${booking.id}: start (parseado):`, start);
                console.log(`Booking ID ${booking.id}: calculatedEnd (calculado):`, calculatedEnd);
                // ---------------------------------


                // Filtrar eventos si la fecha/hora de inicio NO es válida o el cálculo del fin falla
                if (!start || isNaN(start.getTime()) || !calculatedEnd || isNaN(calculatedEnd.getTime())) {
                    console.warn("Booking con fecha/hora de inicio/fin inválida (o cálculo fallido) omitido:", booking);
                    return null; // Retornar null para filtrar este evento
                }


                return {
                    id: booking.id, // ID de la reserva
                    title: `${booking.client?.name || 'Cliente Desconocido'} - ${booking.numberLap || '?'} vueltas (${booking.groupSize || '?'} personas)`.trim(), // Título del evento
                    start: start, // Objeto Date para el inicio (parseado)
                    end: calculatedEnd,   // Objeto Date para el fin (CALCULADO)
                    resource: booking, // Guarda el objeto original completo por si lo necesitas
                };
            }).filter(event => event !== null); // Usar filter para remover los nulls


            console.log("Eventos formateados y filtrados para el calendario:", formattedEvents);

            setEvents(formattedEvents);
            console.log("Estado 'events' actualizado:", formattedEvents);


        } catch (err) { // Catch asociado al try principal
            console.error("Error fetching bookings:", err);
            setError("No se pudieron cargar las reservas. Intenta de nuevo.");
            setEvents([]); // Limpia eventos si falla la carga
        } finally {
            setLoading(false); // Siempre desactiva loading
        }
    }, []);


    // --- Efecto para cargar datos al montar el componente y al navegar (se mantiene) ---
    useEffect(() => {
        console.log("useEffect de carga de datos se ejecutó, llamando a fetchBookingsForWeek.");
        fetchBookingsForWeek(currentDate);
    }, [ currentDate, fetchBookingsForWeek ]);


    // --- Handlers del Calendario ---
    // handleNavigate se mantiene igual
     const handleNavigate = useCallback((newDate) => {
        setCurrentDate(newDate);
    }, []);

    // handleSelectSlot (abre modal para CREAR)
    const handleSelectSlot = useCallback(({ start, end }) => {
        // Resetear estado para una NUEVA reserva
        setModalInfo({
            start, // Usar la hora de inicio del slot seleccionado
            end: null, // El fin se calculará al seleccionar vueltas
            clientRut: '',
            clientName: '',
            clientBirthDate: null,
            clientEmail: '',
            numberLap: '',
            groupSize: '',
            additionalParticipants: [],
            title: '',
            selectedBooking: null, // Asegurarse de que no haya una reserva seleccionada en modo crear
        });
        setIsViewingDetails(false); // NO es vista de detalles
        setModalError('');
        setShowModal(true); // Abrir modal
    }, []);

    // handleSelectEvent (abre modal para VER DETALLES/ELIMINAR)
    const handleSelectEvent = useCallback((event) => {
        // Al hacer clic en un evento existente, mostramos los detalles
        setModalInfo({
            // No usamos los campos de creación/edición en este modo, pero los reiniciamos por si acaso
            start: null,
            end: null,
            clientRut: '',
            clientName: '',
            clientBirthDate: null,
            clientEmail: '',
            numberLap: '',
            groupSize: '',
            additionalParticipants: [],
            title: '',
            // Almacenamos el objeto de reserva completo para mostrar sus detalles
            selectedBooking: event.resource, // event.resource contiene el objeto booking original del backend
        });
        setIsViewingDetails(true); // ES vista de detalles
        setModalError('');
        setShowModal(true); // Abrir modal
    }, []);


    // --- Handler para abrir el Modal de Nueva Reserva desde el botón ---
    const handleOpenNewBookingModal = useCallback(() => {
         // Resetear estado para una NUEVA reserva, igual que handleSelectSlot pero sin fecha/hora preseleccionada
         setModalInfo({
            start: null,
            end: null,
            clientRut: '',
            clientName: '',
            clientBirthDate: null,
            clientEmail: '',
            numberLap: '',
            groupSize: '',
            additionalParticipants: [],
            title: '',
            selectedBooking: null,
        });
        setIsViewingDetails(false); // NO es vista de detalles
        setModalError('');
        setShowModal(true); // Abrir modal
    }, []);

    // --- Handler para navegar a la lista de reservas ---
    // Puedes descomentar esto si quieres reactivar el botón
    // const handleViewAllBookings = useCallback(() => {
    //     navigate('/bookingList'); // Navega a la ruta /bookingList
    // }, [navigate]);


    // --- Handlers del Modal (handleCloseModal, handleModalInputChange, handleParticipantInputChange, handleModalDateChange, handleParticipantDateChange) ---
    // handleCloseModal
      const handleCloseModal = () => {
        setShowModal(false);
        // Resetear estado completo al cerrar
        setModalInfo({
            start: null,
            end: null,
            clientRut: '',
            clientName: '',
            clientBirthDate: null,
            clientEmail: '',
            numberLap: '',
            groupSize: '',
            additionalParticipants: [],
            title: '',
            selectedBooking: null,
        });
        setIsViewingDetails(false);
        setModalError('');
    };

    // handleModalInputChange (solo para modo CREAR)
    const handleModalInputChange = (event) => {
        const { name, value } = event.target;
        setModalInfo(prev => ({ ...prev, [name]: value }));
    };

    // handleParticipantInputChange (solo para modo CREAR)
    const handleParticipantInputChange = (index, event) => {
        const { name, value } = event.target;
        setModalInfo(prev => {
            const newParticipants = [...prev.additionalParticipants];
            newParticipants[index] = { ...newParticipants[index], [name]: value };
            return { ...prev, additionalParticipants: newParticipants };
        });
    };

    // handleModalDateChange (solo para modo CREAR)
    const handleModalDateChange = (name, date) => {
         setModalInfo(prev => ({ ...prev, [name]: date }));
    };

    // handleParticipantDateChange (solo para modo CREAR)
    const handleParticipantDateChange = (index, name, date) => {
        setModalInfo(prev => {
            const newParticipants = [...prev.additionalParticipants];
            newParticipants[index] = { ...newParticipants[index], [name]: date };
            return { ...prev, additionalParticipants: newParticipants };
        });
    };


    // handleSaveBooking (solo para modo CREAR)
    const handleSaveBooking = async () => {
        setModalError(''); // Limpiar errores previos

        // --- Validaciones ---
        const groupSizeInt = parseInt(modalInfo.groupSize, 10);
        const numberLapInt = parseInt(modalInfo.numberLap, 10);

        if (!modalInfo.start || !modalInfo.end || !modalInfo.clientRut || !modalInfo.clientName || modalInfo.clientBirthDate === null || !modalInfo.clientEmail || !modalInfo.numberLap || isNaN(groupSizeInt) || groupSizeInt <= 0) {
            setModalError('Todos los campos obligatorios del Cliente Principal, Detalles de Reserva (Vueltas, Grupo) e Horarios son requeridos.');
            return;
        }
        if (modalInfo.end <= modalInfo.start) {
             setModalError('La fecha de fin debe ser posterior a la fecha de inicio.');
             return;
        }
        if (isNaN(numberLapInt) || (numberLapInt !== 10 && numberLapInt !== 15 && numberLapInt !== 20)) {
             setModalError('Número de Vueltas debe ser 10, 15 o 20.');
             return;
        }

        if (groupSizeInt !== (1 + modalInfo.additionalParticipants.length)) {
             setModalError(`El tamaño del grupo (${groupSizeInt}) debe coincidir con el número de participantes ingresados (${1 + modalInfo.additionalParticipants.length}).`);
             return;
        }

        for (const [index, participant] of modalInfo.additionalParticipants.entries()) {
            if (!participant.rut || !participant.name || participant.birthDate === null || !participant.email) {
                setModalError(`Faltan datos para el Participante ${index + 1}. Todos los campos son requeridos.`);
                return;
            }
             if (participant.birthDate && isNaN(new Date(participant.birthDate).getTime())) {
                 setModalError(`Fecha de Nacimiento inválida para el Participante ${index + 1}.`);
                 return;
            }
        }
         if (modalInfo.clientBirthDate && isNaN(new Date(modalInfo.clientBirthDate).getTime())) {
             setModalError(`Fecha de Nacimiento inválida para el Cliente Principal.`);
             return;
        }


        // *** Construir el objeto `bookingData` para la API ***
        // Al crear, no enviamos ID de reserva, ni IDs de cliente/participante
        const bookingData = {
            // No enviamos id de reserva al crear
            bookingDate: modalInfo.start ? format(modalInfo.start, 'yyyy-MM-dd') : null,
            startTime: modalInfo.start ? format(modalInfo.start, 'HH:mm:ss') : null,
            endTime: modalInfo.end ? format(modalInfo.end, 'HH:mm:ss') : null, // Enviamos el calculado
            numberLap: numberLapInt,
            groupSize: groupSizeInt,

            // Datos del cliente principal (sin ID al crear)
            client: {
                // No enviamos ID del cliente principal al crear
                rut: modalInfo.clientRut,
                name: modalInfo.clientName,
                birthDate: modalInfo.clientBirthDate ? format(modalInfo.clientBirthDate, 'yyyy-MM-dd') : null,
                email: modalInfo.clientEmail,
            },

            // --- Construir la lista completa de participantes (sin IDs al crear) ---
            participants: [
                // Cliente principal como primer participante (sin ID al crear)
                {
                    // No enviamos ID del cliente principal al crear
                    rut: modalInfo.clientRut,
                    name: modalInfo.clientName,
                    birthDate: modalInfo.clientBirthDate ? format(modalInfo.clientBirthDate, 'yyyy-MM-dd') : null,
                    email: modalInfo.clientEmail,
                },
                // Participantes adicionales (sin IDs al crear)
                ...modalInfo.additionalParticipants.map(p => ({
                    // No enviamos IDs de participantes adicionales al crear
                    rut: p.rut,
                    name: p.name,
                    birthDate: p.birthDate ? format(p.birthDate, 'yyyy-MM-dd') : null,
                    email: p.email,
                }))
            ],
        };


        console.log("Datos enviados a la API para CREAR:", bookingData);


        try {
            setLoading(true);
            // Llamamos a create
            await bookingService.create(bookingData);
            console.log("Reserva creada exitosamente.");

            handleCloseModal();
            fetchBookingsForWeek(currentDate); // Recargar eventos para ver la nueva reserva


        } catch (err) {
            console.error("Error creating booking:", err);
            const apiErrorMessage = err.response?.data?.message || err.message || 'Error desconocido al crear la reserva.';
            setModalError(`Reserva creada con error: email no encontrados`);
        } finally {
             setLoading(false);
        }
    };


    // handleDeleteBooking (ahora llamado desde el modal de detalles)
    // Es necesario incluir fetchBookingsForWeek y currentDate en sus dependencias si los usa
    const handleDeleteBooking = useCallback(async () => { // Ya no recibe el ID como arg, lo toma de modalInfo.selectedBooking
        // Tomar el ID de la reserva seleccionada del estado
        const bookingIdToDelete = modalInfo.selectedBooking?.id;

        if (!bookingIdToDelete || !window.confirm(`¿Estás seguro de eliminar la reserva de ${modalInfo.selectedBooking?.client?.name || 'este cliente'} con ID ${bookingIdToDelete}?`)) {
            return;
        }

        setModalError(''); // Limpiar errores previos del modal
        setError(null); // Limpiar errores globales

        try {
            setLoading(true);
            console.log(`Intentando eliminar reserva con ID: ${bookingIdToDelete}`);
            // Asegúrate que tu servicio `remove` espere el ID
            await bookingService.remove(bookingIdToDelete);

            console.log("Reserva eliminada exitosamente.");

            handleCloseModal(); // Cerrar modal después de eliminar
            fetchBookingsForWeek(currentDate); // Recargar eventos

        } catch (err) {
            console.error("Error deleting booking:", err);
            const apiErrorMessage = err.response?.data?.message || err.message || 'Error desconocido al eliminar la reserva.';
            // Mostrar el error en el modal
            setModalError(`Error al eliminar: ${apiErrorMessage}`);
        } finally {
             setLoading(false);
        }
     }, [fetchBookingsForWeek, currentDate, modalInfo.selectedBooking]); // Dependencias: Recarga, fecha actual, y la reserva seleccionada (para el ID y confirm)


    // --- Renderizado ---
    // Define min/max time para el calendario (ajusta según tu horario)
    const minTime = useMemo(() => new Date(0, 0, 0, 9, 0, 0), []); // 9:00 AM
    const maxTime = useMemo(() => new Date(0, 0, 0, 23, 0, 0), []); // 11:00 PM


    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Paper sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>

                {/* --- Header con Título y Botones --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 0 }}>
                        Calendario de Reservas
                    </Typography>
                    <Box>
                        <Button
                            variant="contained"
                            onClick={handleOpenNewBookingModal} // Abre el modal en modo crear
                            sx={{ mr: 1 }}
                        >
                            Nueva Reserva
                        </Button>
                        {/* Botón Ver Todas las Reservas (descomentar si App.jsx y el componente BookingListPage.jsx están listos) */}
                        {/* <Button
                            variant="outlined"
                            onClick={handleViewAllBookings} // Llama al handler de navegación
                        >
                            Ver Todas las Reservas
                        </Button> */}
                    </Box>
                </Box> {/* Cierre Header Box */}


                {/* Indicador de Carga y Errores Globales */}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}


                {/* Box que contiene el Calendario */}
                <Box sx={{ flexGrow: 1, minHeight: 400 }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        defaultView="week"
                        views={['week', 'day', 'agenda']}
                        date={currentDate}
                        onNavigate={handleNavigate}
                        onSelectSlot={handleSelectSlot} // Abre modal en modo crear
                        onSelectEvent={handleSelectEvent} // Abre modal en modo ver detalles
                        selectable
                        messages={messages}
                        culture='es'
                        step={30}
                        timeslots={2}
                        min={minTime}
                        max={maxTime}
                        components={{
                            event: EventComponent,
                        }}
                    />
                </Box> {/* Cierre Box Calendario */}




            {/* --- Modal de MUI para Crear o Ver/Eliminar --- */}
            <Dialog open={showModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle>
                    {isViewingDetails ? 'Detalles de la Reserva' : 'Crear Nueva Reserva'}
                </DialogTitle>
                <DialogContent dividers>
                    {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}

                    {/* --- Contenido Condicional del Modal --- */}
                    {isViewingDetails ? (
                        // --- Vista de Detalles de Reserva ---
                        <Box>
                             <Typography variant="h6" gutterBottom>Reserva # {modalInfo.selectedBooking?.id}</Typography>
                             {/* Mostrar detalles usando modalInfo.selectedBooking */}
                             <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Fecha:</strong> {modalInfo.selectedBooking?.bookingDate || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Hora Inicio:</strong> {modalInfo.selectedBooking?.startTime || 'N/A'}</Typography>
                                </Grid>
                                {/* Puedes calcular la hora de fin aquí también si quieres mostrarla */}
                                {modalInfo.selectedBooking?.bookingDate && modalInfo.selectedBooking?.startTime && modalInfo.selectedBooking?.numberLap && (
                                     <Grid item xs={12} sm={6}>
                                        {/* Usar un IIFE (Immediately Invoked Function Expression) para formatear la fecha si es una cadena */}
                                        {(() => {
                                            const startString = `${modalInfo.selectedBooking.bookingDate} ${modalInfo.selectedBooking.startTime}`;
                                            const start = parse(startString, 'yyyy-MM-dd HH:mm:ss', new Date(), { locale: esLocale });
                                            const calculatedEnd = calculateEndTime(start, modalInfo.selectedBooking.numberLap);
                                            return calculatedEnd && !isNaN(calculatedEnd.getTime()) ? (
                                                <Typography variant="body1"><strong>Hora Fin (Estimada):</strong> {format(calculatedEnd, 'p', { locale: esLocale })}</Typography>
                                            ) : null;
                                        })()}
                                     </Grid>
                                )}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Vueltas:</strong> {modalInfo.selectedBooking?.numberLap || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Tamaño Grupo:</strong> {modalInfo.selectedBooking?.groupSize || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Precio Final:</strong> ${modalInfo.selectedBooking?.finalPrice?.toFixed(2) || 'N/A'}</Typography> {/* Formatear precio */}
                                </Grid>
                             </Grid>

                             <Divider sx={{ my: 2 }} /> {/* Separador */}

                             <Typography variant="h6" gutterBottom>Cliente Principal</Typography>
                             <Grid container spacing={2}>
                                 <Grid item xs={12} sm={6}><Typography variant="body1"><strong>RUT:</strong> {modalInfo.selectedBooking?.client?.rut || 'N/A'}</Typography></Grid>
                                 <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Nombre:</strong> {modalInfo.selectedBooking?.client?.name || 'N/A'}</Typography></Grid>
                                 <Grid item xs={12} sm={6}>
                                     {/* Formatear fecha de nacimiento si existe */}
                                     <Typography variant="body1">
                                         <strong>Fecha Nacimiento:</strong>
                                         {modalInfo.selectedBooking?.client?.birthDate ?
                                            (() => { // Usar un IIFE para formatear la fecha si es una cadena
                                                try {
                                                    const date = new Date(modalInfo.selectedBooking.client.birthDate);
                                                     return !isNaN(date.getTime()) ? format(date, 'dd/MM/yyyy') : 'N/A';
                                                } catch (e) {
                                                     console.error("Error formatting client birth date:", modalInfo.selectedBooking.client.birthDate, e);
                                                     return 'N/A';
                                                }
                                            })()
                                          : 'N/A'}
                                     </Typography>
                                 </Grid>
                                  <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Email:</strong> {modalInfo.selectedBooking?.client?.email || 'N/A'}</Typography></Grid>
                             </Grid>

                            {/* Mostrar participantes adicionales si los hay */}
                             {modalInfo.selectedBooking?.participants && modalInfo.selectedBooking.participants.length > 1 && (
                                 <>
                                     <Divider sx={{ my: 2 }} /> {/* Separador */}
                                     <Typography variant="h6" gutterBottom>Participantes Adicionales</Typography>
                                     {modalInfo.selectedBooking.participants
                                        .filter(p => p.rut !== modalInfo.selectedBooking?.client?.rut) // Filtrar el cliente principal
                                        .map((participant, index) => (
                                         <Box key={participant.id || index} sx={{ mb: 2, p: 1, border: '1px dashed grey' }}>
                                              <Typography variant="subtitle1" gutterBottom>Participante {index + 1}</Typography>
                                              <Grid container spacing={2}>
                                                   <Grid item xs={12} sm={6}><Typography variant="body2"><strong>RUT:</strong> {participant.rut || 'N/A'}</Typography></Grid>
                                                   <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Nombre:</strong> {participant.name || 'N/A'}</Typography></Grid>
                                                   <Grid item xs={12} sm={6}>
                                                        {/* Formatear fecha de nacimiento participante */}
                                                        <Typography variant="body2">
                                                            <strong>Fecha Nacimiento:</strong>
                                                             {participant.birthDate ?
                                                                (() => {
                                                                    try {
                                                                        const date = new Date(participant.birthDate);
                                                                         return !isNaN(date.getTime()) ? format(date, 'dd/MM/yyyy') : 'N/A';
                                                                    } catch (e) {
                                                                         console.error("Error formatting participant birth date:", participant.birthDate, e);
                                                                         return 'N/A';
                                                                    }
                                                                })()
                                                              : 'N/A'}
                                                        </Typography>
                                                   </Grid>
                                                    <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Email:</strong> {participant.email || 'N/A'}</Typography></Grid>
                                               </Grid>
                                         </Box>
                                     ))}
                                 </>
                             )}

                        </Box>
                    ) : (
                        // --- Formulario de Creación de Reserva ---
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ mt: 0 }}>
                                Datos del Cliente Principal
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField margin="dense" name="clientRut" label="RUT Cliente Principal" type="text" fullWidth variant="outlined" value={modalInfo.clientRut} onChange={handleModalInputChange} required/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                     <TextField margin="dense" name="clientName" label="Nombre Cliente Principal" type="text" fullWidth variant="outlined" value={modalInfo.clientName} onChange={handleModalInputChange} required/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DatePicker label="Fecha Nacimiento Cliente Principal" value={modalInfo.clientBirthDate} onChange={(newValue) => handleModalDateChange('clientBirthDate', newValue)} renderInput={(params) => <TextField {...params} fullWidth required/>}/>
                                </Grid>
                                 <Grid item xs={12} sm={6}>
                                     <TextField margin="dense" name="clientEmail" label="Email Cliente Principal" type="email" fullWidth variant="outlined" value={modalInfo.clientEmail} onChange={handleModalInputChange} required/>
                                 </Grid>
                                  <Grid item xs={12}>
                                    <TextField margin="dense" name="title" label="Título Reserva (Opcional)" type="text" fullWidth variant="outlined" value={modalInfo.title} onChange={handleModalInputChange}/>
                                 </Grid>
                            </Grid>


                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Detalles de la Reserva</Typography>
                            <Grid container spacing={2}>
                                 <Grid item xs={12} sm={6}>
                                     <FormControl fullWidth margin="dense" required>
                                         <InputLabel id="numberLap-label">Número de Vueltas</InputLabel>
                                         <Select labelId="numberLap-label" id="numberLap-select" name="numberLap" value={modalInfo.numberLap} label="Número de Vueltas" onChange={handleModalInputChange}>
                                             <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                             <MenuItem value={10}>10 Vueltas (30 min)</MenuItem>
                                             <MenuItem value={15}>15 Vueltas (35 min)</MenuItem>
                                             <MenuItem value={20}>20 Vueltas (40 min)</MenuItem>
                                         </Select>
                                     </FormControl>
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                     <TextField margin="dense" name="groupSize" label="Tamaño del Grupo" type="number" fullWidth variant="outlined" value={modalInfo.groupSize} onChange={handleModalInputChange} required inputProps={{ min: 1 }}/></Grid>
                                 <Grid item xs={12} sm={6}>
                                    <DateTimePicker label="Inicio Reserva" value={modalInfo.start} onChange={(newValue) => handleModalDateChange('start', newValue)} renderInput={(params) => <TextField {...params} fullWidth required/>}/>
                                 </Grid>
                                  <Grid item xs={12} sm={6}>
                                     <DateTimePicker label="Fin Reserva (Calculado)" value={modalInfo.end} onChange={() => {}} renderInput={(params) => <TextField {...params} fullWidth required disabled={true} />} disabled={true}/>
                                 </Grid>
                            </Grid>

                            {/* Sección para Participantes Adicionales (solo para modo CREAR) */}
                            {modalInfo.groupSize > 0 && parseInt(modalInfo.groupSize, 10) > 1 && (
                                 <Box sx={{ mt: 3 }}>
                                     <Typography variant="h6" gutterBottom>
                                        Datos de Participantes Adicionales ({modalInfo.additionalParticipants.length})
                                    </Typography>
                                     {modalInfo.additionalParticipants.map((participant, index) => (
                                        <Paper key={participant.id} elevation={1} sx={{ p: 2, mb: 2, position: 'relative' }}>
                                             <Typography variant="subtitle1" gutterBottom>
                                                 Participante {index + 1}
                                             </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}><TextField margin="dense" name="rut" label={`RUT Participante ${index + 1}`} type="text" fullWidth variant="outlined" value={participant.rut} onChange={(e) => handleParticipantInputChange(index, e)} required/></Grid>
                                                <Grid item xs={12} sm={6}><TextField margin="dense" name="name" label={`Nombre Participante ${index + 1}`} type="text" fullWidth variant="outlined" value={participant.name} onChange={(e) => handleParticipantInputChange(index, e)} required/></Grid>
                                                 <Grid item xs={12} sm={6}>
                                                    <DatePicker label={`Fecha Nacimiento Participante ${index + 1}`} value={participant.birthDate} onChange={(newValue) => handleParticipantDateChange(index, 'birthDate', newValue)} renderInput={(params) => <TextField {...params} fullWidth required/>}/>
                                                </Grid>
                                                 <Grid item xs={12} sm={6}><TextField margin="dense" name="email" label={`Email Participante ${index + 1}`} type="email" fullWidth variant="outlined" value={participant.email} onChange={(e) => handleParticipantInputChange(index, e)} required/>
                                                 </Grid>
                                            </Grid>
                                             {/* Botones de añadir/eliminar participante (descomentar si es necesario) */}
                                            {/* <IconButton
                                                aria-label="eliminar participante"
                                                onClick={() => handleRemoveParticipant(index)}
                                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                            >
                                                <RemoveCircleOutlineIcon color="error"/>
                                            </IconButton> */}
                                        </Paper>
                                    ))}
                                     {/* Botón para añadir participante (descomentar si es necesario) */}
                                     {/* <Box sx={{ textAlign: 'center', mt: 2 }}>
                                         <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleAddParticipant}>
                                             Añadir Participante
                                         </Button>
                                     </Box> */}
                                </Box>
                            )}
                        </Box>
                    )}

                </DialogContent>
                <DialogActions sx={{ justifyContent: isViewingDetails ? 'space-between' : 'flex-end', px: 3, pb: 2 }}>
                    {/* Botón Eliminar (solo en modo VER DETALLES) */}
                    {isViewingDetails && (
                        <Button onClick={handleDeleteBooking} color="error" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Eliminar Reserva'}
                        </Button>
                    )}

                    <Box>
                        <Button onClick={handleCloseModal} sx={{ mr: 1 }} disabled={loading}>
                            Cerrar {/* Cambiado de Cancelar a Cerrar para el modo detalles */}
                        </Button>
                        {/* Botón Crear Reserva (solo en modo CREAR) */}
                        {!isViewingDetails && (
                            <Button onClick={handleSaveBooking} variant="contained" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Crear Reserva'}
                            </Button>
                        )}
                    </Box>
                </DialogActions> {/* Cierre del Dialog */}
            </Dialog>
            </Paper> 
        </Container> 
    );
}


export default BookingCalendarMUI;