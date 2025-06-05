package com.kartingrm.track_service.Model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialDays {

    private LocalDate date;
    private String description;

}
