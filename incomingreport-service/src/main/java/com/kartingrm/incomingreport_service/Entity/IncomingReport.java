package com.kartingrm.incomingreport_service.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "incomingreport")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class IncomingReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true,nullable = false)
    private Long id;

    private String reportType;
    private String monthYear;
    private String fileName;
    private double totalIncome;

    @Lob
    private byte[] fileContent;
}
