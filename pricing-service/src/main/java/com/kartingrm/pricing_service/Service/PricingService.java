package com.kartingrm.pricing_service.Service;

import com.kartingrm.pricing_service.Entity.Pricing;
import com.kartingrm.pricing_service.Model.Client;
import com.kartingrm.pricing_service.Repository.PricingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PricingService {

    @Autowired
    PricingRepository pricingRepository;

    @Autowired
    RestTemplate restTemplate;

    public Pricing getLastPricing() {
        return pricingRepository.findTopByOrderByIdDesc();
    }

    public double getBasePriceForLaps(int numberLap) {
        if (numberLap == 10) return getLastPricing().getPrice10Laps();
        else if (numberLap == 15) return getLastPricing().getPrice15Laps();
        else if (numberLap == 20) return getLastPricing().getPrice20Laps();
        else return 0;

    }

    public List<Pricing> getAllPricing() {
        return pricingRepository.findAll();
    }

    public Pricing getPricingById(Long id) {
        return pricingRepository.findById(id).get();
    }

    public Pricing savePricing(Pricing pricing) {
        return pricingRepository.save(pricing);
    }

    public Pricing updatePricing(Pricing pricing) {
        return pricingRepository.save(pricing);
    }

    public void deletePricing(Long id) {
        pricingRepository.deleteById(id);
    }


    public LocalTime calculateEndTime(LocalTime startTime, int laps) {
        int duration = switch (laps) {
            case 10 -> 30;
            case 15 -> 35;
            case 20 -> 40;
            default -> 0;
        };
        return startTime.plusMinutes(duration);
    }


    public boolean isBirthDay(Client client, LocalDate bookingDate) {
        return client.getBirthDate().getDayOfMonth() == bookingDate.getDayOfMonth()
                && client.getBirthDate().getMonthValue() == bookingDate.getMonthValue();
    }

    public double calculateBirthdayDiscount(Client participant, LocalDate bookingDate) {

        boolean isBirthday = isBirthDay(participant,bookingDate);
        if (isBirthday) {
            return getLastPricing().getBirthdayDiscount();
        } else {
            return 0;
        }
    }


    public double calculateTotalPriceForBirthdayClients(List<Client> birthdayClients, int numberLap, int groupSize, int birthdayLimit, LocalDate bookingDate, Pricing pricing) {
        double total = 0;

        List<Client> sortedBirthdayClients = birthdayClients.stream()
                .sorted(Comparator.comparingDouble(client -> {
                    double basePrice = getBasePriceForLaps(numberLap);
                    double groupDiscount = calculateGroupDiscount(groupSize);
                    double freqDiscount = calculateFrequencyDiscount(client, bookingDate);
                    return Math.max(groupDiscount, freqDiscount);
                }))
                .collect(Collectors.toList());

        for (int i = 0; i < sortedBirthdayClients.size(); i++) {
            Client participant = sortedBirthdayClients.get(i);
            boolean applyBirthdayDiscount = i < birthdayLimit;

            double individualPrice = calculatePricePerPerson(
                    participant,
                    bookingDate,
                    groupSize,
                    numberLap,
                    pricing,
                    applyBirthdayDiscount ? 1 : 0
            );

            total += individualPrice;
        }

        return total;
    }

    public double calculatePricePerPerson(Client participant, LocalDate bookingDate, int groupSize, int numberLap, Pricing pricing, int applyBirthday) {
        double basePrice = getBasePriceForLaps(numberLap);
        if (isSpecialDay(bookingDate)) {
            basePrice = basePrice + basePrice*pricing.getHolydayRise();  // Aumento en el precio base por día especial
        }
        if (isWeekend(bookingDate)) {
            basePrice = basePrice + basePrice*pricing.getWeekendRise();
        }

        double groupDiscount = calculateGroupDiscount(groupSize);
        double freqDiscount = calculateFrequencyDiscount(participant, bookingDate);
        double birthdayDiscount = (applyBirthday > 0) ? calculateBirthdayDiscount(participant, bookingDate) : 0;

        //double weekendDiscount = (specialDayService.isWeekend(bookingDate)) ? calculateWeekendDiscound(pricing) : 0;
        //double specialDayDiscount = (specialDayService.isSpecialDay(bookingDate)) ? calculateSpecialDayDiscount(pricing) : 0;

        double maxDiscount = Math.max(groupDiscount, Math.max(freqDiscount,birthdayDiscount));
        double finalPrice = Math.round(basePrice * (1 - maxDiscount));
        double iva = Math.round(finalPrice * getLastPricing().getIva());

        return Math.round(finalPrice+iva);


    }




    //============== REST TEMPLATE METHODS ============== //

    public double calculateGroupDiscount(int groupsize) {
        String url = "http://groupdiscount-service/api/groupdiscount/calculate" + "/" + groupsize;
        return restTemplate.getForObject(url, Double.class);


    }

    public double calculateFrequencyDiscount(Client participant, LocalDate bookingDate) {
        String url = "http://frequencydiscount-service/api/frequencydiscount/calculate";

        Map<String, Object> body = Map.of(
                "participant", participant,
                "bookingDate", bookingDate
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Double> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                Double.class
        );

        return response.getBody();
    }

    public boolean isSpecialDay(LocalDate date) {
        String url = "http://specialdays-service/api/specialdays/isSpecial/{date}";
        return restTemplate.getForObject(url, Boolean.class, date);
    }

    public boolean isWeekend(LocalDate date) {
        String url = "http://track-service/api/track/isWeekend/{date}";
        return restTemplate.getForObject(url, Boolean.class, date);
    }

}
