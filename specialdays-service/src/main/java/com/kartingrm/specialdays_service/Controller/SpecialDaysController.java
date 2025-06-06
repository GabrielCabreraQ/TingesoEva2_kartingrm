package com.kartingrm.specialdays_service.Controller;


import com.kartingrm.specialdays_service.Entity.SpecialDays;
import com.kartingrm.specialdays_service.Service.SpecialDaysService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/specialdays")
@CrossOrigin("*")
public class SpecialDaysController {
    @Autowired
    private SpecialDaysService specialDaysService;

    @GetMapping("/")
    public ResponseEntity<List<SpecialDays>> getAllSpecialDays() {
        List<SpecialDays> specialDays = specialDaysService.getSpecialDays();
        return ResponseEntity.ok(specialDays);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpecialDays> getSpecialDayById(@PathVariable Long id) {
        SpecialDays specialDay = specialDaysService.getSpecialDayById(id);
        return ResponseEntity.ok(specialDay);
    }

    @PostMapping("/")
    public ResponseEntity<SpecialDays> saveSpecialDay(@RequestBody SpecialDays specialDay) {
        SpecialDays savedSpecialDay = specialDaysService.saveSpecialDay(specialDay);
        return ResponseEntity.ok(savedSpecialDay);
    }

    @PutMapping("/")
    public ResponseEntity<SpecialDays> updateSpecialDay(@RequestBody SpecialDays specialDay) {
        SpecialDays updatedSpecialDay = specialDaysService.updateSpecialDay(specialDay);
        return ResponseEntity.ok(updatedSpecialDay);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpecialDay(@PathVariable Long id) throws Exception {
        specialDaysService.deleteSpecialDay(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/isSpecial/{date}")
    public ResponseEntity<Boolean> isSpecialDay(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        boolean result = specialDaysService.isSpecialDay(date);
        return ResponseEntity.ok(result);
    }

}

