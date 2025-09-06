package portal.faculty.faculty_portal.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import portal.faculty.faculty_portal.user.dto.PortfolioCreateDto;
import portal.faculty.faculty_portal.user.dto.PortfolioView;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class UserPortfolioController {

    private final UserPortfolioService portfolioService;

    /**
     * Get current user's portfolio
     */
    @GetMapping("/me")
    public ResponseEntity<PortfolioView> getMyPortfolio(@AuthenticationPrincipal User user) {
        return portfolioService.findByUserId(user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create or update current user's portfolio
     */
    @PostMapping("/me")
    public ResponseEntity<PortfolioView> createOrUpdateMyPortfolio(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PortfolioCreateDto dto) {
        PortfolioView portfolio = portfolioService.createOrUpdate(user.getId(), dto, user);
        return ResponseEntity.ok(portfolio);
    }

    /**
     * Delete current user's portfolio
     */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyPortfolio(@AuthenticationPrincipal User user) {
        portfolioService.deletePortfolio(user.getId(), user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get portfolio by user ID (public access)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<PortfolioView> getPortfolioByUserId(@PathVariable Long userId) {
        return portfolioService.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all portfolios (HOD only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('HOD','ROLE_HOD')")
    public ResponseEntity<List<PortfolioView>> getAllPortfolios() {
        List<PortfolioView> portfolios = portfolioService.findAllPortfolios();
        return ResponseEntity.ok(portfolios);
    }

    /**
     * HOD can update any user's portfolio
     */
    @PostMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('HOD','ROLE_HOD')")
    public ResponseEntity<PortfolioView> updateUserPortfolio(
            @PathVariable Long userId,
            @Valid @RequestBody PortfolioCreateDto dto,
            @AuthenticationPrincipal User user) {
        PortfolioView portfolio = portfolioService.createOrUpdate(userId, dto, user);
        return ResponseEntity.ok(portfolio);
    }

    /**
     * HOD can delete any user's portfolio
     */
    @DeleteMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('HOD','ROLE_HOD')")
    public ResponseEntity<Void> deleteUserPortfolio(
            @PathVariable Long userId,
            @AuthenticationPrincipal User user) {
        portfolioService.deletePortfolio(userId, user);
        return ResponseEntity.noContent().build();
    }
}
