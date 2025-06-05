package com.kartingrm.specialdays_service.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "specialdays")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialDays {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true,nullable = false)
    private Long id;

    private LocalDate date;
    private String description;

}
