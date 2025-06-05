package com.kartingrm.groupdiscount_service.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "groupdiscount")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDiscount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

}
