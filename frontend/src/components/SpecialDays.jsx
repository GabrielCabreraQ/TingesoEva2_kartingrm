// src/components/SpecialDays.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Container, Typography, Box, Paper, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Grid } from '@mui/material';
// Importar el servicio para días especiales
import specialDayService from '../services/special_day.service'; // Asumiendo que los métodos están en pricing.service como indicaste
// Asegúrate que format, parse y esLocale de date-fns estén importados
import { format, parse, isValid } from 'date-fns'; // Importar isValid
import esLocale from 'date-fns/locale/es';

// Importar iconos de MUI
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';


// Definición básica de las columnas (acciones se añadirán en useMemo)
const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {field: 'date',headerName: 'Fecha',width: 150,},
    { field: 'description', headerName: 'Descripción', width: 300 },
];

function SpecialDaysPage() {
    const [specialDays, setSpecialDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados para el Modal de Crear/Editar ---
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingSpecialDay, setEditingSpecialDay] = useState(null); // Objeto del día especial a editar (null para crear)
    const [formData, setFormData] = useState({ // Datos del formulario
        date: '', // Usaremos string 'yyyy-MM-dd' para el input type="date"
        description: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    // --- Estados para manejar la carga y error de la eliminación ---
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState(null);


    // --- Función para cargar todos los días especiales ---
    const fetchAllSpecialDays = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await specialDayService.getAll();
            console.log("Datos de todos los días especiales recibidos:", response.data);

             // Asegurarse de que cada objeto tenga un ID y formatear la fecha si es necesario
            const formattedDays = response.data.map(day => ({
                ...day,
                id: day.id,
                 // Asegurarnos de que date sea una cadena 'yyyy-MM-dd' si viene como objeto/fecha
                date: day.date ? (day.date.year ? `${day.date.year}-${String(day.date.monthValue).padStart(2, '0')}-${String(day.date.dayOfMonth).padStart(2, '0')}` : day.date) : ''
            }));

            console.log("Datos de días especiales formateados para DataGrid:", formattedDays);
            setSpecialDays(formattedDays);
        } catch (err) {
            console.error("Error fetching all special days:", err);
            setError("No se pudieron cargar los días especiales.");
        } finally {
            setLoading(false);
        }
    }, []); // Dependencias vacías

    // --- useEffect para cargar datos al montar el componente ---
    useEffect(() => {
        fetchAllSpecialDays();
    }, [fetchAllSpecialDays]);


    // --- Handler para abrir el modal en modo Crear ---
    const handleCreateClick = useCallback(() => {
        setEditingSpecialDay(null); // Modo crear
        setFormData({ date: '', description: '' }); // Limpiar formulario
        setShowFormModal(true); // Abrir modal
        setFormError(null); // Limpiar errores previos del modal
    }, []);


    // --- Handler para abrir el modal en modo Editar ---
    const handleEditClick = useCallback((specialDayData) => {
        setEditingSpecialDay(specialDayData); // Guardar el objeto para saber que estamos editando
        // Cargar datos del día especial en el formulario
        setFormData({
            date: specialDayData.date || '', // Ya debería ser 'yyyy-MM-dd' por el fetch
            description: specialDayData.description || ''
        });
        setShowFormModal(true); // Abrir modal
        setFormError(null); // Limpiar errores previos del modal
    }, []);


    // --- Handler para cerrar el modal ---
    const handleCloseFormModal = useCallback(() => {
        setShowFormModal(false);
        setEditingSpecialDay(null); // Limpiar
        setFormData({ date: '', description: '' }); // Limpiar
        setFormError(null); // Limpiar errores
    }, []);


    // --- Handler para cambios en los inputs del formulario del modal ---
    const handleFormInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    }, []);


    // --- Handler para guardar (Crear o Actualizar) ---
    const handleSaveForm = async () => {
        setFormLoading(true);
        setFormError(null);

        // Validación básica
        if (!formData.date || !formData.description) {
            setFormError("La fecha y la descripción son obligatorias.");
            setFormLoading(false);
            return;
        }
         // Validación de formato de fecha (opcional pero recomendado)
        if (formData.date && !isValid(parse(formData.date, 'yyyy-MM-dd', new Date()))) {
             setFormError("El formato de la fecha no es válido (debe ser AAAA-MM-DD).");
             setFormLoading(false);
             return;
        }


        try {
            let response;
            const dataToSave = { ...formData };

            if (editingSpecialDay) {
                // Modo Editar: Incluir ID y llamar a update
                dataToSave.id = editingSpecialDay.id;
                console.log("Intentando actualizar día especial:", dataToSave);
                response = await specialDayService.update(dataToSave);
                console.log("Respuesta de actualización:", response.data);
            } else {
                // Modo Crear: Llamar a create
                console.log("Intentando crear día especial:", dataToSave);
                response = await specialDayService.create(dataToSave);
                console.log("Respuesta de creación:", response.data);
            }

            // Recargar la lista después de una acción exitosa
            await fetchAllSpecialDays();

            // Mostrar mensaje de éxito (opcional)
             alert(`Día especial ${editingSpecialDay ? 'actualizado' : 'creado'} con éxito.`);

            handleCloseFormModal(); // Cerrar modal

        } catch (err) {
            console.error(`Error al ${editingSpecialDay ? 'actualizar' : 'crear'} día especial:`, err);
             const userMessage = err.response?.data?.message || err.message || `Error desconocido al ${editingSpecialDay ? 'actualizar' : 'crear'}.`;
            setFormError(`No se pudo ${editingSpecialDay ? 'actualizar' : 'crear'} el día especial. ${userMessage}`);
        } finally {
            setFormLoading(false);
        }
    };


     // --- Handler para eliminar un día especial individual ---
    const handleDeleteClick = useCallback(async (specialDayId) => {
        // Mostrar ventana de confirmación
        if (window.confirm(`¿Estás seguro de eliminar el día especial con ID ${specialDayId}?`)) {
            setDeleteLoading(true); // Mostrar indicador de carga
            setDeleteError(null); // Limpiar errores previos

            try {
                await specialDayService.remove(specialDayId); // Llama al servicio para eliminar por ID
                console.log(`Día especial con ID ${specialDayId} eliminado.`);
                // Opcional: Mostrar un mensaje de éxito flotante (Snackbar)
                // alert(`Día especial con ID ${specialDayId} eliminado con éxito.`);

                // Recargar la lista después de eliminar
                fetchAllSpecialDays();

            } catch (err) {
                console.error(`Error eliminando día especial con ID ${specialDayId}:`, err);
                 const userMessage = err.response?.data?.message || err.message || 'Error desconocido.';
                setDeleteError(`No se pudo eliminar el día especial con ID ${specialDayId}. ${userMessage}`);
                // Podrías volver a cargar la lista incluso si falla, para mostrar el estado actual
                // fetchAllSpecialDays();
            } finally {
                setDeleteLoading(false); // Ocultar indicador de carga
            }
        }
    }, [fetchAllSpecialDays]); // Depende de fetchAllSpecialDays para recargar la lista


    // Definición de las columnas para el Data Grid, añadiendo la columna de acciones
    const updatedColumns = useMemo(() => {
        // Crear una copia de las columnas básicas
        const currentColumns = columns.map(col => ({ ...col }));

         // Añadir la columna de Acciones (Editar y Eliminar) al final
        currentColumns.push({
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {/* Botón de Editar */}
                        <IconButton
                            color="primary" // Color para editar
                            aria-label="editar día especial"
                            onClick={() => handleEditClick(params.row)} // Llama al handler de edición con los datos de la fila
                            size="small"
                             disabled={deleteLoading || formLoading} // Deshabilitar si alguna operación está en curso
                        >
                            <EditIcon />
                        </IconButton>
                        {/* Botón de Eliminar */}
                        <IconButton
                            color="error" // Color para eliminar
                            aria-label="eliminar día especial"
                            onClick={() => handleDeleteClick(params.row.id)} // Llama al handler de eliminación con el ID
                            size="small"
                             disabled={deleteLoading || formLoading} // Deshabilitar si alguna operación está en curso
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                );
            },
            align: 'center', // Centrar los iconos en la columna
            headerAlign: 'center', // Centrar el encabezado de la columna
        });

         // Centrar otras columnas si se desea (ej: 'id')
         const columnsToCenter = ['id'];
          currentColumns.forEach(col => {
             if (columnsToCenter.includes(col.field)) {
                 col.align = 'center';
                 col.headerAlign = 'center';
             }
         });


        return currentColumns; // Devolver las columnas actualizadas

    }, [handleEditClick, handleDeleteClick, deleteLoading, formLoading]); // Dependencias: handlers y estados de carga


    return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                    Gestión de Días Especiales
                </Typography>

                 {/* Botón para Añadir Nuevo Día Especial */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                     <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateClick}
                         disabled={loading || deleteLoading || formLoading} // Deshabilitar si hay carga o acción en curso
                    >
                        Añadir Día Especial
                    </Button>
                </Box>

                {/* Indicadores de carga y error */}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {deleteLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
                {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}


                {/* DataGrid para mostrar el listado */}
                 {/* Mostrar el DataGrid solo si no está en carga inicial ni hay error inicial */}
                {!loading && !error && (
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={specialDays}
                            columns={updatedColumns} // Usar las columnas con acciones
                            pageSizeOptions={[10, 25, 50, 100]}
                            disableRowSelectionOnClick // Desactivar selección de fila por clic
                            // Propiedad para el estado inicial de la paginación
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 10, page: 0 },
                                },
                            }}
                        />
                    </Box>
                )}


            </Paper>

            {/* --- Modal de Crear/Editar Día Especial --- */}
            <Dialog open={showFormModal} onClose={handleCloseFormModal} maxWidth="sm" fullWidth>
                 <DialogTitle>{editingSpecialDay ? 'Editar Día Especial' : 'Crear Nuevo Día Especial'}</DialogTitle>
                 <DialogContent dividers>
                     {formLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
                     {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

                     <Grid container spacing={2}>
                         {/* Campo Fecha */}
                         <Grid item xs={12}>
                             <TextField
                                 margin="dense"
                                 label="Fecha"
                                 name="date"
                                 type="date" // Usamos type="date" para un selector nativo
                                 fullWidth
                                 variant="outlined"
                                 value={formData.date}
                                 onChange={handleFormInputChange}
                                 disabled={formLoading}
                                 InputLabelProps={{
                                    shrink: true, // Para que el label no se superponga
                                  }}
                                 required
                             />
                         </Grid>

                         {/* Campo Descripción */}
                         <Grid item xs={12}>
                             <TextField
                                 margin="dense"
                                 label="Descripción"
                                 name="description"
                                 type="text"
                                 fullWidth
                                 variant="outlined"
                                 value={formData.description}
                                 onChange={handleFormInputChange}
                                 disabled={formLoading}
                                 required
                             />
                         </Grid>
                     </Grid>
                 </DialogContent>
                 <DialogActions>
                     <Button onClick={handleCloseFormModal} disabled={formLoading}>
                         Cancelar
                     </Button>
                     <Button onClick={handleSaveForm} color="primary" disabled={formLoading}>
                         {editingSpecialDay ? 'Guardar Cambios' : 'Crear Día'}
                     </Button>
                 </DialogActions>
             </Dialog>

        </Container>
    );
}

export default SpecialDaysPage;