package com.kartingrm.specialdays_service.Service;


import com.kartingrm.specialdays_service.Entity.SpecialDays;
import com.kartingrm.specialdays_service.Repository.SpecialDaysRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SpecialDaysService {

    @Autowired
    SpecialDaysRepository specialDaysRepository;

    public boolean isSpecialDay(LocalDate date) {
        Optional<SpecialDays> specialDay = specialDaysRepository.findByDate(date);
        return specialDay.isPresent();
    }

    public List<SpecialDays> getSpecialDays() {
        return specialDaysRepository.findAll();
    }

    public SpecialDays getSpecialDayById(Long id) {
        return specialDaysRepository.findById(id).get();
    }

    public SpecialDays saveSpecialDay(SpecialDays specialDay) {
        return specialDaysRepository.save(specialDay);
    }

    public SpecialDays updateSpecialDay(SpecialDays specialDay) {
        return specialDaysRepository.save(specialDay);
    }

    public void deleteSpecialDay(Long id) {
        specialDaysRepository.deleteById(id);
    }
}
    

