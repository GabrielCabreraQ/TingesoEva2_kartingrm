package com.kartingrm.frequencydiscount_service.Service;


import com.kartingrm.frequencydiscount_service.Entity.FrequencyDiscount;
import com.kartingrm.frequencydiscount_service.Model.Client;
import com.kartingrm.frequencydiscount_service.Model.Pricing;
import com.kartingrm.frequencydiscount_service.Repository.FrequencyDiscountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;

@Service
public class FrequencyDiscountService {

    @Autowired
    FrequencyDiscountRepository frequencyDiscountRepository;

    @Autowired
    RestTemplate restTemplate;


    public Pricing getLastPricing() {
        String url = "http://Pricing-service/api/pricing/last";
        return restTemplate.getForObject(url, Pricing.class);
    }


    public FrequencyDiscount getFrequencyDiscount() {
        return frequencyDiscountRepository.findTopByOrderByIdDesc();
    }

    public double calculateFrequencyDiscount(Client participant, LocalDate bookingDate) {
        int month = bookingDate.getMonthValue();
        int year = bookingDate.getYear();
        long monthlyVisits = getVisitCount(participant.getId(), month, year);

        double discount = 0;
        if (monthlyVisits >= 2 && monthlyVisits <= 4) discount = getLastPricing().getDiscountRegular();
        else if (monthlyVisits >= 5 && monthlyVisits <= 6) discount = getLastPricing().getDiscountFrequent();
        else if (monthlyVisits >= 7) discount = getLastPricing().getDiscountVeryFrequent();
        return discount;
    }



    //================== REST TEMPLATE METHODS ==========================//

    public long getVisitCount(Long clientId, int month, int year) {
        String url = "http://booking-service/api/booking/visit/" + clientId + "/" + month + "/" + year;
        return restTemplate.getForObject(url, Long.class);


    }


}
