package portal.faculty.faculty_portal.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ✅ Method signature should use Role enum, not String
    List<User> findByRole(Role role);

    Optional<User> findByEmail(String email);

    // Optional: Find by role and department
    List<User> findByRoleAndDepartment(Role role, String department);
}
