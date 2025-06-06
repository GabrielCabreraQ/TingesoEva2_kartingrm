// src/components/BookingListPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Container, Typography, Box, Paper, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider, IconButton } from '@mui/material';
import bookingService from '../services/booking.service'; // Asegúrate que la ruta sea correcta
import { format, parse } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import DeleteIcon from '@mui/icons-material/Delete'; // Importa el icono de eliminar
import DownloadIcon from '@mui/icons-material/Download'; // Importa el icono de descarga


// Definición de las columnas para el Data Grid (ahora como mutable para poder añadir handlers)
const initialColumns = [ // Renombrado a initialColumns
    { field: 'id', headerName: 'ID Reserva', width: 100 },
    {field: 'bookingDate', headerName: 'Fecha', width: 150,
        valueFormatter: (value) => value ? format(parse(value, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : '', // Formatear fecha
    },
    { field: 'startTime', headerName: 'Hora Inicio', width: 100 },
    { field: 'groupSize', headerName: 'Grupo', type: 'number', width: 80 },
    { field: 'numberLap', headerName: 'Vueltas', type: 'number', width: 80 },
    {
        field: 'finalPrice',
        headerName: 'Precio Final',
        type: 'number',
        width: 120,
        valueFormatter: (value) => value != null ? `$${value.toFixed(2)}` : '', // Formatear como moneda
    },
    { field: 'client', headerName: 'Cliente Principal', width: 200,
        // renderCell para centrar y mostrar el nombre (la lógica de fallback está en useMemo)
        renderCell: (params) => {
            const client = params.row.client;
            const clientName = client?.name;
            let displayName = 'Desconocido';
            if (clientName) {
                displayName = clientName;
            } else {
                 // Lógica de fallback: buscar en participantes si el cliente principal es nulo o sin nombre
                const participants = params.row.participants;
                const mainClientRut = client?.rut; // Usar el RUT del cliente principal de la fila si está disponible

                if (participants && Array.isArray(participants) && participants.length > 0) {
                     // Buscar por RUT si el RUT principal está disponible
                    if (mainClientRut) {
                        const principalInParticipants = participants.find(p => p.rut === mainClientRut);
                        if (principalInParticipants?.name) {
                            displayName = principalInParticipants.name;
                        }
                    }
                    // Fallback: primer participante si no se encontró por RUT o el cliente principal era nulo
                    if (displayName === 'Desconocido' && participants[0]?.name) {
                        displayName = participants[0].name;
                    }
                 }
            }
            // Envolver el contenido en un Box con estilos Flexbox para centrado total
            return (
                <Box
                    sx={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center', // centra verticalmente
                        justifyContent: 'center', // centra horizontalmente
                        // Asegurar que el texto no se desborde y muestre puntos suspensivos
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                    title={displayName !== 'Desconocido' ? displayName : ''} // Tooltip para nombres largos
                >
                    <Typography variant="body2">{displayName}</Typography>
                </Box>
            );
        }
    },
    {
        field: 'participants', // Usamos este campo para acceder a la lista completa en renderCell
        headerName: 'Participantes',
        width: 150,
        sortable: false,
        filterable: false,
        align: 'center', // Centrar el contenido de la celda
        headerAlign: 'center', // Centrar el encabezado de la columna
        renderCell: (params) => {
            const participants = params.row.participants;
            const mainClientRut = params.row.client?.rut;
            const count = participants?.length || 0;

            return (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                        // Llama al handler pasado desde el componente principal a través de customHandler
                        if (params.colDef.customHandler) {
                            params.colDef.customHandler(params.row.participants, params.row.client?.rut);
                        }
                    }}
                >
                    Detalles ({count})
                </Button>
            );
        }
    },
    // --- Nueva columna para descargar Excel ---
    {
        field: 'downloadExcel', // Nombre de campo arbitrario para la columna
        headerName: 'Boleta', // Encabezado de la columna
        width: 100,
        sortable: false,
        filterable: false,
        align: 'center', // Centrar el contenido de la celda
        headerAlign: 'center', // Centrar el encabezado de la columna
        renderCell: (params) => {
            // Deshabilitar el botón si no hay contenido Excel (backend debería enviar null o indicar si existe)
            // Asumiendo que params.row.excelFileContent es null/undefined si no hay archivo
            const hasExcel = params.row.excelFileContent != null; // Verifica si el campo no es nulo
            // Si tu backend no envía el campo excelFileContent en el listado,
            // podrías necesitar otro indicador booleano o hacer una llamada
            // para verificar si el archivo existe antes de habilitar el botón.
            // Por ahora, asumimos que el backend envía null si no hay archivo.

            return (
                 <IconButton
                    color="primary" // Color del icono
                    aria-label="descargar boleta excel"
                    onClick={() => {
                        if (params.colDef.customHandler) {
                            params.colDef.customHandler(params.row.id); // Llama al handler con el ID de la reserva
                        }
                    }}
                    disabled={!hasExcel} // Deshabilita el botón si no hay archivo Excel asociado
                    title={!hasExcel ? "Boleta no disponible" : "Descargar Boleta"} // Tooltip condicional
                 >
                    <DownloadIcon /> {/* Icono de descarga */}
                 </IconButton>
            );
        }
    },
    // --- Columna de Acciones (Eliminar) ---
    {
        field: 'actions',
        headerName: 'Eliminar', // Cambiado el header para ser más específico
        width: 100,
        sortable: false,
        filterable: false,
        align: 'center', // Centrar el contenido de la celda
        headerAlign: 'center', // Centrar el encabezado de la columna
        renderCell: (params) => {
            return (
                 <IconButton
                    color="error"
                    aria-label="eliminar reserva"
                    onClick={() => {
                        if (params.colDef.customHandler) {
                            params.colDef.customHandler(params.row.id);
                        }
                    }}
                 >
                    <DeleteIcon />
                 </IconButton>
            );
        }
    },
];


function BookingListPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estado para el Modal de Participantes ---
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [mainClientRut, setMainClientRut] = useState(null); // Para identificar al cliente principal en la lista de participantes

    // --- Estado para manejar la carga y error de la eliminación ---
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // --- Estado para manejar la carga y error de la descarga de Excel ---
    const [excelLoading, setExcelLoading] = useState(false);
    const [excelError, setExcelError] = useState(null);


    // --- Función para cargar los datos de las reservas ---
    const fetchAllBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Asumo que bookingService.getAll() llama al endpoint GET /api/bookings/
            // Y que este endpoint (si es que se implementó) también necesita @Transactional en el backend
            // O que el backend excluye el campo excelFileContent en la respuesta de listado.
            const response = await bookingService.getAll();
            console.log("Datos de todas las reservas recibidos:", response.data);

            const formattedBookings = response.data.map(booking => ({
                // Asegúrate de mapear todos los campos necesarios para la tabla
                ...booking,
                id: booking.id, // Asegúrate que el ID se mapee correctamente
                // El campo excelFileContent NO debe ser necesario en el frontend para este listado,
                // a menos que lo uses para habilitar/deshabilitar el botón de descarga (como hicimos).
                // Si el backend lo envía, asegúrate de que se deserialice correctamente (lo cual debería ser automático si no hay errores).
            }));

            console.log("Datos de reservas formateados para DataGrid:", formattedBookings);

            setBookings(formattedBookings);
        } catch (err) {
            console.error("Error fetching all bookings:", err);
            setError("No se pudieron cargar todas las reservas.");
        } finally {
            setLoading(false);
        }
    }, []); // Dependencias vacías

    // --- useEffect para cargar datos al montar el componente ---
    useEffect(() => {
        fetchAllBookings();
    }, [fetchAllBookings]);


    // --- Handler para abrir el modal de participantes ---
    // Usamos useCallback para que esta función no cambie innecesariamente
    const handleViewParticipants = useCallback((participants, mainClientRut) => {
        setSelectedParticipants(participants || []); // Asegurarse de que sea un array
        setMainClientRut(mainClientRut); // Guardar el RUT del cliente principal
        setShowParticipantsModal(true);
    }, []); // Dependencias vacías

    // --- Handler para cerrar el modal de participantes ---
    const handleCloseParticipantsModal = useCallback(() => {
        setShowParticipantsModal(false);
        setSelectedParticipants([]);
        setMainClientRut(null);
    }, []); // Dependencias vacías


    // --- Handler para eliminar una reserva individual ---
    const handleDeleteBooking = useCallback(async (bookingId) => {
        // Mostrar ventana de confirmación
        if (window.confirm(`¿Estás seguro de eliminar la reserva con ID ${bookingId}?`)) {
            setDeleteLoading(true); // Mostrar indicador de carga
            setDeleteError(null); // Limpiar errores previos

            try {
                // Asumo que bookingService.remove(bookingId) llama al endpoint DELETE /api/bookings/{id}
                await bookingService.remove(bookingId);
                console.log(`Reserva con ID ${bookingId} eliminada.`);
                // Recargar la lista de reservas después de eliminar
                fetchAllBookings();

            } catch (err) {
                console.error(`Error eliminando reserva con ID ${bookingId}:`, err);
                const apiErrorMessage = err.response?.data?.message || err.message || 'Error desconocido.';
                setDeleteError(`No se pudo eliminar la reserva con ID ${bookingId}: ${apiErrorMessage}`);
            } finally {
                setDeleteLoading(false);
            }
        }
    }, [fetchAllBookings]); // Depende de fetchAllBookings para recargar la lista


// --- Nuevo Handler para descargar el archivo Excel usando el servicio frontend ---
    const handleDownloadExcel = useCallback(async (bookingId) => {
            setExcelLoading(true);
            setExcelError(null);
    
            try {
                console.log(`Intentando descargar Excel para reserva con ID: ${bookingId} usando bookingService.getExcel`);
    
                const response = await bookingService.getExcel(bookingId);
    
                // Los logs confirman que response.data es un Blob válido aquí
                const blob = response.data;
    
                // La comprobación siguiente ya debería pasar según tus logs
                if (!(blob instanceof Blob)) {
                     console.error("La respuesta no es un Blob:", blob);
                     throw new Error("La respuesta del servidor no es un archivo válido.");
                 }
    
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                 a.style.display = 'none'; // Ocultar el enlace
    
                // --- Extraer el nombre del archivo de la cabecera Content-Disposition ---
                // Asumimos que 'response' es el objeto respuesta completo de tu httpClient (ej. Axios)
                const contentDisposition = response.headers['content-disposition']; // Las cabeceras suelen estar en minúsculas
                let filename = `boleta_reserva_${bookingId}.xlsx`; // Nombre por defecto
    
                if (contentDisposition) {
                    // Regex más robusta para capturar el nombre del archivo con o sin comillas
                    const filenameMatch = contentDisposition.match(/filename[^;=\s]*=((['"])(.*?)\2|([^;\s]+))/);
                    if (filenameMatch && filenameMatch[3]) { // Captura el contenido dentro de comillas
                        filename = filenameMatch[3];
                    } else if (filenameMatch && filenameMatch[4]) { // Captura contenido sin comillas
                        filename = filenameMatch[4];
                    }
                }
                // Opcional: Limpiar caracteres no válidos del nombre del archivo para evitar problemas
                filename = filename.replace(/[^a-zA-Z0-9_.\-\s]/g, '_'); // Permite letras, números, _, ., -, espacio. Reemplaza otros por _
    
    
                a.download = filename; // Establece el nombre del archivo para la descarga
    
                // console.log("Creando enlace temporal para descarga:", { url, filename, downloadAttribute: a.download }); // Debugging log
    
                // Añadir el enlace al DOM, hacer clic y luego limpiarlo
                document.body.appendChild(a);
                a.click(); // Haz el click programático
    
                // --- Limpieza después de un pequeño retraso para asegurar que el click se procese ---
                // A veces, revocar el URL inmediatamente puede cancelar la descarga en algunos navegadores
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    a.remove();
                    // console.log("Limpieza de URL temporal y elemento 'a' completada."); // Debugging log
                }, 100); // Añade un pequeño retraso (ej. 100ms)
    
                console.log(`Descarga iniciada para reserva con ID: ${bookingId}`); // Este log debería aparecer
    
            } catch (err) {
                console.error(`Error al descargar Excel para ID ${bookingId}:`, err);
                // Mostrar un mensaje de error más amigable
                 let userFriendlyMessage = `No se pudo descargar la boleta para la reserva ${bookingId}.`;
                 // Intenta acceder a la respuesta de error si está disponible y tiene una estructura JSON o texto
                 const errorResponse = err.response;
                 if (errorResponse) {
                     console.error("Detalles del error de respuesta:", errorResponse);
                     if (errorResponse.status === 404) {
                         userFriendlyMessage = `La boleta para la reserva ${bookingId} no fue encontrada.`;
                     } else if (errorResponse.data) {
   
                         try {
                             const errorData = await errorResponse.data.text(); // Axios blob error data needs .text() or .json()
                             userFriendlyMessage += ` Detalles: ${errorData}`;
                         } catch (parseError) {
                             userFriendlyMessage += ` Error de red: ${errorResponse.status} ${errorResponse.statusText}`;
                         }
                     } else {
                         userFriendlyMessage += ` Error de red: ${errorResponse.status} ${errorResponse.statusText}`;
                     }
                 } else {
                      // Error que no es de respuesta HTTP (ej. error de red, error en el handler)
                      userFriendlyMessage = `Ocurrió un error al intentar descargar la boleta.`;
                      if (err.message) userFriendlyMessage += ` Error: ${err.message}`;
                 }
    
    
                setExcelError(userFriendlyMessage);
            } finally {
                setExcelLoading(false);
            }
        }, []); 

    // Actualizar las columnas para el DataGrid - Usamos useMemo para recalcular solo cuando los handlers cambian
    const updatedColumns = useMemo(() => {
         // Crear una copia mutable de las columnas iniciales
         const currentColumns = [...initialColumns]; // Usamos initialColumns aquí

        // Buscar la columna de participantes y añadir el handler personalizado
         const participantsColumnIndex = currentColumns.findIndex(col => col.field === 'participants');
         if (participantsColumnIndex > -1) {
             currentColumns[participantsColumnIndex] = {
                 ...currentColumns[participantsColumnIndex],
                 customHandler: handleViewParticipants, // Pasar el handler
             };
         }

        // Buscar la columna de descarga de Excel y añadir el handler personalizado
         const downloadExcelColumnIndex = currentColumns.findIndex(col => col.field === 'downloadExcel');
         if (downloadExcelColumnIndex > -1) {
             currentColumns[downloadExcelColumnIndex] = {
                 ...currentColumns[downloadExcelColumnIndex],
                 customHandler: handleDownloadExcel, // Pasar el handler de descarga
             };
             // Asegurar centrado si no está ya en initialColumns
             currentColumns[downloadExcelColumnIndex].align = currentColumns[downloadExcelColumnIndex].align || 'center';
             currentColumns[downloadExcelColumnIndex].headerAlign = currentColumns[downloadExcelColumnIndex].headerAlign || 'center';
         }

        // Buscar la columna de acciones (Eliminar) y añadir el handler personalizado
        // La colocamos DESPUÉS de la columna de descarga
         const actionsColumnIndex = currentColumns.findIndex(col => col.field === 'actions');
         if (actionsColumnIndex > -1) {
             // Si la columna de acciones ya estaba definida, la modificamos
             currentColumns[actionsColumnIndex] = {
                 ...currentColumns[actionsColumnIndex],
                 customHandler: handleDeleteBooking, // Pasar el handler de eliminación
             };
             // Asegurar centrado si no está ya en initialColumns
              currentColumns[actionsColumnIndex].align = currentColumns[actionsColumnIndex].align || 'center';
              currentColumns[actionsColumnIndex].headerAlign = currentColumns[actionsColumnIndex].headerAlign || 'center';
         }


         // Aplicar centrado a otras columnas si se desea (copiado de tu código original)
         const columnsToCenter = ['bookingDate', 'startTime', 'groupSize', 'numberLap', 'finalPrice', 'id']; // Añadido 'id' para centrar
         columnsToCenter.forEach(field => {
             const colIndex = currentColumns.findIndex(col => col.field === field);
             if (colIndex > -1) {
                 currentColumns[colIndex] = {
                     ...currentColumns[colIndex],
                     align: 'center',
                     headerAlign: 'center',
                 };
             }
         });


        return currentColumns; // Devolver las columnas actualizadas

    }, [handleViewParticipants, handleDeleteBooking, handleDownloadExcel]); // Dependencias: handlers usados en renderCell


    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Paper sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                    Listado de Todas las Reservas
                </Typography>

                {/* Indicadores de carga y error para la eliminación y descarga */}
                {(deleteLoading || excelLoading) && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
                {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
                {excelError && <Alert severity="error" sx={{ mb: 2 }}>{excelError}</Alert>}


                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}


                {/* El DataGrid necesita una altura definida. Ajusta 'height' según tu diseño. */}
                <Box sx={{ height: 600, width: '100%' }}>
                    {!loading && !error && (
                        <DataGrid
                            rows={bookings}
                            columns={updatedColumns} // Usar las columnas modificadas con handlers
                            pageSizeOptions={[10, 25, 50, 100]}
                            disableRowSelectionOnClick // No queremos que clickear la fila seleccione (la eliminación es por botón)
                            // --- Propiedad para el estado inicial de la paginación ---
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 10, page: 0 },
                                },
                            }}
                            // --- Fin Propiedades de Paginación ---
                        />
                    )}
                </Box>


            </Paper>

            {/* --- Modal de Detalles de Participantes --- */}
            <Dialog open={showParticipantsModal} onClose={handleCloseParticipantsModal} maxWidth="sm" fullWidth>
                <DialogTitle>Detalle de Participantes</DialogTitle>
                <DialogContent dividers>
                    {selectedParticipants.length === 0 ? (
                        <Typography>No hay participantes para mostrar.</Typography>
                    ) : (
                        // Mapear y mostrar los detalles de los participantes
                        selectedParticipants.map((participant, index) => (
                             <Box key={participant.id || index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px', backgroundColor: participant.rut === mainClientRut ? '#e3f2fd' : 'inherit' }}> {/* Resalta el cliente principal */}
                                 <Typography variant="h6" gutterBottom>
                                    {participant.rut === mainClientRut ? 'Cliente Principal' : `Participante ${index + (participant.rut === mainClientRut ? 0 : 1)}`} {/* Ajusta el índice si el principal está incluido */}
                                 </Typography>
                                 <Grid container spacing={1}>
                                     <Grid item xs={12} sm={6}><Typography variant="body2"><strong>RUT:</strong> {participant.rut || 'N/A'}</Typography></Grid>
                                     <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Nombre:</strong> {participant.name || 'N/A'}</Typography></Grid>
                                      <Grid item xs={12} sm={6}>
                                         <Typography variant="body2">
                                             <strong>Fecha Nacimiento:</strong>
                                             {participant.birthDate ?
                                                 (() => { // Usar un IIFE para formatear la fecha si es una cadena
                                                     try {
                                                         const date = parse(participant.birthDate, 'yyyy-MM-dd', new Date(), { locale: esLocale }); // Usar parse
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
                         ))
                     )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseParticipantsModal}>Cerrar</Button>
                </DialogActions>
            </Dialog>


        </Container>
    );
}


export default BookingListPage;