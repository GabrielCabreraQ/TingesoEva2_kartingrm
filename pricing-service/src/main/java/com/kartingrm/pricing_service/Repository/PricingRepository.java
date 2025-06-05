package com.kartingrm.pricing_service.Repository;

import com.kartingrm.pricing_service.Entity.Pricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PricingRepository extends JpaRepository<Pricing, Long> {

    Pricing findTopByOrderByIdDesc();


}
