// src/components/Pricing.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Alert, Button, TextField, Grid, Divider } from '@mui/material';
import pricingService from '../services/pricing.service';

function PricingPage() {
    // Estado para la última configuración de precios (lectura inicial)
    const [lastPricing, setLastPricing] = useState(null);
    // Estado para los datos del formulario (para crear o actualizar)
    const [pricingData, setPricingData] = useState({
        price10Laps: 0.0,
        price15Laps: 0.0,
        price20Laps: 0.0,
        discount1To2People: 0.0,
        discount3To5People: 0.0,
        discount6To10People: 0.0,
        discount11To15People: 0.0,
        discountVeryFrequent: 0.0,
        discountFrequent: 0.0,
        discountRegular: 0.0,
        discountNonFrequent: 0.0,
        weekendRise: 0.0,
        holydayRise: 0.0, // Asegúrate de que el nombre del campo coincida con tu backend (PricingEntity.java)
        weekendDiscount: 0.0,
        holidayDiscount: 0.0,
        birthdayDiscount: 0.0,
        iva: 0.0,
    });

    // Estados de carga y error para la carga inicial
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados de carga y error para las acciones (crear/actualizar)
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState(null);

    // --- Estado para controlar si el formulario está en modo edición ---
    const [isEditing, setIsEditing] = useState(false);


    // --- Función para cargar la última configuración de precios ---
    const fetchLastPricing = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await pricingService.getLast();
            console.log("Último precio recibido:", response.data);

            if (response.data) {
                setLastPricing(response.data);
                // Cargar los datos del último precio en el formulario
                setPricingData({
                    price10Laps: response.data.price10Laps || 0.0,
                    price15Laps: response.data.price15Laps || 0.0,
                    price20Laps: response.data.price20Laps || 0.0,
                    discount1To2People: response.data.discount1To2People || 0.0,
                    discount3To5People: response.data.discount3To5People || 0.0,
                    discount6To10People: response.data.discount6To10People || 0.0,
                    discount11To15People: response.data.discount11To15People || 0.0,
                    discountVeryFrequent: response.data.discountVeryFrequent || 0.0,
                    discountFrequent: response.data.discountFrequent || 0.0,
                    discountRegular: response.data.discountRegular || 0.0,
                    discountNonFrequent: response.data.discountNonFrequent || 0.0,
                    weekendRise: response.data.weekendRise || 0.0,
                    holydayRise: response.data.holydayRise || 0.0,
                    weekendDiscount: response.data.weekendDiscount || 0.0,
                    holidayDiscount: response.data.holidayDiscount || 0.0,
                    birthdayDiscount: response.data.birthdayDiscount || 0.0,
                    iva: response.data.iva || 0.0,
                });
                 setIsEditing(false); // Al cargar datos existentes, no estamos editando inicialmente
            } else {
                // No hay precios previos, preparar formulario para crear uno nuevo
                setLastPricing(null);
                setPricingData({
                    price10Laps: 0.0,
                    price15Laps: 0.0,
                    price20Laps: 0.0,
                    discount1To2People: 0.0,
                    discount3To5People: 0.0,
                    discount6To10People: 0.0,
                    discount11To15People: 0.0,
                    discountVeryFrequent: 0.0,
                    discountFrequent: 0.0,
                    discountRegular: 0.0,
                    discountNonFrequent: 0.0,
                    weekendRise: 0.0,
                    holydayRise: 0.0,
                    weekendDiscount: 0.0,
                    holidayDiscount: 0.0,
                    birthdayDiscount: 0.0,
                    iva: 0.0,
                });
                 setIsEditing(true); // Si no hay precios, el modo inicial es crear (editable)
            }
        } catch (err) {
            console.error("Error fetching last pricing:", err);
            setError("No se pudo cargar la configuración de precios.");
             // En caso de error al cargar, también preparar formulario vacío y modo creación
             setLastPricing(null);
             setPricingData({
                 price10Laps: 0.0, price15Laps: 0.0, price20Laps: 0.0,
                 discount1To2People: 0.0, discount3To5People: 0.0, discount6To10People: 0.0, discount11To15People: 0.0,
                 discountVeryFrequent: 0.0, discountFrequent: 0.0, discountRegular: 0.0, discountNonFrequent: 0.0,
                 weekendRise: 0.0, holydayRise: 0.0, weekendDiscount: 0.0, holidayDiscount: 0.0, birthdayDiscount: 0.0,
                 iva: 0.0,
            });
             setIsEditing(true); // Modo creación si hay error al cargar
        } finally {
            setLoading(false);
        }
    }, []); // Dependencias vacías

    // --- useEffect para cargar datos al montar el componente ---
    useEffect(() => {
        fetchLastPricing();
    }, [fetchLastPricing]);


    // --- Handler para cambios en los inputs del formulario ---
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        // Permitir punto o coma como separador decimal y convertir a número flotante
        const cleanedValue = value.replace(',', '.'); // Reemplazar coma por punto
        const numValue = cleanedValue === '' ? '' : parseFloat(cleanedValue);


        setPricingData(prevData => ({
            ...prevData,
            // Guardar como número si es un número válido, de lo contrario, guardar la cadena limpia (ej: "1.5", "" si se borra todo)
            [name]: isNaN(numValue) && cleanedValue !== '' ? cleanedValue : numValue // Mantener cadena si es texto no numérico (raro en type=number pero seguro)
        }));
    }, []);


    // --- Handler para iniciar el modo edición (cuando hay un precio existente) ---
    const handleStartEditing = useCallback(() => {
        if (lastPricing) {
            // Cargar los datos del último precio en el formulario para edición (si no estaban ya)
             setPricingData({
                 price10Laps: lastPricing.price10Laps || 0.0,
                 price15Laps: lastPricing.price15Laps || 0.0,
                 price20Laps: lastPricing.price20Laps || 0.0,
                 discount1To2People: lastPricing.discount1To2People || 0.0,
                 discount3To5People: lastPricing.discount3To5People || 0.0,
                 discount6To10People: lastPricing.discount6To10People || 0.0,
                 discount11To15People: lastPricing.discount11To15People || 0.0,
                 discountVeryFrequent: lastPricing.discountVeryFrequent || 0.0,
                 discountFrequent: lastPricing.discountFrequent || 0.0,
                 discountRegular: lastPricing.discountRegular || 0.0,
                 discountNonFrequent: lastPricing.discountNonFrequent || 0.0,
                 weekendRise: lastPricing.weekendRise || 0.0,
                 holydayRise: lastPricing.holydayRise || 0.0,
                 weekendDiscount: lastPricing.weekendDiscount || 0.0,
                 holidayDiscount: lastPricing.holidayDiscount || 0.0,
                 birthdayDiscount: lastPricing.birthdayDiscount || 0.0,
                 iva: lastPricing.iva || 0.0,
             });
            setIsEditing(true);
            setActionError(null); // Limpiar errores de acción previos al empezar a editar
        }
    }, [lastPricing]); // Depende de lastPricing para cargar los datos


    // --- Handler para cancelar el modo edición ---
    const handleCancelEditing = useCallback(() => {
        if (lastPricing) {
            // Restaurar los datos del formulario a los valores del último precio cargado
             setPricingData({
                 price10Laps: lastPricing.price10Laps || 0.0,
                 price15Laps: lastPricing.price15Laps || 0.0,
                 price20Laps: lastPricing.price20Laps || 0.0,
                 discount1To2People: lastPricing.discount1To2People || 0.0,
                 discount3To5People: lastPricing.discount3To5People || 0.0,
                 discount6To10People: lastPricing.discount6To10People || 0.0,
                 discount11To15People: lastPricing.discount11To15People || 0.0,
                 discountVeryFrequent: lastPricing.discountVeryFrequent || 0.0,
                 discountFrequent: lastPricing.discountFrequent || 0.0,
                 discountRegular: lastPricing.discountRegular || 0.0,
                 discountNonFrequent: lastPricing.discountNonFrequent || 0.0,
                 weekendRise: lastPricing.weekendRise || 0.0,
                 holydayRise: lastPricing.holydayRise || 0.0,
                 weekendDiscount: lastPricing.weekendDiscount || 0.0,
                 holidayDiscount: lastPricing.holidayDiscount || 0.0,
                 birthdayDiscount: lastPricing.birthdayDiscount || 0.0,
                 iva: lastPricing.iva || 0.0,
             });
        }
        setIsEditing(false);
        setActionError(null); // Limpiar errores al cancelar
    }, [lastPricing]); // Depende de lastPricing para restaurar los datos


    // --- Handler para el botón Crear/Actualizar ---
    const handleSubmit = async () => {
        setActionLoading(true);
        setActionError(null);

        try {
            let response;
            const dataToSave = { ...pricingData };

            // Asegurarse de que todos los valores sean números, convirtiendo cadenas vacías a 0.0
             for (const key in dataToSave) {
                 if (dataToSave[key] === '' || dataToSave[key] === null || dataToSave[key] === undefined) {
                     dataToSave[key] = 0.0;
                 } else if (typeof dataToSave[key] === 'string') {
                     const parsedNum = parseFloat(dataToSave[key]);
                      dataToSave[key] = isNaN(parsedNum) ? 0.0 : parsedNum;
                 }
             }


            if (lastPricing && lastPricing.id) {
                // Si existe un último precio y estamos editando, actualizar
                dataToSave.id = lastPricing.id;
                console.log("Intentando actualizar precio:", dataToSave);
                response = await pricingService.update(dataToSave);
                console.log("Respuesta de actualización:", response.data);
            } else {
                // Si no existe precio previo, crear
                console.log("Intentando crear precio:", dataToSave);
                response = await pricingService.create(dataToSave);
                console.log("Respuesta de creación:", response.data);
            }

            // Recargar la última configuración después de una acción exitosa
             await fetchLastPricing(); // Esto también pondrá isEditing en false si había un precio previo

             // Mostrar un mensaje de éxito
            alert(`Configuración de precios ${lastPricing ? 'actualizada' : 'creada'} con éxito.`);


        } catch (err) {
            console.error(`Error al ${lastPricing ? 'actualizar' : 'crear'} precio:`, err);
            // Intentar extraer un mensaje de error más amigable del objeto de error, si es posible (ej: AxiosError)
             const userMessage = err.response?.data?.message || err.message || `Error desconocido al ${lastPricing ? 'actualizar' : 'crear'} la configuración de precios.`;
            setActionError(`No se pudo ${lastPricing ? 'actualizar' : 'crear'} la configuración de precios. ${userMessage}`);
        } finally {
            setActionLoading(false);
        }
    };


    // Determinar si mostrar el formulario o solo el spinner/mensaje inicial
    const showForm = !loading && !error;

    return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                    Configuración de Precios
                </Typography>

                 {/* Opcional: Mostrar ID de la configuración actual si existe */}
                {lastPricing && !isEditing && ( // Mostrar ID solo cuando no estamos editando y existe un precio
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
                        ID Configuración Actual: {lastPricing.id}
                    </Typography>
                )}


                {/* Indicadores de carga y error inicial */}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                 {/* Indicadores de carga y error para acciones (crear/actualizar) */}
                {actionLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
                {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}


                {/* Formulario de Precios */}
                 {/* Mostrar formulario si no hay carga inicial ni error inicial */}
                {showForm ? (
                    <Box component="form" noValidate autoComplete="off">
                        <Grid container spacing={3}> {/* Añadimos spacing */}

                            {/* Grupo Precios por Vueltas */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>Precios por Vueltas</Typography>
                                <Divider sx={{ mb: 2 }} /> {/* Separador visual */}
                                <Grid container spacing={2}> {/* Nuevo Grid para campos del grupo */}
                                    <Grid item xs={12} sm={4}> {/* sm={4} para 3 columnas en pantallas medianas+ */}
                                        <TextField
                                            label="10 Vueltas"
                                            name="price10Laps"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.price10Laps}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading} // Deshabilitar si NO estamos editando o está guardando
                                            inputProps={{ step: "0.01" }} // Permite decimales
                                            sx={{
                                                '& .MuiInputBase-input.Mui-disabled': {
                                                    color: 'text.primary', // Usa el color de texto primario definido en tu tema MUI
                                                    WebkitTextFillColor: 'text.primary', // Propiedad para Safari/Chrome para texto deshabilitado
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="15 Vueltas"
                                            name="price15Laps"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.price15Laps}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="20 Vueltas"
                                            name="price20Laps"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.price20Laps}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Grupo Descuentos por Grupo */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>Descuentos por Grupo</Typography>
                                <Divider sx={{ mb: 2 }} /> {/* Separador visual */}
                                <Grid container spacing={2}> {/* Nuevo Grid para campos del grupo */}
                                    <Grid item xs={12} sm={6} md={3}> {/* md={3} para 4 columnas en pantallas grandes+ */}
                                        <TextField
                                            label="1-2 Pers."
                                            name="discount1To2People"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.discount1To2People}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            label="3-5 Pers."
                                            name="discount3To5People"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.discount3To5People}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            label="6-10 Pers."
                                            name="discount6To10People"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.discount6To10People}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                     <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            label="11-15 Pers."
                                            name="discount11To15People"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.discount11To15People}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Grupo Descuentos por Frecuencia */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>Descuentos por Frecuencia</Typography>
                                <Divider sx={{ mb: 2 }} /> {/* Separador visual */}
                                <Grid container spacing={2}> {/* Nuevo Grid para campos del grupo */}
                                     <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            label="Muy Frecuente"
                                            name="discountVeryFrequent"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.discountVeryFrequent}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                     <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            label="Frecuente"
                                            name="discountFrequent"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.discountFrequent}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            label="Regular"
                                            name="discountRegular"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.discountRegular}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            label="No Frecuente"
                                            name="discountNonFrequent"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.discountNonFrequent}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>


                            {/* Grupo Recargos/Descuentos Adicionales */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>Adicionales</Typography>
                                <Divider sx={{ mb: 2 }} /> {/* Separador visual */}
                                <Grid container spacing={2}> {/* Nuevo Grid para campos del grupo */}
                                     <Grid item xs={12} sm={6} md={4}> {/* md={4} para 3 columnas en pantallas grandes+ */}
                                        <TextField
                                            label="Recargo Fin Semana"
                                            name="weekendRise"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.weekendRise}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            label="Recargo Día Festivo"
                                            name="holydayRise" // Asegúrate que el nombre del campo coincida
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.holydayRise}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                     <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            label="Descuento Fin Semana"
                                            name="weekendDiscount"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.weekendDiscount}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                     <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            label="Descuento Día Festivo"
                                            name="holidayDiscount"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.holidayDiscount}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            label="Descuento Cumpleaños"
                                            name="birthdayDiscount"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.birthdayDiscount}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                     <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            label="IVA (%)"
                                            name="iva"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={pricingData.iva}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || actionLoading}
                                            inputProps={{ step: "0.01" }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Botones de Acción (Crear, Editar, Guardar, Cancelar) */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
                                    {lastPricing && !isEditing && (
                                        // Botón para iniciar edición (solo si hay precio y no estamos editando)
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleStartEditing}
                                            disabled={actionLoading}
                                        >
                                            Editar Configuración Actual
                                        </Button>
                                    )}

                                    {!lastPricing && (
                                        // Botón para crear la configuración inicial (solo si no hay precio)
                                         <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSubmit} // Clic aquí directamente crea
                                            disabled={actionLoading}
                                        >
                                            Crear Configuración Inicial
                                        </Button>
                                    )}

                                    {lastPricing && isEditing && (
                                        // Botones Guardar y Cancelar (solo si hay precio y estamos editando)
                                        <>
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={handleCancelEditing}
                                                disabled={actionLoading}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleSubmit} // Clic aquí guarda la edición
                                                disabled={actionLoading}
                                            >
                                                Guardar Cambios
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                 // Mostrar un mensaje si no hay datos cargados y no estamos cargando/error
                ) : (!loading && !error && !actionLoading && (
                    <Typography variant="body1" align="center">
                        No se pudo cargar la configuración de precios.
                    </Typography>
                ))}


            </Paper>
        </Container>
    );
}

export default PricingPage;