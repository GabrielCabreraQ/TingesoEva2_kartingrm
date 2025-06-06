package com.kartingrm.pricing_service.Controller;



import com.kartingrm.pricing_service.Entity.Pricing;
import com.kartingrm.pricing_service.Model.BdayPricingRequest;
import com.kartingrm.pricing_service.Model.BirthdayCheckRequest;
import com.kartingrm.pricing_service.Model.Client;
import com.kartingrm.pricing_service.Model.PricePersonRequest;
import com.kartingrm.pricing_service.Service.PricingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {

    @Autowired
    private PricingService pricingService;

    @GetMapping("/")
    public ResponseEntity<List<Pricing>> getAllPricing() {
        return ResponseEntity.ok(pricingService.getAllPricing());
    }

    @GetMapping("/last")
    public ResponseEntity<Pricing> getLastPricing() {
        return ResponseEntity.ok(pricingService.getLastPricing());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pricing> getPricingById(@PathVariable Long id) {
        return ResponseEntity.ok(pricingService.getPricingById(id));
    }

    @PostMapping("/")
    public ResponseEntity<Pricing> savePricing(@RequestBody Pricing pricing) {
        return ResponseEntity.ok(pricingService.savePricing(pricing));
    }

    @PutMapping("/")
    public ResponseEntity<Pricing> updatePricing(@RequestBody Pricing pricing) {
        return ResponseEntity.ok(pricingService.updatePricing(pricing));
    }


    @PostMapping("/is-bday")
    public ResponseEntity<Boolean> isBirthDay(@RequestBody BirthdayCheckRequest request) {
        boolean result = pricingService.isBirthDay(request.getClient(), request.getBookingDate());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/bday-discount")
    public ResponseEntity<Double> calculateBirthdayDiscount(@RequestBody BirthdayCheckRequest request) {
        double discount = pricingService.calculateBirthdayDiscount(request.getClient(), request.getBookingDate());
        return ResponseEntity.ok(discount);
    }

    @GetMapping("/base-price/{numberLap}")
    public double getBasePriceForLaps(@PathVariable int numberLap) {
        return pricingService.getBasePriceForLaps(numberLap);
    }

    @PostMapping("/calculate-daydiscount")
    public double calculateBirthdayDiscount(
            @RequestBody Client participant,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate) {
        return pricingService.calculateBirthdayDiscount(participant, bookingDate);
    }

    @PostMapping("/calculate-price")
    public double calculatePricePerPerson(
            @RequestBody PricePersonRequest request) { // <-- Only expect the request body DTO
        return pricingService.calculatePricePerPerson(
                request.getParticipant(),
                request.getBookingDate(),   // Get these from the request body DTO
                request.getGroupSize(),     // Get these from the request body DTO
                request.getNumberLap(),     // Get these from the request body DTO
                request.getPricing(),       // Get these from the request body DTO
                request.getApplyBirthday());// Get these from the request body DTO
    }

    @PostMapping("/calculate-birthday-total")
    public double calculateTotalPriceForBirthdayClients(@RequestBody BdayPricingRequest request) {
        return pricingService.calculateTotalPriceForBirthdayClients(
                request.getBirthdayClients(),
                request.getNumberLap(),
                request.getGroupSize(),
                request.getBirthdayLimit(),
                request.getBookingDate(),
                request.getPricing());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePricing(@PathVariable Long id) {
        pricingService.deletePricing(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/endtime")
    public LocalTime calculateEndTime(@RequestParam LocalTime startTime, @RequestParam int laps) {
        return pricingService.calculateEndTime(startTime, laps);
    }




}