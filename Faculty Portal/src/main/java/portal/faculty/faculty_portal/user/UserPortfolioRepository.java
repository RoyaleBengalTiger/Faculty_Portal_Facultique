package portal.faculty.faculty_portal.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserPortfolioRepository extends JpaRepository<UserPortfolio, Long> {

    Optional<UserPortfolio> findByUserId(Long userId);

    @Query("SELECT p FROM UserPortfolio p WHERE p.user.email = :email")
    Optional<UserPortfolio> findByUserEmail(@Param("email") String email);

    boolean existsByUserId(Long userId);
}
