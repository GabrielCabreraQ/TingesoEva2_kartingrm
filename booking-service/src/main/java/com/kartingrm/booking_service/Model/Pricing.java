package com.kartingrm.booking_service.Model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Pricing {

    private double price10Laps;
    private double price15Laps;
    private double price20Laps;

    private double discount1To2People;
    private double discount3To5People;
    private double discount6To10People;
    private double discount11To15People;

    private double discountVeryFrequent;
    private double discountFrequent;
    private double discountRegular;
    private double discountNonFrequent;

    private double weekendRise;
    private double holydayRise;
    private double weekendDiscount;
    private double holidayDiscount;
    private double birthdayDiscount;
    private double iva;

}
