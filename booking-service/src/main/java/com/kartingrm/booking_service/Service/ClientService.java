package com.kartingrm.booking_service.Service;

import com.kartingrm.booking_service.Entity.Client;
import com.kartingrm.booking_service.Repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class ClientService {
    @Autowired
    ClientRepository clientRepository;

    public ArrayList<Client> getClients(){
        return (ArrayList<Client>) clientRepository.findAll();
    }


    public Client getClientById(Long id){
        return clientRepository.findById(id).get();
    }

    public Optional<Client> getClientByRut(String rut){
        return clientRepository.findByRut(rut);
    }
    public Client saveClient(Client client){
        return clientRepository.save(client);
    }

    public Client updateClient(Client client) {
        return clientRepository.save(client);
    }

    public boolean deleteClient(Long id) throws Exception {
        try{
            clientRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }

    }




}
