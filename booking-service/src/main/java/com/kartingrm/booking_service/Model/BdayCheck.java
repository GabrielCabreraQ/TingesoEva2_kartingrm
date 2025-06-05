package com.kartingrm.booking_service.Model;

import com.kartingrm.booking_service.Entity.Client;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BdayCheck {
    private Client client;         // ya tienes esta clase, así que la usas
    private LocalDate bookingDate;

}
