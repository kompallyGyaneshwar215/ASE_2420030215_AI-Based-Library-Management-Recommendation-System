-- ====================================================================
-- AI-Based Library Management & Recommendation System
-- Sample Seed Data
-- ====================================================================

USE library_db;

-- 1. Library Settings
INSERT INTO library_settings (id, loan_duration_days, fine_per_day, max_borrow_limit)
VALUES (1, 14, 5.00, 3)
ON DUPLICATE KEY UPDATE loan_duration_days=14, fine_per_day=5.00, max_borrow_limit=3;

-- 2. Categories
INSERT INTO categories (id, category_name, description) VALUES
(1, 'Computer Science', 'Books covering algorithms, programming languages, architectures, and systems design.'),
(2, 'Artificial Intelligence', 'Covers AI fundamentals, neural networks, machine learning, and natural language processing.'),
(3, 'Data Science', 'Data analysis, statistics, big data processing, data mining, and visualization.'),
(4, 'Mathematics', 'Discrete mathematics, linear algebra, calculus, and probability theory for engineering.'),
(5, 'Software Engineering', 'System design patterns, agile methodologies, DevOps, testing, and clean architecture.'),
(6, 'Science Fiction', 'Speculative fiction, futuristic science, robotics, space exploration, and cyber adventures.'),
(7, 'Business & Management', 'Technology management, leadership, entrepreneurship, and economics.')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- 3. Users (Default password: password123)
-- BCrypt hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
INSERT INTO users (id, full_name, email, password, role, phone, status) VALUES
(1, 'System Administrator', 'admin@library.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ADMIN', '+91 9876543210', 'ACTIVE'),
(2, 'Chief Librarian Sarah', 'librarian@library.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'LIBRARIAN', '+91 9876543211', 'ACTIVE'),
(3, 'Librarian David Chen', 'david@library.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'LIBRARIAN', '+91 9876543212', 'ACTIVE'),
(4, 'Alex Johnson', 'student@library.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'STUDENT', '+91 9876543220', 'ACTIVE'),
(5, 'Priya Sharma', 'priya@library.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'STUDENT', '+91 9876543221', 'ACTIVE'),
(6, 'Rahul Verma', 'rahul@library.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'STUDENT', '+91 9876543222', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 4. User Preferences
INSERT INTO user_preferences (user_id, preferred_genres, favorite_authors) VALUES
(4, 'Artificial Intelligence, Machine Learning, Data Science', 'Stuart Russell, Peter Norvig, Andrew Ng'),
(5, 'Programming, Software Engineering, Web Development', 'Robert C. Martin, Martin Fowler'),
(6, 'Mathematics, Algorithms, Science Fiction', 'Thomas H. Cormen, Isaac Asimov')
ON DUPLICATE KEY UPDATE preferred_genres=VALUES(preferred_genres);

-- 5. Books
INSERT INTO books (id, title, author, isbn, genre, category_id, description, publisher, publication_year, total_copies, available_copies, cover_image_url) VALUES
(1, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell & Peter Norvig', '978-0136042594', 'Artificial Intelligence', 2, 'The standard comprehensive guide to artificial intelligence, search algorithms, intelligent agents, and reasoning under uncertainty.', 'Pearson', 2020, 5, 3, 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80'),
(2, 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow', 'Aurelien Geron', '978-1492032649', 'Machine Learning', 2, 'Through a series of recent breakthroughs, deep learning has boosted the entire field of machine learning. Learn to build intelligent systems with Python.', 'O''Reilly Media', 2019, 4, 2, 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80'),
(3, 'Pattern Recognition and Machine Learning', 'Christopher M. Bishop', '978-0387310732', 'Data Science', 3, 'Comprehensive introduction to pattern recognition and machine learning using Bayesian methods, graphical models, and neural computations.', 'Springer', 2016, 3, 3, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80'),
(4, 'Deep Learning', 'Ian Goodfellow, Yoshua Bengio & Aaron Courville', '978-0262035613', 'Artificial Intelligence', 2, 'An authoritative textbook on deep learning, mathematics for machine learning, deep feedforward networks, convolutional networks, and autoencoders.', 'MIT Press', 2016, 4, 3, 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80'),
(5, 'Introduction to Algorithms (CLRS)', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest & Clifford Stein', '978-0262033848', 'Computer Science', 1, 'In-depth reference and university textbook covering a broad spectrum of algorithms, complexity analysis, graph algorithms, and dynamic programming.', 'MIT Press', 2022, 6, 4, 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80'),
(6, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 5, 'Even bad code can function, but if code is not clean it can bring a development organization to its knees. Master clean code principles, refactoring, and craftsmanship.', 'Prentice Hall', 2008, 5, 2, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'),
(7, 'Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'Computer Science', 1, 'The definitive guide to the architecture, reliable storage, streaming, distributed consensus, and scalability of modern data systems.', 'O''Reilly Media', 2017, 4, 3, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'),
(8, 'Python for Data Analysis', 'Wes McKinney', '978-1491957660', 'Data Science', 3, 'Complete instructions for manipulating, processing, cleaning, and crunching datasets in Python using Pandas, NumPy, and IPython.', 'O''Reilly Media', 2022, 5, 4, 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80'),
(9, 'Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', '978-1259676512', 'Mathematics', 4, 'Precise and comprehensive treatment of mathematical reasoning, combinatorial analysis, sets, relations, graphs, and Boolean algebra.', 'McGraw Hill', 2018, 4, 4, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80'),
(10, 'Linear Algebra and Its Applications', 'Gilbert Strang', '978-0030105678', 'Mathematics', 4, 'Renowned mathematical foundation covering vector spaces, linear transformations, eigenvalues, singular value decomposition, and computational matrices.', 'Cengage', 2016, 3, 2, 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=600&auto=format&fit=crop&q=80'),
(11, 'The Pragmatic Programmer', 'David Thomas & Andrew Hunt', '978-0135957059', 'Software Engineering', 5, 'Classic guide covering modern development best practices, career development, responsibility, code architecture, and pragmatic execution.', 'Addison-Wesley', 2019, 4, 3, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'),
(12, 'Neuromancer', 'William Gibson', '978-0441569595', 'Science Fiction', 6, 'Seminal cyberpunk novel depicting high-tech cyberspace, matrix artificial intelligences, neural implants, and corporate espionage.', 'Ace Books', 1984, 3, 2, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'),
(13, 'Foundation', 'Isaac Asimov', '978-0553293357', 'Science Fiction', 6, 'Epic science fiction series detailing psychohistory, predicting the future of galaxies, mathematical sociology, and the preservation of civilization.', 'Spectra', 1951, 3, 1, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'),
(14, 'Natural Language Processing with Transformers', 'Lewis Tunstall, Leandro von Werra & Thomas Wolf', '978-1098103248', 'Artificial Intelligence', 2, 'Build and train state-of-the-art NLP models using Hugging Face Transformers, BERT, GPT, and modern transformer architectures.', 'O''Reilly Media', 2022, 3, 2, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80'),
(15, 'Zero to One: Notes on Startups, or How to Build the Future', 'Peter Thiel & Blake Masters', '978-0804139298', 'Business & Management', 7, 'Secrets about technology innovation, building monopolies, value creation, and shaping a transformative future.', 'Crown Business', 2014, 4, 4, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 6. Borrow Records (Sample active and past transactions)
INSERT INTO borrow_records (id, user_id, book_id, request_date, issue_date, due_date, return_date, status, notes) VALUES
(1, 4, 1, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, 'OVERDUE', 'Student notified of late return'),
(2, 4, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), NULL, 'ISSUED', 'In active reading period'),
(3, 5, 6, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), 'RETURNED', 'Returned in good condition'),
(4, 5, 5, DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, NULL, NULL, 'REQUESTED', 'Awaiting librarian approval'),
(5, 6, 12, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 13 DAY), NULL, 'ISSUED', 'Standard loan')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 7. Fines (For the overdue record 1)
INSERT INTO fines (id, borrow_id, fine_amount, payment_status, created_at) VALUES
(1, 1, 25.00, 'PENDING', NOW())
ON DUPLICATE KEY UPDATE fine_amount=VALUES(fine_amount);

-- 8. Notifications
INSERT INTO notifications (id, user_id, message, notification_type, is_read, created_at) VALUES
(1, 4, 'Your borrowed book "Artificial Intelligence: A Modern Approach" is overdue by 5 days. Late fee applies.', 'OVERDUE_ALERT', FALSE, NOW()),
(2, 4, 'Your borrowing request for "Hands-On Machine Learning" was approved and issued.', 'BOOK_ISSUED', TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 5, 'Your borrowing request for "Introduction to Algorithms (CLRS)" has been submitted and is pending review.', 'REQUEST_SUBMITTED', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 4, 'Welcome to the AI Library Management System! Set your genre preferences to get personalized recommendations.', 'SYSTEM_WELCOME', TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY))
ON DUPLICATE KEY UPDATE message=VALUES(message);

-- 9. Wishlists
INSERT INTO wishlists (id, user_id, book_id, created_at) VALUES
(1, 4, 4, NOW()),
(2, 4, 7, NOW()),
(3, 5, 11, NOW()),
(4, 6, 13, NOW())
ON DUPLICATE KEY UPDATE book_id=VALUES(book_id);
