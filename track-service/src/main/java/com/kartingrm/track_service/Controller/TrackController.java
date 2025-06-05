package com.kartingrm.track_service.Controller;


import com.kartingrm.track_service.Service.TrackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/track")
@CrossOrigin("*")
public class TrackController {

    @Autowired
    private TrackService trackService;

    @GetMapping("/available-hours")
    public ResponseEntity<LocalTime[]> getAvailableHours(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate) {
        LocalTime[] availableHours = trackService.getAvailableHours(bookingDate);
        return ResponseEntity.ok(availableHours);
    }

    @GetMapping("/isWeekend/{date}")
    public ResponseEntity<Boolean> isWeekend(@PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        boolean result = trackService.isWeekend(date);
        return ResponseEntity.ok(result);
    }
}