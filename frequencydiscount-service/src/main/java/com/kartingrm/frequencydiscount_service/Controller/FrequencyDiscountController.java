package com.kartingrm.frequencydiscount_service.Controller;


import com.kartingrm.frequencydiscount_service.Entity.FrequencyDiscount;
import com.kartingrm.frequencydiscount_service.Model.FrequencyRequest;
import com.kartingrm.frequencydiscount_service.Service.FrequencyDiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/frequencydiscount")
public class FrequencyDiscountController {
    @Autowired
    FrequencyDiscountService frequencyDiscountService;
    
    @GetMapping("/")
    public ResponseEntity<FrequencyDiscount> getFrequencyDiscount() {
        return ResponseEntity.ok(frequencyDiscountService.getFrequencyDiscount());
    }

    @PostMapping("/calculate")
    public ResponseEntity<Double> calculateFrequencyDiscount(@RequestBody FrequencyRequest request) {
        double discount = frequencyDiscountService.calculateFrequencyDiscount(
                request.getParticipant(),
                request.getBookingDate()
        );
        return ResponseEntity.ok(discount);
    }

}



