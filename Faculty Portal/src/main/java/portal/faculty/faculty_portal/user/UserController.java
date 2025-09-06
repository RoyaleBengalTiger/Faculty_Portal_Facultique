package portal.faculty.faculty_portal.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import portal.faculty.faculty_portal.user.service.UserService;
import portal.faculty.faculty_portal.user.dto.MiniUserView;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    // Endpoint to get all faculty members
    @GetMapping("/faculty")
    public ResponseEntity<List<MiniUserView>> getFacultyMembers() {
        List<MiniUserView> faculty = userService.getFacultyMembers();
        return ResponseEntity.ok(faculty);
    }

    // Optional: Get all users (for admin purposes)
    @GetMapping
    public ResponseEntity<List<MiniUserView>> getAllUsers() {
        List<MiniUserView> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Optional: Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<MiniUserView> getUserById(@PathVariable Long id) {
        MiniUserView user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
}