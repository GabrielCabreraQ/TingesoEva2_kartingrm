// src/components/Report.jsx
import React, { useState, useCallback, useEffect } from 'react'; // Importa useEffect
import { Container, Typography, Box, Paper, CircularProgress, Alert, Button, Grid, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material'; // Importa Divider
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import incomingReportService from '../services/incoming_report.service'; // Asegúrate que la ruta sea correcta
import DownloadIcon from '@mui/icons-material/Download';

function ReportPage() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [reportType, setReportType] = useState(''); // 'laps' o 'group'
    const [generating, setGenerating] = useState(false);
    const [generationError, setGenerationError] = useState(null);
    const [generatedReport, setGeneratedReport] = useState(null); // Para almacenar la info del reporte generado

    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);

    // --- Nuevos estados para la lista de reportes existentes ---
    const [reports, setReports] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // --- Función para cargar la lista de reportes ---
    const fetchReports = useCallback(async () => {
        setFetchLoading(true);
        setFetchError(null);
        try {
            // Llama al nuevo método getAll del servicio
            const response = await incomingReportService.getAll();
            console.log("Lista de reportes existentes recibida:", response.data);
            // Asumimos que response.data es un array de IncomingReportEntity (sin fileContent)
            setReports(response.data);
        } catch (err) {
            console.error("Error fetching reports:", err.response?.data || err.message || err);
            const apiErrorMessage = err.response?.data?.message || err.message || 'Error desconocido al cargar los reportes.';
            setFetchError(`No se pudieron cargar los reportes existentes: ${apiErrorMessage}`);
        } finally {
            setFetchLoading(false);
        }
    }, []); // Dependencias vacías, solo se crea una vez


    // --- useEffect para cargar reportes al montar el componente ---
    useEffect(() => {
        fetchReports(); // Carga los reportes existentes al inicio
    }, [fetchReports]); // Depende de fetchReports (aunque es useCallback con dep. vacías)


    // Handler para cambiar la fecha de inicio
    const handleStartDateChange = useCallback((date) => {
        setStartDate(date);
    }, []);

    // Handler para cambiar la fecha de fin
    const handleEndDateChange = useCallback((date) => {
        setEndDate(date);
    }, []);

    // Handler para cambiar el tipo de reporte
    const handleReportTypeChange = useCallback((event) => {
        setReportType(event.target.value);
    }, []);

    // Handler para generar el reporte
    const handleGenerateReport = useCallback(async () => {
        setGenerating(true);
        setGenerationError(null);
        // No limpiamos generatedReport aquí si queremos mostrar el último generado
        // setGeneratedReport(null);

        if (!startDate || !endDate || !reportType) {
            setGenerationError("Por favor, selecciona un rango de fechas y un tipo de reporte.");
            setGenerating(false);
            return;
        }

        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');

        if (!formattedStartDate || !formattedEndDate) {
             setGenerationError("Fechas seleccionadas inválidas.");
             setGenerating(false);
             return;
        }

        try {
            let response;
            if (reportType === 'laps') {
                console.log(`Generando reporte de vueltas entre ${formattedStartDate} y ${formattedEndDate}`);
                response = await incomingReportService.createLap(formattedStartDate, formattedEndDate);
            } else if (reportType === 'group') {
                 console.log(`Generando reporte de grupo entre ${formattedStartDate} y ${formattedEndDate}`);
                response = await incomingReportService.createGroup(formattedStartDate, formattedEndDate);
            }

            // Esperamos que el backend devuelva la información del reporte guardado (IncomingReportEntity)
            const reportInfo = response.data; // Esto debería ser el objeto IncomingReportEntity

            console.log("Reporte generado exitosamente. Info recibida:", reportInfo);
            setGeneratedReport(reportInfo); // Guardar la info del reporte generado

            // *** Recargar la lista de reportes después de generar uno nuevo ***
            fetchReports(); // Llama a la función para actualizar la lista

        } catch (err) {
            console.error("Error generating report:", err.response?.data || err.message || err);
            const apiErrorMessage = err.response?.data?.message || err.message || 'Error desconocido al generar el reporte.';
            setGenerationError(`Error al generar el reporte: ${apiErrorMessage}`);
        } finally {
            setGenerating(false);
        }
    }, [startDate, endDate, reportType, fetchReports]); // Depende de los estados y de fetchReports


    // Handler para descargar el reporte generado
    const handleDownloadReport = useCallback(async (reportId, filename) => {
         setDownloading(true);
         setDownloadError(null);

        if (!reportId) {
             setDownloadError("ID de reporte no válido para descargar.");
             setDownloading(false);
            return;
        }

        try {
            console.log(`Intentando descargar reporte con ID: ${reportId} usando incomingReportService.get`);

            // --- Usar el método get del servicio frontend (ya configurado con responseType: 'blob') ---
            const response = await incomingReportService.get(reportId);

            const blob = response.data; // Esto es el Blob

            if (!(blob instanceof Blob)) {
                 console.error("La respuesta no es un Blob:", blob);
                 throw new Error("La respuesta del servidor no es un archivo válido para descargar.");
             }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
             a.style.display = 'none';

            // Usar el nombre de archivo pasado (del reporte generado o de la lista)
            const downloadFilename = filename || `reporte_${reportId}.xlsx`; // Fallback si filename no viene

            a.download = downloadFilename;

            document.body.appendChild(a);
            a.click();

            // --- Limpieza después de un pequeño retraso ---
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                a.remove();
            }, 100);

            console.log(`Descarga iniciada para reporte con ID: ${reportId}`);

        } catch (err) {
            console.error(`Error al descargar reporte con ID ${reportId}:`, err);
            // Mostrar un mensaje de error más amigable
             let userFriendlyMessage = `No se pudo descargar el reporte ${reportId}.`;
             const errorResponse = err.response;
             if (errorResponse) {
                  if (errorResponse.status === 404) {
                     userFriendlyMessage = `El reporte con ID ${reportId} no fue encontrado.`;
                 } else {
                     userFriendlyMessage += ` Error de red: ${errorResponse.status} ${errorResponse.statusText}`;
                 }
             } else {
                  userFriendlyMessage = `Ocurrió un error al intentar descargar el reporte.`;
                  if (err.message) userFriendlyMessage += ` Error: ${err.message}`;
             }

            setDownloadError(userFriendlyMessage);
        } finally {
            setDownloading(false);
        }
    }, []); // Dependencias: []


    return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
            <Paper sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                    Generar y Descargar Reportes
                </Typography>

                {/* Formulario de Generación */}
                <Box sx={{ mb: 4 }}> {/* Añadir margen inferior */}
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <DatePicker
                                label="Fecha Inicio"
                                value={startDate}
                                onChange={handleStartDateChange}
                                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                                format="dd/MM/yyyy"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                             <DatePicker
                                label="Fecha Fin"
                                value={endDate}
                                onChange={handleEndDateChange}
                                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                                format="dd/MM/yyyy"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel id="report-type-label">Tipo de Reporte</InputLabel>
                                <Select
                                    labelId="report-type-label"
                                    id="report-type-select"
                                    value={reportType}
                                    label="Tipo de Reporte"
                                    onChange={handleReportTypeChange}
                                >
                                    <MenuItem value=""><em>Selecciona un tipo</em></MenuItem>
                                    <MenuItem value="laps">Reporte por Vueltas</MenuItem>
                                    <MenuItem value="group">Reporte por Grupo</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                onClick={handleGenerateReport}
                                disabled={generating || !startDate || !endDate || !reportType}
                                fullWidth
                                startIcon={generating ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {generating ? 'Generando...' : 'Generar Reporte'}
                            </Button>
                        </Grid>
                    </Grid>
                    {generationError && <Alert severity="error" sx={{ mt: 2 }}>{generationError}</Alert>}
                </Box>

                <Divider sx={{ my: 3 }} /> {/* Separador */}

                {/* Indicadores de descarga */}
                 {downloadError && <Alert severity="error" sx={{ mb: 2 }}>{downloadError}</Alert>}
                 {downloading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}


                {/* Área para mostrar el reporte generado más recientemente (Opcional, podrías quitarla si la lista general es suficiente) */}
                {generatedReport && (
                    <Box sx={{ mt: 0, mb: 3, p: 2, border: '1px dashed #ccc', borderRadius: '4px' }}>
                         <Typography variant="h6" gutterBottom>Último Reporte Generado:</Typography>
                        <List dense>
                            <ListItem secondaryAction={
                                 <IconButton
                                     edge="end"
                                     aria-label="download latest report"
                                     onClick={() => handleDownloadReport(generatedReport.id, generatedReport.fileName)}
                                     disabled={downloading}
                                 >
                                     <DownloadIcon />
                                 </IconButton>
                            }>
                                <ListItemText
                                     primary={generatedReport.fileName || `Reporte ID: ${generatedReport.id}`}
                                     secondary={`Tipo: ${generatedReport.reportType === 'laps' ? 'Vueltas' : 'Grupo'}, Ingreso Total: $${generatedReport.totalIncome?.toFixed(2) || 'N/A'}`}
                                />
                            </ListItem>
                        </List>
                    </Box>
                )}

                {/* Área para mostrar la lista de todos los reportes existentes */}
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                         Reportes Existentes
                    </Typography>

                    {fetchLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
                    {fetchError && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}

                    {!fetchLoading && !fetchError && reports.length === 0 && (
                        <Typography sx={{ textAlign: 'center', mt: 2 }}>No hay reportes existentes.</Typography>
                    )}

                    {!fetchLoading && !fetchError && reports.length > 0 && (
                        <List>
                            {reports.map(report => (
                                <ListItem
                                    key={report.id} // Usar el ID como key
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label={`download report ${report.id}`}
                                            onClick={() => handleDownloadReport(report.id, report.fileName)} // Llama al handler de descarga
                                            disabled={downloading} // Deshabilita si ya se está descargando otro
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={report.fileName || `Reporte ID: ${report.id}`} // Muestra el nombre del archivo o el ID
                                        secondary={`Tipo: ${report.reportType === 'laps' ? 'Vueltas' : 'Grupo'} | Fecha Generación: ${report.monthYear || 'N/A'} | Ingreso Total: $${report.totalIncome?.toFixed(2) || 'N/A'}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>


            </Paper>
        </Container>
    );
}

export default ReportPage;