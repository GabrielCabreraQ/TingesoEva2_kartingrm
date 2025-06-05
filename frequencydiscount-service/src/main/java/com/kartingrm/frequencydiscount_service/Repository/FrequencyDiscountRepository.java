package com.kartingrm.frequencydiscount_service.Repository;

import com.kartingrm.frequencydiscount_service.Entity.FrequencyDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FrequencyDiscountRepository extends JpaRepository<FrequencyDiscount, Long> {

    FrequencyDiscount findTopByOrderByIdDesc();

}
