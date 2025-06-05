package com.kartingrm.pricing_service.Model;

import com.kartingrm.Pricing_service.Entity.Pricing;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricePersonRequest {
    private Client participant;
    private Pricing pricing;

}
