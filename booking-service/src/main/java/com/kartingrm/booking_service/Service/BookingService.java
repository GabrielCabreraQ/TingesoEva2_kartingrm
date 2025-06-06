package com.kartingrm.booking_service.Service;


import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.kartingrm.booking_service.Entity.Booking;
import com.kartingrm.booking_service.Entity.Client;
import com.kartingrm.booking_service.Model.BdayCheck;
import com.kartingrm.booking_service.Model.BdayPricingRequest;
import com.kartingrm.booking_service.Model.PriceCalculationRequest;
import com.kartingrm.booking_service.Model.Pricing;
import com.kartingrm.booking_service.Repository.BookingRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.*;

@Service
public class BookingService {

    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    ClientService clientService;

    @Autowired
    JavaMailSender javaMailSender;

    @Autowired
    RestTemplate restTemplate;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public ArrayList<Booking> getBookings() {
        return (ArrayList<Booking>) bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).get();
    }

    public List<Booking> getBookingByMonth(int month) {
        return bookingRepository.findByMonth(month);
    }

    public List<Booking> getBookingByDay(int day) {
        return bookingRepository.findByDay(day);
    }

    public List<Booking> getBookingByYear(int year) {
        return bookingRepository.findByYear(year);
    }

    public List<Booking> getBookingsByDate(int year, int month, int day) {
        LocalDate date = LocalDate.of(year, month, day);
        return bookingRepository.findByDate(date);
    }

    @Transactional
    public List<Booking> getBookingsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findBookingsBetweenDates(startDate, endDate);
    }

    public List<Booking> getBookingsByLapsAndDate(int laps, int month, int year) {
        return bookingRepository.findBookingLapsByMY(laps, month, year);
    }

    public Booking updateBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    public boolean deleteBooking(Long id) throws Exception {
        try {
            Optional<Booking> booking = bookingRepository.findById(id);
            if (booking.isPresent()) {
                bookingRepository.delete(booking.get());
                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            throw new Exception("Error al eliminar la reserva: " + e.getMessage());
        }
    }


    @Transactional
    public Booking saveBooking(Booking booking) throws Exception {
        LocalDate bookingDate = booking.getBookingDate();

        if (!isAvailable(booking)) {
            throw new Exception("Horario no disponible.");
        }

        // Validar y agregar al cliente principal (propietario de la reserva)
        Optional<Client> optionalClient = clientService.getClientByRut(booking.getClient().getRut());
        Client ownerClient = optionalClient.orElseGet(() -> clientService.saveClient(booking.getClient()));
        booking.setClient(ownerClient);

        // Validar que el cliente no sea null
        if (booking.getClient() == null) {
            throw new NullPointerException("El cliente principal no se pudo inicializar correctamente.");
        }

        // Validar y agregar los participantes de la reserva
        List<Client> processedParticipants = new ArrayList<>();
        for (Client participant : booking.getParticipants()) {
            if (participant.getRut().equals(ownerClient.getRut())) continue;

            Optional<Client> optionalParticipant = clientService.getClientByRut(participant.getRut());
            Client processed = optionalParticipant.orElseGet(() -> clientService.saveClient(participant));
            processedParticipants.add(processed);
        }
        processedParticipants.add(ownerClient);
        booking.setParticipants(processedParticipants);


        Pricing pricing = getLastPricing();
        int groupSize = booking.getGroupSize();
        int numberLap = booking.getNumberLap();
        int participantCount = booking.getParticipants().size();
        double totalPrice = 0;

        if (groupSize != participantCount) {
            // Lanzar una excepción o mostrar un warning si no hay concordancia
            throw new Exception("Advertencia: La cantidad de participantes no coincide con el tamaño del grupo. " +
                    "Se esperaba " + groupSize + " participantes, pero se encontraron " + participantCount + ".");
        }

        int birthdayLimit = birthDayLimitDiscount(groupSize);
        List<Client> birthdayClients = new ArrayList<>();
        List<Client> nonBirthdayClients = new ArrayList<>();

        for (Client participant : booking.getParticipants()) {
            if (isBirthday(participant, booking.getBookingDate())) {
                birthdayClients.add(participant);
            } else {
                nonBirthdayClients.add(participant);
            }
        }

        totalPrice += calculateTotalPriceForBirthdayClients(birthdayClients, numberLap, groupSize, birthdayLimit, bookingDate, pricing);

        for (Client participant : nonBirthdayClients) {
            double individualPrice = calculatePricePerPerson(participant, bookingDate, groupSize, numberLap, pricing, 0);
            totalPrice += individualPrice;
        }

        booking.setFinalPrice(totalPrice);
        Booking savedBooking = bookingRepository.save(booking);

        // Generar el Excel con el desglose de pago
        byte[] excelData = generatePaymentReceiptExcel(savedBooking); // Renombrado para mayor claridad

        // --- Asignar el byte[] al atributo de la entidad ---
        savedBooking.setExcelFileContent(excelData);

        // Guardar el Excel como archivo temporal
        Path tempExcelPath = Files.createTempFile("reserva_" + savedBooking.getId(), ".xlsx");
        Files.write(tempExcelPath, excelData);

        byte[] pdfData = convertExcelToPdf(tempExcelPath);
        // Eliminar el archivo Excel temporal, ya no es necesario
        Files.delete(tempExcelPath);
        // Obtener los correos de los participantes
        List<String> correos = getEmailsFromBooking(savedBooking);
        // Enviar el correo con el PDF adjunto{
        sendEmailWithAttachment(correos, "Comprobante de Pago", "Adjunto encontrará el comprobante de pago de su reserva.", pdfData, "Comprobante_de_Pago_" + savedBooking.getId() + ".pdf");

        return bookingRepository.save(booking);
    }

    public byte[] generatePaymentReceiptExcel(Booking booking) throws IOException {
        // Crear el libro de trabajo de Excel
        XSSFWorkbook workbook = new XSSFWorkbook();

        // Crear la hoja de trabajo
        Sheet sheet = workbook.createSheet("Comprobante de Pago");

        // Crear la fila de encabezado para la información de la reserva
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Código de la Reserva");
        headerRow.createCell(1).setCellValue(booking.getId());  // Suponiendo que tienes un campo `bookingCode`

        // Crear la fila para la fecha y hora de la reserva
        Row dateRow = sheet.createRow(1);
        dateRow.createCell(0).setCellValue("Fecha y Hora de la Reserva");

        // Combinar fecha y hora
        LocalDateTime dateTime = LocalDateTime.of(booking.getBookingDate(), booking.getStartTime());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"); // Ajusta el patrón según necesites
        dateRow.createCell(1).setCellValue(dateTime.format(formatter));

        Row lapsRow = sheet.createRow(2);
        lapsRow.createCell(0).setCellValue("Número de Vueltas");
        lapsRow.createCell(1).setCellValue(booking.getNumberLap());  // O el tiempo máximo reservado

        Row participantsRow = sheet.createRow(3);
        participantsRow.createCell(0).setCellValue("Cantidad de Personas");
        participantsRow.createCell(1).setCellValue(booking.getParticipants().size());

        Row ownerRow = sheet.createRow(4);
        ownerRow.createCell(0).setCellValue("Nombre de la Persona que Hizo la Reserva");
        ownerRow.createCell(1).setCellValue(booking.getClient().getName());  // Suponiendo que tienes un `getName` en `ClientEntity`


        // Encabezado de la tabla de detalles de pago
        Row paymentHeaderRow = sheet.createRow(5);
        paymentHeaderRow.createCell(0).setCellValue("Nombre de Cliente");
        paymentHeaderRow.createCell(1).setCellValue("Tarifa Base");
        paymentHeaderRow.createCell(2).setCellValue("Descuento por Tamaño de Grupo");
        paymentHeaderRow.createCell(3).setCellValue("Descuento por Promociones Especiales");
        paymentHeaderRow.createCell(4).setCellValue("Descuento maximo");
        paymentHeaderRow.createCell(5).setCellValue("Monto Final");
        paymentHeaderRow.createCell(6).setCellValue("Valor del IVA");
        paymentHeaderRow.createCell(7).setCellValue("Monto Total (con IVA)");

        Pricing pricing = getLastPricing();
        int groupSize = booking.getGroupSize();
        int numberLap = booking.getNumberLap();
        LocalDate bookingDate = booking.getBookingDate();
        int birthdayLimit = birthDayLimitDiscount(groupSize);

        List<Client> birthdayClients = new ArrayList<>();
        List<Client> nonBirthdayClients = new ArrayList<>();

        for (Client participant : booking.getParticipants()) {
            if (isBirthday(participant, bookingDate)) {
                birthdayClients.add(participant);
            } else {
                nonBirthdayClients.add(participant);
            }
        }

        // Ordenar cumpleañeros por quien tiene menos descuento base
        List<Client> sortedBirthdayClients = birthdayClients.stream()
                .sorted(Comparator.comparingDouble(client ->
                        Math.max(
                                calculateGroupDiscount(groupSize),
                                calculateFrequencyDiscount(client, bookingDate)
                        )
                ))
                .toList();

        int birthdayCount = 0;
        int rowIndex = 6;

        // Procesar cumpleañeros
        for (Client client : sortedBirthdayClients) {
            boolean applyBirthday = birthdayCount++ < birthdayLimit;
            rowIndex = writeParticipantRow(sheet, rowIndex, client, bookingDate, groupSize, numberLap, pricing, applyBirthday);
        }

        // Procesar resto
        for (Client client : nonBirthdayClients) {
            rowIndex = writeParticipantRow(sheet, rowIndex, client, bookingDate, groupSize, numberLap, pricing, false);
        }

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();
        return bos.toByteArray();
    }

    public byte[] convertExcelToPdf(Path tempExcelPath) throws IOException, DocumentException {
        try (FileInputStream fis = new FileInputStream(tempExcelPath.toFile());
             Workbook workbook = new XSSFWorkbook(fis)) {

            // Usamos ByteArrayOutputStream en lugar de un archivo físico
            ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();

            // Configuración del documento PDF
            Document document = new Document(PageSize.A4.rotate()); // más espacio horizontal
            PdfWriter.getInstance(document, pdfOut);
            document.open();

            // Obtener la hoja de Excel
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet.getPhysicalNumberOfRows() == 0) return new byte[0]; // Si no hay filas, retornar vacío

            // Encontrar el número máximo de columnas
            int maxColumns = 0;
            for (Row row : sheet) {
                if (row.getLastCellNum() > maxColumns) {
                    maxColumns = row.getLastCellNum();
                }
            }

            // Crear tabla en el PDF
            PdfPTable table = new PdfPTable(maxColumns);
            table.setWidthPercentage(100);

            // Llenar la tabla con los datos del Excel
            for (Row row : sheet) {
                for (int col = 0; col < maxColumns; col++) {
                    Cell cell = row.getCell(col, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    String text = cell.toString();

                    PdfPCell pdfCell = new PdfPCell(new Phrase(text));
                    pdfCell.setPadding(5);
                    pdfCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    pdfCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    pdfCell.setBorderWidth(1f);

                    table.addCell(pdfCell);
                }
            }
            document.add(table);
            document.close();

            return pdfOut.toByteArray();
        }
    }

    public int writeParticipantRow(Sheet sheet, int rowIndex, Client client, LocalDate bookingDate, int groupSize, int numberLap, Pricing pricing, boolean applyBirthday) {
        double basePrice = getBasePriceForLaps(numberLap);
        if (isSpecialDay(bookingDate)) {
            basePrice += basePrice * pricing.getHolydayRise();
        }
        if (isWeekend(bookingDate)) {
            basePrice += basePrice * pricing.getWeekendRise();
        }

        double groupDiscount = calculateGroupDiscount(groupSize);
        double freqDiscount = calculateFrequencyDiscount(client, bookingDate);
        double birthdayDiscount = applyBirthday ? calculateBirthdayDiscount(client, bookingDate) : 0;
        double maxDiscount = Math.max(groupDiscount, Math.max(freqDiscount, birthdayDiscount));
        double maxEsp = Math.max(freqDiscount, birthdayDiscount);
        double finalPrice = Math.round(basePrice * (1 - maxDiscount));
        double iva = Math.round(finalPrice * getLastPricing().getIva());
        double total = finalPrice + iva;

        Row row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue(client.getName());
        row.createCell(1).setCellValue(basePrice);
        row.createCell(2).setCellValue(groupDiscount * 100 + "%");
        row.createCell(3).setCellValue(maxEsp * 100 + "%");
        row.createCell(4).setCellValue(maxDiscount * 100 + "%");
        row.createCell(5).setCellValue(finalPrice);
        row.createCell(6).setCellValue(iva);
        row.createCell(7).setCellValue(total);

        return rowIndex;
    }

    public List<String> getEmailsFromBooking(Booking booking) {
        // Obtener los correos electrónicos de los participantes (asume que Booking tiene los participantes)
        List<String> emails = new ArrayList<>();
        for (Client client : booking.getParticipants()) {
            emails.add(client.getEmail());
        }
        return emails;
    }

    @Transactional
    public Optional<byte[]> getBookingExcelFileContent(Long bookingId) {
        Optional<Booking> bookingOptional = bookingRepository.findById(bookingId); // Recupera la entidad por ID

        if (bookingOptional.isPresent()) {
            Booking booking = bookingOptional.get();
            return Optional.ofNullable(booking.getExcelFileContent()); // Devuelve el byte[] si existe
        } else {
            return Optional.empty();
        }
    }

    public void sendEmailWithAttachment(List<String> toList, String subject, String text, byte[] attachmentData, String attachmentName) {
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            message.setSubject(subject);
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(toList.toArray(new String[0])); // Aquí el cambio clave
            helper.setText(text);
            helper.addAttachment(attachmentName, new ByteArrayDataSource(attachmentData, "application/pdf"));
            javaMailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    public void saveExcelToDesktop(byte[] excelPath, Booking savedBooking) throws IOException {
        // Obtener la ruta del escritorio
        String userProfile = System.getProperty("user.name");  // Obtiene el nombre del usuario
        Path desktopPath = Paths.get("C:\\Users\\" + userProfile + "\\Desktop", "reserva_" + savedBooking.getId() + ".xlsx");

        // Guardar el archivo en el escritorio
        Files.write(desktopPath, excelPath);
    }

    public boolean isOverlapping(LocalTime newStart, LocalTime newEnd, LocalTime existingStart, LocalTime existingEnd) {
        return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
    }
    
    @Transactional
    public boolean isAvailable(Booking booking) {
        List<Booking> bookings = bookingRepository.findByDate(booking.getBookingDate());

        LocalTime endTime = calculateEndTime(booking.getStartTime(), booking.getNumberLap());

        LocalTime[] availableHours = getAvailableHours(booking.getBookingDate());

        if (booking.getStartTime().isBefore(availableHours[0]) || endTime.isAfter(availableHours[1])) {
            return false;
        }

        return bookings.stream()
                .noneMatch(existingBooking -> {
                    LocalTime existingStart = existingBooking.getStartTime();
                    LocalTime existingEnd = calculateEndTime(existingStart, existingBooking.getNumberLap());
                    return isOverlapping(booking.getStartTime(), endTime, existingStart, existingEnd);
                });

    }


    public long getVisitCount(Long clientId, int month, int year) {
        return bookingRepository.countVisitsInMonthAndYear(clientId, month, year);
    }


    public int birthDayLimitDiscount(int groupSize) {
        if (groupSize >= 3 && groupSize <= 5) {
            return 1;
        } else if (groupSize >= 6 && groupSize <= 10) {
            return 2;
        }
        return 0;
    }


//========================= REST TEMPLATE =============================//


    public boolean isBirthday(Client client, LocalDate bookingDate) {
        String url = "http://Pricing-service/api/pricing/is-bday";

        BdayCheck request = new BdayCheck(client, bookingDate);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<BdayCheck> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Boolean> response = restTemplate.postForEntity(url, entity, Boolean.class);

        return Boolean.TRUE.equals(response.getBody());
    }

    public Pricing getLastPricing() {
        String url = "http://Pricing-service/api/pricing/last";
        return restTemplate.getForObject(url, Pricing.class);
    }

    public LocalTime calculateEndTime(LocalTime startTime, int laps) {
        String url = "http://pricing-service/api/pricing/endtime?startTime=" + startTime + "&laps=" + laps;
        return restTemplate.getForObject(url, LocalTime.class);
    }

    public LocalTime[] getAvailableHours(LocalDate bookingDate) {
        String url = "http://Track-service/api/track/available-hours?date=" + bookingDate;
        return restTemplate.getForObject(url, LocalTime[].class);
    }

    public double calculateTotalPriceForBirthdayClients(List<Client> birthdayClients, int numberLap, int groupSize, int birthdayLimit, LocalDate bookingDate, Pricing pricing) {
        String url = "http://Pricing-service/api/pricing/calculate-birthday-total";

        BdayPricingRequest request = new BdayPricingRequest(
                birthdayClients,
                numberLap,
                groupSize,
                birthdayLimit,
                bookingDate,
                pricing
        );

        return restTemplate.postForObject(url, request, Double.class);
    }

    public double calculatePricePerPerson(Client participant, LocalDate bookingDate, int groupSize, int numberLap, Pricing pricing, int applyBirthday) {
        String url = "http://pricing-service:8080/api/pricing/calculate-price";

        PriceCalculationRequest request = new PriceCalculationRequest(
                participant,
                bookingDate,
                groupSize,
                numberLap,
                pricing,
                applyBirthday
        );

        HttpEntity<PriceCalculationRequest> requestEntity = new HttpEntity<>(request);
        return restTemplate.exchange(url, HttpMethod.POST, requestEntity, Double.class).getBody();
    }

    public double calculateGroupDiscount(int groupsize) {
        String url = "http://GroupDiscount-service/api/calculate" + "/" + groupsize;
        return restTemplate.getForObject(url, Double.class);

    }

    public double calculateFrequencyDiscount(Client participant, LocalDate bookingDate) {
        String url = "http://pricing-service/api/frequencydiscount/calculate";

        Map<String, Object> body = Map.of(
                "participant", participant,
                "bookingDate", bookingDate
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Double> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                Double.class
        );

        return response.getBody();
    }
    public double getBasePriceForLaps(int numberLap) {
        String url = UriComponentsBuilder.fromHttpUrl("http://Pricing-service/api/pricing/base-price/{numberLap}")
                .buildAndExpand(numberLap)
                .toUriString();

        return restTemplate.exchange(url, HttpMethod.GET, null, Double.class).getBody();
    }

    public boolean isSpecialDay(LocalDate date) {
        String url = "http://SpecialDays-service/api/specialdays/isSpecial/{date}";
        return restTemplate.getForObject(url, Boolean.class, date);
    }

    public boolean isWeekend(LocalDate date) {
        String url = "http://Track-service/api/track/isWeekend/{date}";
        return restTemplate.getForObject(url, Boolean.class, date);
    }
    public double calculateBirthdayDiscount(Client participant, LocalDate bookingDate) {
        String url = UriComponentsBuilder.fromHttpUrl("http://Pricing-service/api/pricing/calculate-bdaydiscount")
                .queryParam("bookingDate", bookingDate.toString())
                .toUriString();

        HttpEntity<Client> requestEntity = new HttpEntity<>(participant);
        return restTemplate.exchange(url, HttpMethod.POST, requestEntity, Double.class).getBody();
    }
}
