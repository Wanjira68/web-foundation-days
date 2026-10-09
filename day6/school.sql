-- Day 6: School Database

-- 1. Store student details
CREATE TABLE students (
id INTEGER PRIMARY KEY,
name TEXT NOT NULL,
email TEXT NOT NULL UNIQUE
);

-- 2. Store course details
CREATE TABLE courses (
id INTEGER PRIMARY KEY,
name TEXT NOT NULL
);

-- 3. Connect students to courses and store their grades
CREATE TABLE enrolments (
id INTEGER PRIMARY KEY,
student_id INTEGER NOT NULL,
course_id INTEGER NOT NULL,
grade TEXT,
FOREIGN KEY (student_id) REFERENCES students(id),
FOREIGN KEY (course_id) REFERENCES courses(id),
UNIQUE (student_id, course_id)
);

-- 4. Add sample students
INSERT INTO students (id, name, email) VALUES
(1, 'Amina Hassan', '[amina@example.com](mailto:amina@example.com)'),
(2, 'Brian Otieno', '[brian@example.com](mailto:brian@example.com)'),
(3, 'Carol Wanjiku', '[carol@example.com](mailto:carol@example.com)'),
(4, 'Diana Kamau', '[diana@example.com](mailto:diana@example.com)');

-- 5. Add sample courses
INSERT INTO courses (id, name) VALUES
(1, 'Mathematics'),
(2, 'English'),
(3, 'Computer Science');

-- 6. Enrol students in courses and record grades
INSERT INTO enrolments (id, student_id, course_id, grade) VALUES
(1, 1, 1, 'A'),
(2, 1, 2, 'B'),
(3, 2, 1, 'B'),
(4, 2, 3, 'A'),
(5, 3, 2, 'A');


-- 7. Find all courses taken by one student (Amina Hassan)
SELECT students.name AS student_name, courses.name AS course_name, enrolments.grade
FROM students
JOIN enrolments ON students.id = enrolments.student_id
JOIN courses ON enrolments.course_id = courses.id
WHERE students.name = 'Amina Hassan';

-- 8. Find all students enrolled in Mathematics
SELECT students.name AS student_name
FROM students
JOIN enrolments ON students.id = enrolments.student_id
JOIN courses ON enrolments.course_id = courses.id
WHERE courses.name = 'Mathematics';

-- 9. Count students enrolled in each course
SELECT courses.name AS course_name, COUNT(enrolments.student_id) AS number_of_students
FROM courses
LEFT JOIN enrolments ON courses.id = enrolments.course_id
GROUP BY courses.id, courses.name;

-- 10. Find students who have no enrolments
SELECT students.name AS student_name
FROM students
LEFT JOIN enrolments ON students.id = enrolments.student_id
WHERE enrolments.student_id IS NULL;

-- 11. Update one enrolment's grade
UPDATE enrolments
SET grade = 'A'
WHERE id = 3;

