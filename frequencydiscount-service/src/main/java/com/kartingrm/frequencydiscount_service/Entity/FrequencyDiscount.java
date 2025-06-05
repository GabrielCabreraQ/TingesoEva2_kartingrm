package com.kartingrm.frequencydiscount_service.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "frequencydiscount")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FrequencyDiscount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}



