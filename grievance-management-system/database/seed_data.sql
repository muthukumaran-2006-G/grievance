-- =====================================================================
-- Sample seed data for manual/reference use.
--
-- NOTE: The recommended way to seed sample users is:
--     cd backend && python seed.py
-- because it correctly generates a Werkzeug password hash.
--
-- The password_hash values below are placeholders and will NOT work for
-- login as-is. This file is provided mainly to illustrate row shape and
-- for setups that want to insert data purely via SQL after generating
-- their own Werkzeug pbkdf2 hashes.
-- =====================================================================

USE grievance_management;

-- Example (replace <werkzeug_hash_for_Roever@123> with a real generated hash):
-- INSERT INTO users (name, email, phone, password_hash, role, department, register_number)
-- VALUES
-- ('Arun Kumar', 'student@roever.edu.in', '9000000001', '<werkzeug_hash_for_Roever@123>', 'student', 'Computer Science and Engineering', 'REC21CS001'),
-- ('Dr. Meena Sundaram', 'faculty@roever.edu.in', '9000000002', '<werkzeug_hash_for_Roever@123>', 'faculty', 'Computer Science and Engineering', 'EMP1001'),
-- ('Ravi Shankar', 'worker@roever.edu.in', '9000000003', '<werkzeug_hash_for_Roever@123>', 'worker', 'Maintenance', 'EMP2001'),
-- ('Lakshmi Narayanan', 'parent@roever.edu.in', '9000000004', '<werkzeug_hash_for_Roever@123>', 'parent', NULL, NULL),
-- ('Dr. S. Venkatesan', 'principal@roever.edu.in', '9000000005', '<werkzeug_hash_for_Roever@123>', 'principal', 'Administration', 'EMP0001'),
-- ('Grievance Redressal Cell', 'grievance@roever.edu.in', '9000000006', '<werkzeug_hash_for_Roever@123>', 'grievance_team', 'Administration', 'EMP0002');

-- To generate a compatible hash in Python:
--   from werkzeug.security import generate_password_hash
--   print(generate_password_hash("Roever@123"))
