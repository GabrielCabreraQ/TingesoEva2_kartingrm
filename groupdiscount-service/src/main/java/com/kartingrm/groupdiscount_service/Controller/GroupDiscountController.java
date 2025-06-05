package com.kartingrm.groupdiscount_service.Controller;


import com.kartingrm.groupdiscount_service.Entity.GroupDiscount;
import com.kartingrm.groupdiscount_service.Service.GroupDiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groupdiscount")
@CrossOrigin("*")
public class GroupDiscountController {

    @Autowired
    GroupDiscountService groupDiscountService;

    @GetMapping("/")
    public ResponseEntity<GroupDiscount> getGroupDiscount() {
        return ResponseEntity.ok(groupDiscountService.getGroupDiscount());
    }

    @GetMapping("/calculate/{groupSize}")
    public ResponseEntity<Double> calculateGroupDiscount(
            @PathVariable("groupSize") int groupSize) {

        double discount = groupDiscountService.calculateGroupDiscount(groupSize);
        return ResponseEntity.ok(discount);
    }

}
