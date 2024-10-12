import Student from "../models/student.model.js";

class StudentController {
  // @route    PUT /api/students/:id
  // @desc     Update student profile (excluding email and password)
  // @access   Private
  async updateStudent(req, res) {
    try {
      const {
        firstName,
        lastName,
        profilePicture,
        department,
        bio,
        interests,
        socialLinks, // array of objects with { platform, url }
      } = req.body;
      const studentId = req.params.id;

      // Check if student exists
      let student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ msg: "Student not found" });
      }

      // Update fields only if they are provided in the request
      student.firstName = firstName || student.firstName;
      student.lastName = lastName || student.lastName;
      student.profilePicture = profilePicture || student.profilePicture;
      student.department = department || student.department;
      student.bio = bio || student.bio;
      student.interests = interests || student.interests;

      // Update social links if provided (expecting an array of objects)
      if (socialLinks) {
        student.socialLinks = socialLinks.length
          ? socialLinks
          : student.socialLinks;
      }

      // Save the updated student
      await student.save();

      res
        .status(200)
        .json({ msg: "Student profile updated successfully", student });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  }
}

export default new StudentController();
