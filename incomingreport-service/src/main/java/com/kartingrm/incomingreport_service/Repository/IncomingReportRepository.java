package com.kartingrm.incomingreport_service.Repository;

import com.kartingrm.incomingreport_service.Entity.IncomingReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IncomingReportRepository extends JpaRepository<IncomingReport, Long> {

    Optional<IncomingReport> findById(Long id);


}
