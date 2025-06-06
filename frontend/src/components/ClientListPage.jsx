// src/components/ClientListPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Container, Typography, Box, Paper, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider, IconButton, TextField } from '@mui/material'; // Importar TextField
// Asegúrate que el servicio de cliente esté importado
import clientService from '../services/client.service';


// Importar iconos de MUI
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // Icono para la acción de actualizar/editar


// Definición de las columnas para el Data Grid de clientes
// NOTA: Las columnas de acción se añadirán dinámicamente en useMemo
const columns = [
    { field: 'id', headerName: 'ID Cliente', width: 100 },
    { field: 'rut', headerName: 'RUT', width: 150 },
    { field: 'name', headerName: 'Nombre Completo', width: 250 },
    {field: 'birthDate',headerName: 'Fecha Nacimiento', width: 150,},
    { field: 'email', headerName: 'Email', width: 250 },
    // Las columnas de acción (Eliminar y Actualizar) se añadirán en useMemo
];


function ClientListPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estado para manejar la carga y error de la eliminación ---
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // --- Estados para el Modal de Actualización ---
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [clientToEdit, setClientToEdit] = useState(null); // Cliente completo para referencia (incluye RUT)
    const [updatedClientData, setUpdatedClientData] = useState({ // Solo campos editables
        name: '',
        birthDate: '', // Usaremos string 'yyyy-MM-dd'
        email: ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState(null);


    // --- Función para cargar los datos de los clientes ---
    const fetchAllClients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await clientService.getAll();
            console.log("Datos de todos los clientes recibidos:", response.data);

            // Mapear los datos para asegurar que cada fila tenga un ID
            const formattedClients = response.data.map(client => ({
                ...client,
                id: client.id, // Aseguramos que el id sea el id del cliente
                 // Asegurarnos de que birthDate sea una cadena yyyy-MM-dd si viene como objeto/fecha
                 birthDate: client.birthDate ? (client.birthDate.year ? `${client.birthDate.year}-${String(client.birthDate.monthValue).padStart(2, '0')}-${String(client.birthDate.dayOfMonth).padStart(2, '0')}` : client.birthDate) : ''

            }));

            console.log("Datos de clientes formateados para DataGrid:", formattedClients);

            setClients(formattedClients);
        } catch (err) {
            console.error("Error fetching all clients:", err);
            setError("No se pudieron cargar los clientes.");
        } finally {
            setLoading(false);
        }
    }, []); // Dependencias vacías

    // --- useEffect para cargar datos al montar el componente ---
    useEffect(() => {
        fetchAllClients();
    }, [fetchAllClients]); // Depende de fetchAllClients


    // --- Handler para eliminar un cliente individual ---
    const handleDeleteClient = useCallback(async (clientId) => {
        // Mostrar ventana de confirmación
        if (window.confirm(`¿Estás seguro de eliminar al cliente con ID ${clientId}?`)) {
            setDeleteLoading(true); // Mostrar indicador de carga
            setDeleteError(null); // Limpiar errores previos

            try {
                await clientService.remove(clientId); // Llama al servicio para eliminar por ID
                console.log(`Cliente con ID ${clientId} eliminado.`);
                // Opcional: Mostrar un mensaje de éxito flotante (Snackbar)
                // alert(`Cliente con ID ${clientId} eliminado con éxito.`);

                // Recargar la lista de clientes después de eliminar
                fetchAllClients();

            } catch (err) {
                console.error(`Error eliminando cliente con ID ${clientId}:`, err);
                 // Mostrar mensaje de error
                setDeleteError(`No se pudo eliminar al cliente con ID ${clientId}.`);
                // Podrías volver a cargar la lista incluso si falla, para mostrar el estado actual
                // fetchAllClients();
            } finally {
                setDeleteLoading(false); // Ocultar indicador de carga
            }
        }
    }, [fetchAllClients]); // Depende de fetchAllClients para recargar la lista


    // --- Handler para abrir el modal de actualización ---
    const handleEditClient = useCallback((clientData) => {
        setClientToEdit(clientData); // Guarda el cliente completo
        // Inicializa los datos del formulario con los campos editables
        setUpdatedClientData({
            name: clientData.name || '',
            // Asegúrate de formatear la fecha a 'yyyy-MM-dd' para el input type="date"
             birthDate: clientData.birthDate || '', // Ya debería estar 'yyyy-MM-dd' por el fetch
            email: clientData.email || ''
        });
        setShowUpdateModal(true); // Abre el modal
    }, []); // No depende de estados o props que cambien (solo usa el parámetro clientData)


    // --- Handler para cerrar el modal de actualización ---
    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setClientToEdit(null); // Limpiar cliente en edición
        setUpdatedClientData({ name: '', birthDate: '', email: '' }); // Limpiar datos del formulario
        setUpdateError(null); // Limpiar errores del modal
    }, []);


    // --- Handler para guardar los cambios del cliente ---
    const handleSaveUpdate = async () => {
         if (!clientToEdit) return; // No hacer nada si no hay cliente en edición

        setUpdateLoading(true);
        setUpdateError(null);

        try {
            // Construir el objeto cliente con los datos actualizados y los datos no editables
            const clientToSave = {
                ...clientToEdit, // Mantiene ID, RUT, etc.
                name: updatedClientData.name,
                birthDate: updatedClientData.birthDate, // Ya es string 'yyyy-MM-dd'
                email: updatedClientData.email,
            };

             console.log("Guardando cliente:", clientToSave);

            await clientService.update(clientToSave); // Llama al servicio de actualización

            console.log(`Cliente con ID ${clientToSave.id} actualizado.`);
             // Opcional: Mostrar mensaje de éxito (Snackbar)

            handleCloseUpdateModal(); // Cierra el modal
            fetchAllClients(); // Recarga la lista para mostrar los cambios

        } catch (err) {
            console.error("Error actualizando cliente:", err);
             // Mostrar mensaje de error en el modal
            setUpdateError("No se pudo actualizar el cliente. Verifica los datos.");
        } finally {
            setUpdateLoading(false);
        }
    };

    // --- Handler para cambios en los inputs del modal ---
    const handleModalInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setUpdatedClientData(prevData => ({
            ...prevData,
            [name]: value
        }));
    }, []);


    // Definición de las columnas para el Data Grid, añadiendo las columnas de acción
    const updatedColumns = useMemo(() => {
        // Crear una copia de las columnas originales
        const currentColumns = [...columns];

         // Añadir centrado a las columnas de datos específicas si se desea
         const columnsToCenter = ['birthDate', 'rut']; // Añade/remueve campos según necesites centrar
         currentColumns.forEach(col => {
             if (columnsToCenter.includes(col.field)) {
                 col.align = 'center';
                 col.headerAlign = 'center';
             }
         });

        // --- Añadir la columna de Acciones (Eliminar y Actualizar) al final ---
        currentColumns.push({
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {/* Botón de Eliminar */}
                        <IconButton
                            color="error"
                            aria-label="eliminar cliente"
                            onClick={() => handleDeleteClient(params.row.id)} // Llama al handler de eliminación con el ID
                            size="small"
                             disabled={deleteLoading || updateLoading} // Deshabilitar si alguna operación está en curso
                        >
                            <DeleteIcon />
                        </IconButton>
                        {/* Botón de Actualizar */}
                        <IconButton
                            color="primary" // Puedes elegir otro color
                            aria-label="actualizar cliente"
                            onClick={() => handleEditClient(params.row)} // Llama al handler de edición con los datos de la fila
                            size="small"
                             disabled={deleteLoading || updateLoading} // Deshabilitar si alguna operación está en curso
                        >
                            <EditIcon />
                        </IconButton>
                    </Box>
                );
            },
            align: 'center', // Centrar los iconos en la columna
            headerAlign: 'center', // Centrar el encabezado de la columna
        });


        return currentColumns; // Devolver las columnas actualizadas

    }, [handleDeleteClient, handleEditClient]); // Dependencias: handlers de eliminar y editar


    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Paper sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                    Listado de Todos los Clientes
                </Typography>

                {/* Indicadores de carga y error para la eliminación */}
                {deleteLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
                {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}

                {/* Indicador de carga y error principal (para la carga inicial de la lista) */}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}


                {/* El DataGrid necesita una altura definida. Ajusta 'height' según tu diseño. */}
                <Box sx={{ height: 600, width: '100%' }}>
                    {!loading && !error && (
                        <DataGrid
                            rows={clients}
                            columns={updatedColumns} // Usamos las columnas modificadas
                            pageSizeOptions={[10, 25, 50, 100]}
                            disableRowSelectionOnClick // Desactivar selección al hacer clic en la fila
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

            {/* --- Modal de Actualización de Cliente --- */}
            <Dialog open={showUpdateModal} onClose={handleCloseUpdateModal} maxWidth="sm" fullWidth>
                 <DialogTitle>Actualizar Cliente</DialogTitle>
                 <DialogContent dividers>
                     {updateLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
                     {updateError && <Alert severity="error" sx={{ mb: 2 }}>{updateError}</Alert>}

                     {/* Mostrar RUT (solo lectura) */}
                     {clientToEdit?.rut && (
                        <TextField
                            margin="dense"
                            label="RUT"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={clientToEdit.rut}
                            InputProps={{
                                readOnly: true, // Hacer el campo de solo lectura
                            }}
                            sx={{ mb: 2 }}
                        />
                     )}

                     {/* Campo Nombre Completo */}
                     <TextField
                         margin="dense"
                         label="Nombre Completo"
                         name="name" // Importante para handleModalInputChange
                         type="text"
                         fullWidth
                         variant="outlined"
                         value={updatedClientData.name}
                         onChange={handleModalInputChange}
                         disabled={updateLoading} // Deshabilitar mientras guarda
                         sx={{ mb: 2 }}
                     />

                     {/* Campo Fecha Nacimiento */}
                      <TextField
                         margin="dense"
                         label="Fecha Nacimiento"
                         name="birthDate" // Importante para handleModalInputChange
                          // Usamos type="date" para un selector nativo del navegador
                         type="date"
                         fullWidth
                         variant="outlined"
                          // Asegurarse de que el valor sea una cadena 'yyyy-MM-dd' para el input type="date"
                         value={updatedClientData.birthDate}
                         onChange={handleModalInputChange}
                         disabled={updateLoading} // Deshabilitar mientras guarda
                         InputLabelProps={{
                            shrink: true, // Para que el label no se superponga al valor en inputs type="date"
                          }}
                         sx={{ mb: 2 }}
                     />

                     {/* Campo Email */}
                      <TextField
                         margin="dense"
                         label="Email"
                         name="email" // Importante para handleModalInputChange
                         type="email"
                         fullWidth
                         variant="outlined"
                         value={updatedClientData.email}
                         onChange={handleModalInputChange}
                         disabled={updateLoading} // Deshabilitar mientras guarda
                         sx={{ mb: 2 }}
                     />

                 </DialogContent>
                 <DialogActions>
                     <Button onClick={handleCloseUpdateModal} disabled={updateLoading}>
                         Cancelar
                     </Button>
                     <Button onClick={handleSaveUpdate} color="primary" disabled={updateLoading}>
                         Guardar Cambios
                     </Button>
                 </DialogActions>
             </Dialog>

        </Container>
    );
}


export default ClientListPage;