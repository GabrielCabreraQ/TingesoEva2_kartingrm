package com.kartingrm.groupdiscount_service.Repository;

import com.kartingrm.groupdiscount_service.Entity.GroupDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupDiscountRepository extends JpaRepository<GroupDiscount, Long> {

    GroupDiscount findTopByOrderByIdDesc();

}
