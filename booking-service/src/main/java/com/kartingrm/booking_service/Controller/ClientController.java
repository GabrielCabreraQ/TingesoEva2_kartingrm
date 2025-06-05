package com.kartingrm.booking_service.Controller;

import com.kartingrm.booking_service.Entity.Client;
import com.kartingrm.booking_service.Service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/client")
@CrossOrigin("*")
public class ClientController {



    @Autowired
    ClientService clientService;

    @GetMapping("/")
    public ResponseEntity<List<Client>> listClients() {
        List<Client> clients = clientService.getClients();
        return ResponseEntity.ok(clients);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        Client client = clientService.getClientById(id);
        return ResponseEntity.ok(client);
    }

    @GetMapping("/rut/{rut}")
    public ResponseEntity<Optional<Client>> getClientByRut(@PathVariable String rut) {
        Optional<Client> clientRut = clientService.getClientByRut(rut);
        return ResponseEntity.ok(clientRut);
    }

    @PostMapping("/")
    public ResponseEntity<Client> saveClient(@RequestBody Client client) {
        Client clientNew = clientService.saveClient(client);
        return ResponseEntity.ok(clientNew);
    }

    @PutMapping("/")
    public ResponseEntity<Client> updateClient(@RequestBody Client client){
        Client clientUpdated = clientService.updateClient(client);
        return ResponseEntity.ok(clientUpdated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteClientById(@PathVariable Long id) throws Exception {
        var isDeleted = clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }


}
