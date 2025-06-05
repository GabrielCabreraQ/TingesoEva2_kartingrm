package com.kartingrm.booking_service.Model;

import com.kartingrm.booking_service.Entity.Client;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PriceCalculationRequest {

    private Client participant;
    private LocalDate bookingDate;
    private int groupSize;
    private int numberLap;
    private Pricing pricing;
    private int applyBirthday;
}
