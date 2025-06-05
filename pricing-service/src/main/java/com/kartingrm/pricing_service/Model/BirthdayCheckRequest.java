package com.kartingrm.pricing_service.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BirthdayCheckRequest {
    private Client client;
    private LocalDate bookingDate;
}