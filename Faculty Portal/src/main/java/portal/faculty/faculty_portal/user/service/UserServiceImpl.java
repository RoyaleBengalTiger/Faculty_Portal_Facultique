package portal.faculty.faculty_portal.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import portal.faculty.faculty_portal.user.Role;
import portal.faculty.faculty_portal.user.User;
import portal.faculty.faculty_portal.user.UserRepository;
import portal.faculty.faculty_portal.user.dto.MiniUserView;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<MiniUserView> getFacultyMembers() {
        // ✅ Use Role.FACULTY instead of Role.valueOf("FACULTY")
        List<User> facultyUsers = userRepository.findByRole(Role.FACULTY);
        return facultyUsers.stream()
                .map(this::convertToMiniUserView)
                .collect(Collectors.toList());
    }

    @Override
    public List<MiniUserView> getAllUsers() {
        List<User> allUsers = userRepository.findAll();
        return allUsers.stream()
                .map(this::convertToMiniUserView)
                .collect(Collectors.toList());
    }

    @Override
    public MiniUserView getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToMiniUserView(user);
    }

    // Helper method to convert User entity to MiniUserView DTO
    private MiniUserView convertToMiniUserView(User user) {
        return new MiniUserView(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(), // ✅ Convert Enum to String using .name()
                user.getDepartment()
        );
    }
}
