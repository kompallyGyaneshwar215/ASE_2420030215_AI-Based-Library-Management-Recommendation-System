package com.library.config;

import com.library.entity.*;
import com.library.repository.*;
import com.library.service.FineService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final FineRepository fineRepository;
    private final NotificationRepository notificationRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final WishlistRepository wishlistRepository;
    private final LibrarySettingRepository librarySettingRepository;
    private final PasswordEncoder passwordEncoder;
    private final FineService fineService;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           BookRepository bookRepository,
                           BorrowRecordRepository borrowRecordRepository,
                           FineRepository fineRepository,
                           NotificationRepository notificationRepository,
                           UserPreferenceRepository userPreferenceRepository,
                           WishlistRepository wishlistRepository,
                           LibrarySettingRepository librarySettingRepository,
                           PasswordEncoder passwordEncoder,
                           FineService fineService) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.fineRepository = fineRepository;
        this.notificationRepository = notificationRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.wishlistRepository = wishlistRepository;
        this.librarySettingRepository = librarySettingRepository;
        this.passwordEncoder = passwordEncoder;
        this.fineService = fineService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Initialize Library Settings
        if (librarySettingRepository.count() == 0) {
            librarySettingRepository.save(new LibrarySetting(14, 5.0, 3));
        }

        // 2. Initialize Categories
        Map<String, Category> catMap = new HashMap<>();
        String[][] categoriesData = {
                {"Computer Science", "Algorithms, system design, operating systems, and architectures."},
                {"Artificial Intelligence", "Foundations of AI, machine learning, deep learning, NLP, and computer vision."},
                {"Data Science", "Data analytics, statistical computing, big data mining, and predictive modeling."},
                {"Mathematics", "Discrete mathematics, linear algebra, multivariable calculus, and probability."},
                {"Software Engineering", "Clean code, design patterns, microservices, DevOps, and agile practices."},
                {"Science Fiction", "Speculative futures, cyberpunk, synthetic consciousness, and space exploration."},
                {"Business & Management", "Technology management, tech startups, entrepreneurship, and innovation."}
        };

        for (String[] c : categoriesData) {
            Category cat = categoryRepository.findByCategoryName(c[0])
                    .orElseGet(() -> categoryRepository.save(new Category(c[0], c[1])));
            catMap.put(c[0], cat);
        }

        // 3. Initialize Users
        if (userRepository.count() == 0) {
            String defaultPwd = passwordEncoder.encode("password123");

            User admin = new User("System Administrator", "admin@library.com", defaultPwd, User.Role.ADMIN, "+91 9876543210");
            User librarian1 = new User("Chief Librarian Sarah", "librarian@library.com", defaultPwd, User.Role.LIBRARIAN, "+91 9876543211");
            User librarian2 = new User("David Chen", "david@library.com", defaultPwd, User.Role.LIBRARIAN, "+91 9876543212");
            User student1 = new User("Alex Johnson", "student@library.com", defaultPwd, User.Role.STUDENT, "+91 9876543220");
            User student2 = new User("Priya Sharma", "priya@library.com", defaultPwd, User.Role.STUDENT, "+91 9876543221");
            User student3 = new User("Rahul Verma", "rahul@library.com", defaultPwd, User.Role.STUDENT, "+91 9876543222");

            userRepository.saveAll(Arrays.asList(admin, librarian1, librarian2, student1, student2, student3));

            // Preferences
            userPreferenceRepository.save(new UserPreference(student1, "Artificial Intelligence, Machine Learning, Data Science", "Stuart Russell, Peter Norvig, Andrew Ng"));
            userPreferenceRepository.save(new UserPreference(student2, "Programming, Software Engineering, Web Development", "Robert C. Martin, Martin Fowler"));
            userPreferenceRepository.save(new UserPreference(student3, "Mathematics, Algorithms, Science Fiction", "Thomas H. Cormen, Isaac Asimov"));
        }

        // 4. Initialize Books
        if (bookRepository.count() == 0) {
            List<Book> books = new ArrayList<>();

            books.add(createBook("Artificial Intelligence: A Modern Approach", "Stuart Russell & Peter Norvig", "978-0136042594",
                    "Artificial Intelligence", catMap.get("Artificial Intelligence"),
                    "The comprehensive standard guide to artificial intelligence, covering search algorithms, heuristics, knowledge representation, probabilistic reasoning, and reinforcement learning.",
                    "Pearson", 2020, 5, 3, "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow", "Aurelien Geron", "978-1492032649",
                    "Machine Learning", catMap.get("Artificial Intelligence"),
                    "Build intelligent systems with practical Python libraries. Covers end-to-end ML workflows, deep neural nets, gradient boosting, and transformer models.",
                    "O'Reilly Media", 2019, 4, 2, "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Pattern Recognition and Machine Learning", "Christopher M. Bishop", "978-0387310732",
                    "Data Science", catMap.get("Data Science"),
                    "Rigorous introduction to pattern recognition and machine learning from a Bayesian perspective. Essential for probabilistic models and kernel methods.",
                    "Springer", 2016, 3, 3, "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Deep Learning", "Ian Goodfellow, Yoshua Bengio & Aaron Courville", "978-0262035613",
                    "Artificial Intelligence", catMap.get("Artificial Intelligence"),
                    "The definitive deep learning textbook. Explores mathematical foundations, convolutional networks, recurrent architectures, and generative modeling.",
                    "MIT Press", 2016, 4, 3, "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Introduction to Algorithms (CLRS)", "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest & Clifford Stein", "978-0262033848",
                    "Computer Science", catMap.get("Computer Science"),
                    "In-depth reference and university standard on data structures, sorting, dynamic programming, graph theory, and algorithmic complexity.",
                    "MIT Press", 2022, 6, 4, "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Clean Code: A Handbook of Agile Software Craftsmanship", "Robert C. Martin", "978-0132350884",
                    "Software Engineering", catMap.get("Software Engineering"),
                    "Learn principles, patterns, and practices for writing readable, maintainable, and elegant software code. Features extensive refactoring case studies.",
                    "Prentice Hall", 2008, 5, 2, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Designing Data-Intensive Applications", "Martin Kleppmann", "978-1449373320",
                    "Computer Science", catMap.get("Computer Science"),
                    "The guide to the architecture, reliable storage, stream processing, replication, partitioning, and consistency of distributed data systems.",
                    "O'Reilly Media", 2017, 4, 3, "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Python for Data Analysis", "Wes McKinney", "978-1491957660",
                    "Data Science", catMap.get("Data Science"),
                    "Practical guide written by the creator of Pandas. Master data manipulation, time-series analysis, aggregation, and data visualization in Python.",
                    "O'Reilly Media", 2022, 5, 4, "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Discrete Mathematics and Its Applications", "Kenneth H. Rosen", "978-1259676512",
                    "Mathematics", catMap.get("Mathematics"),
                    "Precise exploration of mathematical logic, set theory, combinatorics, graph theory, modular arithmetic, and finite automata.",
                    "McGraw Hill", 2018, 4, 4, "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Linear Algebra and Its Applications", "Gilbert Strang", "978-0030105678",
                    "Mathematics", catMap.get("Mathematics"),
                    "Foundational concepts in vector spaces, matrix factorizations, eigenvalues, singular value decomposition, and computational mathematics.",
                    "Cengage", 2016, 3, 2, "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("The Pragmatic Programmer", "David Thomas & Andrew Hunt", "978-0135957059",
                    "Software Engineering", catMap.get("Software Engineering"),
                    "Essential wisdom for software craft, developer mindset, automation, testing strategies, orthogonality, and continuous learning.",
                    "Addison-Wesley", 2019, 4, 3, "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Neuromancer", "William Gibson", "978-0441569595",
                    "Science Fiction", catMap.get("Science Fiction"),
                    "Pioneering cyberpunk masterpiece exploring artificial intelligence, cyberspace hacking, corporate conglomerates, and transhumanism.",
                    "Ace Books", 1984, 3, 2, "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Foundation", "Isaac Asimov", "978-0553293357",
                    "Science Fiction", catMap.get("Science Fiction"),
                    "The psychohistorian Hari Seldon envisions the fall of an empire and establishes the Foundation to preserve human scientific knowledge.",
                    "Spectra", 1951, 3, 1, "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Natural Language Processing with Transformers", "Lewis Tunstall, Leandro von Werra & Thomas Wolf", "978-1098103248",
                    "Artificial Intelligence", catMap.get("Artificial Intelligence"),
                    "Build, fine-tune, and deploy transformer architectures including BERT, GPT, and T5 with Hugging Face for classification, question answering, and text generation.",
                    "O'Reilly Media", 2022, 3, 2, "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80"));

            books.add(createBook("Zero to One: Notes on Startups", "Peter Thiel & Blake Masters", "978-0804139298",
                    "Business & Management", catMap.get("Business & Management"),
                    "How to build companies that create new things. Insights on technology monopolies, network effects, proprietary software, and vertical progress.",
                    "Crown Business", 2014, 4, 4, "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80"));

            bookRepository.saveAll(books);
        }

        // 5. Initialize Borrow Records, Fines, Wishlists, Notifications
        if (borrowRecordRepository.count() == 0) {
            User student1 = userRepository.findByEmail("student@library.com").orElse(null);
            User student2 = userRepository.findByEmail("priya@library.com").orElse(null);
            User student3 = userRepository.findByEmail("rahul@library.com").orElse(null);

            List<Book> allBooks = bookRepository.findAll();
            if (student1 != null && allBooks.size() >= 5) {
                // Record 1: Overdue book
                BorrowRecord rec1 = new BorrowRecord();
                rec1.setUser(student1);
                rec1.setBook(allBooks.get(0)); // AI: A Modern Approach
                rec1.setRequestDate(LocalDateTime.now().minusDays(20));
                rec1.setIssueDate(LocalDateTime.now().minusDays(19));
                rec1.setDueDate(LocalDateTime.now().minusDays(5));
                rec1.setStatus(BorrowRecord.Status.OVERDUE);
                rec1.setNotes("Student notified regarding return");
                borrowRecordRepository.save(rec1);

                Fine fine = new Fine(rec1, 25.0); // 5 days * 5.0
                fineRepository.save(fine);

                // Record 2: Active loan
                BorrowRecord rec2 = new BorrowRecord();
                rec2.setUser(student1);
                rec2.setBook(allBooks.get(1)); // Hands-On Machine Learning
                rec2.setRequestDate(LocalDateTime.now().minusDays(5));
                rec2.setIssueDate(LocalDateTime.now().minusDays(4));
                rec2.setDueDate(LocalDateTime.now().plusDays(10));
                rec2.setStatus(BorrowRecord.Status.ISSUED);
                rec2.setNotes("Mid-term exam preparation");
                borrowRecordRepository.save(rec2);

                // Record 3: Returned book for Priya
                if (student2 != null) {
                    BorrowRecord rec3 = new BorrowRecord();
                    rec3.setUser(student2);
                    rec3.setBook(allBooks.get(5)); // Clean Code
                    rec3.setRequestDate(LocalDateTime.now().minusDays(25));
                    rec3.setIssueDate(LocalDateTime.now().minusDays(24));
                    rec3.setDueDate(LocalDateTime.now().minusDays(10));
                    rec3.setReturnDate(LocalDateTime.now().minusDays(9));
                    rec3.setStatus(BorrowRecord.Status.RETURNED);
                    borrowRecordRepository.save(rec3);

                    BorrowRecord rec4 = new BorrowRecord();
                    rec4.setUser(student2);
                    rec4.setBook(allBooks.get(4)); // CLRS
                    rec4.setRequestDate(LocalDateTime.now().minusDays(1));
                    rec4.setStatus(BorrowRecord.Status.REQUESTED);
                    rec4.setNotes("Algorithm assignments");
                    borrowRecordRepository.save(rec4);
                }

                // Wishlists
                wishlistRepository.save(new Wishlist(student1, allBooks.get(3))); // Deep Learning
                wishlistRepository.save(new Wishlist(student1, allBooks.get(6))); // Designing Data-Intensive Applications

                // Notifications
                notificationRepository.save(new Notification(student1,
                        "Your borrowed book 'Artificial Intelligence: A Modern Approach' is overdue by 5 days. Late fee applies.",
                        "OVERDUE_ALERT"));
                notificationRepository.save(new Notification(student1,
                        "Your borrowing request for 'Hands-On Machine Learning' was approved and issued.",
                        "BOOK_ISSUED"));
                notificationRepository.save(new Notification(student1,
                        "Welcome to the AI Library Management System! Set your preferred genres to receive personalized recommendations.",
                        "WELCOME"));
            }
        }
    }

    private Book createBook(String title, String author, String isbn, String genre, Category category,
                            String description, String publisher, Integer year, int total, int available, String cover) {
        Book b = new Book();
        b.setTitle(title);
        b.setAuthor(author);
        b.setIsbn(isbn);
        b.setGenre(genre);
        b.setCategory(category);
        b.setDescription(description);
        b.setPublisher(publisher);
        b.setPublicationYear(year);
        b.setTotalCopies(total);
        b.setAvailableCopies(available);
        b.setCoverImageUrl(cover);
        b.setCreatedAt(LocalDateTime.now());
        return b;
    }
}
