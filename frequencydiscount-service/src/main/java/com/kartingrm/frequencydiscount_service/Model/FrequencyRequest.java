package com.kartingrm.frequencydiscount_service.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FrequencyRequest {
     private Client participant;
     private LocalDate bookingDate;

}
