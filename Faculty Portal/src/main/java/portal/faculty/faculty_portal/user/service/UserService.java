package portal.faculty.faculty_portal.user.service;

import java.util.List;
import portal.faculty.faculty_portal.user.dto.MiniUserView;


public interface UserService {
    List<MiniUserView> getFacultyMembers();
    List<MiniUserView> getAllUsers();
    MiniUserView getUserById(Long id);
}
