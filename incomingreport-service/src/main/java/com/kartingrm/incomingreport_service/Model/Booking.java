package com.kartingrm.incomingreport_service.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    private Long id;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private int groupSize;
    private int numberLap;
    private double finalPrice;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToMany
    @JoinTable(
            name = "booking_client",
            joinColumns = @JoinColumn(name = "booking_id"),
            inverseJoinColumns = @JoinColumn(name = "client_id")
    )
    private List<Client> participants;

    @Lob // Indica que es un Large Object (objeto grande)
    private byte[] excelFileContent;

}


