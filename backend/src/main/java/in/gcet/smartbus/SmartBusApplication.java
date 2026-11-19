package in.gcet.smartbus;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.*;
import java.util.*;

@SpringBootApplication
public class SmartBusApplication {
 public static void main(String[] args){SpringApplication.run(SmartBusApplication.class,args);}
}
@Entity @Table(name="transport_records")
class TransportRecord {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false) public String type;
 @Column(columnDefinition="TEXT") public String data;
 public TransportRecord(){}
 public TransportRecord(String type,String data){this.type=type;this.data=data;}
}
interface TransportRepository extends JpaRepository<TransportRecord,Long>{List<TransportRecord> findByType(String type);}
@RestController @RequestMapping("/api") @CrossOrigin(origins="*")
class TransportController {
 private final TransportRepository repo;
 TransportController(TransportRepository repo){this.repo=repo;}
 private static final Set<String> TYPES=Set.of("buses","routes","students","drivers","schedules");
 @GetMapping("/health") Map<String,String> health(){return Map.of("status","UP","application","GCET Smart Bus API");}
 @GetMapping("/{type}") List<Map<String,Object>> all(@PathVariable String type){check(type);return repo.findByType(type).stream().map(this::decode).toList();}
 @PostMapping("/{type}") Map<String,Object> create(@PathVariable String type,@RequestBody Map<String,Object> body){check(type);if(body.isEmpty())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Record cannot be empty");TransportRecord r=repo.save(new TransportRecord(type,new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(body).toString()));return decode(r);}
 @DeleteMapping("/{type}/{id}") void delete(@PathVariable String type,@PathVariable Long id){check(type);TransportRecord r=repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));if(!r.type.equals(type))throw new ResponseStatusException(HttpStatus.NOT_FOUND);repo.delete(r);}
 private void check(String t){if(!TYPES.contains(t))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Unknown resource");}
 private Map<String,Object> decode(TransportRecord r){try{Map<String,Object> m=new com.fasterxml.jackson.databind.ObjectMapper().readValue(r.data,Map.class);m.put("id",r.id);return m;}catch(Exception e){throw new RuntimeException(e);}}
}