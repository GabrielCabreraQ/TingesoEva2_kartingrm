package com.kartingrm.groupdiscount_service.Service;


import com.kartingrm.groupdiscount_service.Entity.GroupDiscount;
import com.kartingrm.groupdiscount_service.Model.Pricing;
import com.kartingrm.groupdiscount_service.Repository.GroupDiscountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GroupDiscountService {
    @Autowired
    GroupDiscountRepository groupDiscountRepository;

    @Autowired
    RestTemplate restTemplate;

    public Pricing getLastPricing() {
        String url = "http://Pricing-service/api/pricing/last";
        return restTemplate.getForObject(url, Pricing.class);
    }

    public GroupDiscount getGroupDiscount() {
        return groupDiscountRepository.findTopByOrderByIdDesc();
    }

    public double calculateGroupDiscount(int groupSize) {

        double discount = 0;
        if (groupSize >= 3 && groupSize <= 5) discount = getLastPricing().getDiscount3To5People();
        else if (groupSize >= 6 && groupSize <= 10) discount = getLastPricing().getDiscount6To10People();
        else if (groupSize >= 11 && groupSize <= 15) discount = getLastPricing().getDiscount11To15People();
        return discount;
    }

}
