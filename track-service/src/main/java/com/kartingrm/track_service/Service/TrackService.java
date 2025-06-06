package com.kartingrm.track_service.Service;

import com.kartingrm.track_service.Repository.TrackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class TrackService {

    @Autowired
    TrackRepository trackRepository;

    @Autowired
    RestTemplate restTemplate;

    public boolean isSpecialDay(LocalDate date) {
        String url = "http://specialdays-service/api/specialdays/isSpecial?date=" + date.toString();
        return restTemplate.getForObject(url, Boolean.class);
    }

    public boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }

    public LocalTime[] getAvailableHours(LocalDate bookingDate) {
        if (isSpecialDay(bookingDate)) {
            // Si es un día especial, el horario es de 10:00 a 22:00
            return new LocalTime[]{LocalTime.of(10, 0), LocalTime.of(22, 0)};
        } else if (isWeekend(bookingDate)) {
            // Si es fin de semana, el horario es de 10:00 a 22:00 (igual a días especiales)
            return new LocalTime[]{LocalTime.of(10, 0), LocalTime.of(22, 0)};
        } else {
            // Si no es un día especial ni fin de semana, el horario es de 14:00 a 22:00
            return new LocalTime[]{LocalTime.of(14, 0), LocalTime.of(22, 0)};
        }
    }



}



