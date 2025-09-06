package portal.faculty.faculty_portal.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import portal.faculty.faculty_portal.user.dto.PortfolioCreateDto;
import portal.faculty.faculty_portal.user.dto.PortfolioView;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserPortfolioService {

    private final UserPortfolioRepository portfolioRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Optional<PortfolioView> findByUserId(Long userId) {
        return portfolioRepository.findByUserId(userId)
                .map(this::toView);
    }

    @Transactional(readOnly = true)
    public Optional<PortfolioView> findByUserEmail(String email) {
        return portfolioRepository.findByUserEmail(email)
                .map(this::toView);
    }

    @Transactional(readOnly = true)
    public List<PortfolioView> findAllPortfolios() {
        return portfolioRepository.findAll().stream()
                .map(this::toView)
                .toList();
    }

    @Transactional
    public PortfolioView createOrUpdate(Long userId, PortfolioCreateDto dto, User currentUser) {
        // Security check: users can only edit their own portfolio
        if (!currentUser.getId().equals(userId) && currentUser.getRole() != Role.HOD) {
            throw new AccessDeniedException("You can only edit your own portfolio");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<UserPortfolio> existingPortfolio = portfolioRepository.findByUserId(userId);

        UserPortfolio portfolio;
        if (existingPortfolio.isPresent()) {
            portfolio = existingPortfolio.get();
            updatePortfolioFromDto(portfolio, dto);
        } else {
            portfolio = UserPortfolio.builder()
                    .user(user)
                    .bio(dto.getBio())
                    .websiteUrl(dto.getWebsiteUrl())
                    .linkedinUrl(dto.getLinkedinUrl())
                    .githubUrl(dto.getGithubUrl())
                    .twitterUrl(dto.getTwitterUrl())
                    .researchInterests(dto.getResearchInterests())
                    .achievements(dto.getAchievements())
                    .education(dto.getEducation())
                    .experience(dto.getExperience())
                    .build();
        }

        portfolio = portfolioRepository.save(portfolio);
        return toView(portfolio);
    }

    @Transactional
    public void deletePortfolio(Long userId, User currentUser) {
        // Security check
        if (!currentUser.getId().equals(userId) && currentUser.getRole() != Role.HOD) {
            throw new AccessDeniedException("You can only delete your own portfolio");
        }

        portfolioRepository.findByUserId(userId)
                .ifPresent(portfolioRepository::delete);
    }

    private void updatePortfolioFromDto(UserPortfolio portfolio, PortfolioCreateDto dto) {
        portfolio.setBio(dto.getBio());
        portfolio.setWebsiteUrl(dto.getWebsiteUrl());
        portfolio.setLinkedinUrl(dto.getLinkedinUrl());
        portfolio.setGithubUrl(dto.getGithubUrl());
        portfolio.setTwitterUrl(dto.getTwitterUrl());
        portfolio.setResearchInterests(dto.getResearchInterests());
        portfolio.setAchievements(dto.getAchievements());
        portfolio.setEducation(dto.getEducation());
        portfolio.setExperience(dto.getExperience());
    }

    private PortfolioView toView(UserPortfolio portfolio) {
        return PortfolioView.builder()
                .id(portfolio.getId())
                .userId(portfolio.getUser().getId())
                .userName(portfolio.getUser().getName())
                .userEmail(portfolio.getUser().getEmail())
                .userRole(portfolio.getUser().getRole().name())
                .userDepartment(portfolio.getUser().getDepartment())
                .bio(portfolio.getBio())
                .websiteUrl(portfolio.getWebsiteUrl())
                .linkedinUrl(portfolio.getLinkedinUrl())
                .githubUrl(portfolio.getGithubUrl())
                .twitterUrl(portfolio.getTwitterUrl())
                .researchInterests(portfolio.getResearchInterests())
                .achievements(portfolio.getAchievements())
                .education(portfolio.getEducation())
                .experience(portfolio.getExperience())
                .createdAt(portfolio.getCreatedAt())
                .updatedAt(portfolio.getUpdatedAt())
                .build();
    }
}
