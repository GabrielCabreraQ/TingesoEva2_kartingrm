package com.kartingrm.booking_service.Controller;

import com.kartingrm.booking_service.Entity.Booking;
import com.kartingrm.booking_service.Service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/booking")
public class BookingController {
    @Autowired
    BookingService bookingService;

    @GetMapping("/")
    public ResponseEntity<List<Booking>> listBookings() {
        List<Booking> bookings = bookingService.getBookings();
        return ResponseEntity.ok(bookings);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Booking bookingid = bookingService.getBookingById(id);
        return ResponseEntity.ok(bookingid);
    }

    @GetMapping("/month/{month}")
    public ResponseEntity<List<Booking>> listBookingsMonth(@PathVariable String month) {
        List<Booking> bookingsMonth = bookingService.getBookingByMonth(Integer.parseInt(month));
        return ResponseEntity.ok(bookingsMonth);
    }

    @GetMapping("/day/{day}")
    public ResponseEntity<List<Booking>> listBookingsDay(@PathVariable String day) {
        List<Booking> bookingsDay = bookingService.getBookingByDay(Integer.parseInt(day));
        return ResponseEntity.ok(bookingsDay);
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<Booking>> listBookingsYear(@PathVariable String year) {
        List<Booking> bookingsYear = bookingService.getBookingByYear(Integer.parseInt(year));
        return ResponseEntity.ok(bookingsYear);
    }
    @GetMapping("/betweendays/{start}/{end}")
    public List<Booking> getBookingsBetweenDates(
            @PathVariable("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @PathVariable("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        return bookingService.getBookingsBetweenDates(start, end);
    }
    @GetMapping("/date/{year}/{month}/{day}")
    public ResponseEntity<List<Booking>> getBookingsByDate(
            @PathVariable int year,
            @PathVariable int month,
            @PathVariable int day) {

        List<Booking> bookingsDate = bookingService.getBookingsByDate(year, month, day);
        if (bookingsDate.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(bookingsDate);
    }

    @GetMapping("/filter/{laps}/{month}/{year}")
    public List<Booking> getBookingsByLapsAndDate(
            @PathVariable int laps,
            @PathVariable int month,
            @PathVariable int year) {
        return bookingService.getBookingsByLapsAndDate(laps, month, year);
    }

    @PostMapping("/")
    public ResponseEntity<Booking> saveBooking(@RequestBody Booking booking) throws Exception {
        Booking bookingNew = bookingService.saveBooking(booking);
        return ResponseEntity.ok(bookingNew);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long id) {
        try {
            boolean deleted = bookingService.deleteBooking(id);
            if (deleted) {
                return ResponseEntity.ok("Reserva eliminada correctamente");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reserva no encontrada");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar la reserva: " + e.getMessage());
        }
    }
    
    
    @GetMapping("/visit/{clientId}/{month}/{year}")
    public ResponseEntity<Long> getVisitCount(
            @PathVariable("clientId") Long clientId,
            @PathVariable("month") int month,
            @PathVariable("year") int year) {

        long visitCount = bookingService.getVisitCount(clientId, month, year);
        return ResponseEntity.ok(visitCount);
    }

    @PutMapping("/")
    public ResponseEntity<Booking> updateBooking(@RequestBody Booking booking){
        Booking bookingUpdated = bookingService.updateBooking(booking);
        return ResponseEntity.ok(bookingUpdated);
    }

    @GetMapping("/boleta/download/{id}")
    public ResponseEntity<?> downloadBookingExcelFile(@PathVariable Long id) {
        Optional<byte[]> fileContentOptional = bookingService.getBookingExcelFileContent(id);

        if (fileContentOptional.isPresent()) {
            byte[] fileContent = fileContentOptional.get();
            if (fileContent == null || fileContent.length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El archivo Excel para la reserva " + id + " no fue encontrado.");
            }
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "reserva_" + id + ".xlsx"); // Nombre sugerido: reserva_[id].xlsx
            headers.setContentLength(fileContent.length);
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reserva no encontrada con ID: " + id);
        }
    }



}
