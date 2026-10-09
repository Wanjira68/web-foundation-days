# School Database Design

## Tables

### 1. Students
The `students` table stores each student's ID, name, and email address. The ID is the primary key, and each email must be unique and cannot be empty.

### 2. Courses
The `courses` table stores each course's ID and name. The ID is the primary key, and the course name cannot be empty.

### 3. Enrolments
The `enrolments` table records which student takes which course and the student's grade. It has its own primary key and foreign keys that link to the students and courses tables. A student cannot enrol in the same course twice because the combination of `student_id` and `course_id` must be unique.

## Relationships

One student can enrol in many courses, and one course can have many students. This is a many-to-many relationship.

The `students` and `courses` tables are connected through the `enrolments` table. This join table is needed because a student can take several courses, and each course can have several students. It also stores the grade for each student's enrolment.

The relationship between students and enrolments is one-to-many because one student can have many enrolment records. The relationship between courses and enrolments is also one-to-many because one course can have many enrolment records.

## Index

I would add an index on `enrolments(course_id)` to help the database find students enrolled in a particular course more quickly. This is useful for queries that list all students taking a course.

## SQL or NoSQL?

I would choose SQL for this school system because the data is structured and has clear relationships between students, courses, and enrolments. SQL supports primary keys, foreign keys, unique constraints, and joins, which help maintain accurate data. It also makes it easy to count enrolments and find students or courses using queries. A relational database such as SQLite is suitable for this project.