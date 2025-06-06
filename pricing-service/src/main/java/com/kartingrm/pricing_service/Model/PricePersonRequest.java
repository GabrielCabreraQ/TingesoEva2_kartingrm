package com.kartingrm.pricing_service.Model;

import com.kartingrm.pricing_service.Entity.Pricing;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricePersonRequest { // Or whatever name you have it
    private Client participant;
    private LocalDate bookingDate;
    private int groupSize;
    private int numberLap;
    private Pricing pricing;
    private int applyBirthday;

}
