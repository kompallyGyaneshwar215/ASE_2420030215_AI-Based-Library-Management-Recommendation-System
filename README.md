# AI-Based Library Management & Recommendation System

A modern, production-grade, and responsive full-stack web application that automates academic library operations and provides intelligent book recommendations using machine learning (TF-IDF Vectorization & Cosine Similarity).

---

## 1. System Architecture

The application adopts a decoupled, multi-tier microservice architecture:

```
                          ┌─────────────────────────────┐
                          │   React 18 + Vite Frontend   │
                          │   (Tailwind CSS + Recharts) │
                          │    http://localhost:5173    │
                          └──────────────┬──────────────┘
                                         │  REST / JWT
                                         ▼
                          ┌─────────────────────────────┐
                          │   Spring Boot 3.3 Backend   │
                          │   Java 21 + Spring Security │
                          │    http://localhost:8080    │
                          └───────┬──────────────┬──────┘
                                  │              │
                   JPA / Hibernate│              │ JSON REST
                                  ▼              ▼
           ┌────────────────────────────┐  ┌───────────────────────────────────┐
           │     Database Engine        │  │   Python 3.11+ AI Recommendation  │
           │  MySQL 8 / H2 In-Memory    │  │   FastAPI / Cosine Similarity     │
           │    Port 3306 (or H2 Mem)   │  │        http://localhost:8000      │
           └────────────────────────────┘  └───────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
- **Framework:** React.js 18.3 with Vite
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router DOM v6
- **Data Visualizations:** Recharts 2.13 (Area Charts, Pie Charts, Bar Charts)
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request & response interceptors

### Backend
- **Language & Runtime:** Java 21 LTS
- **Framework:** Spring Boot 3.3.4
- **Security:** Spring Security 6 with Stateless JWT Authentication & BCrypt Password Hashing
- **ORM & Data Access:** Spring Data JPA, Hibernate ORM
- **Database Support:** Dual profile support:
  - **MySQL 8+** (`spring.profiles.active=mysql`) for production deployment
  - **H2 In-Memory** (`spring.profiles.active=h2`) for instant zero-dependency testing & evaluation
- **Build Tool:** Apache Maven 3.9+

### AI Recommendation Microservice
- **Runtime:** Python 3.11+
- **Framework:** FastAPI with Uvicorn (includes pure Python HTTP fallback server)
- **Machine Learning Algorithms:**
  - Content-Based Filtering
  - TF-IDF Text Vectorization (Term Frequency - Inverse Document Frequency)
  - Cosine Similarity Metric
  - Cold-Start Preference Blending
  - Popularity-Based Fallback Ranking

---

## 3. User Roles & Pre-configured Demo Accounts

All pre-seeded demo accounts use the password: **`password123`**

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student@library.com` | `password123` | Search books, submit borrow requests, view active loans, track return dates & fines, save wishlist, tune AI recommendations, view personalized feed. |
| **Librarian** | `librarian@library.com` | `password123` | Add/edit/delete books, review and approve/reject borrow requests, issue books, record returns, collect overdue fines, view student circulation history. |
| **Administrator** | `admin@library.com` | `password123` | Create librarian accounts, activate/deactivate student accounts, configure loan duration, fine rates, and borrowing limits, view system-wide analytics. |

*Additional student accounts included in seed data: `priya@library.com` and `rahul@library.com`.*

---

## 4. Key Functional Modules

### 1. Authentication & Security
- Standard JWT (JSON Web Token) bearer authentication with 24-hour token expiry.
- Passwords salted and hashed with BCrypt.
- Role-Based Access Control (`ROLE_STUDENT`, `ROLE_LIBRARIAN`, `ROLE_ADMIN`) with method-level authorization (`@PreAuthorize`).
- CORS configured for frontend communication on port 5173.

### 2. Book & Inventory Management
- Full catalog CRUD (Create, Read, Update, Delete) with ISBN uniqueness validation.
- Fields: Title, Author, ISBN, Genre, Category, Publisher, Publication Year, Total Copies, Available Copies, Cover Image URL, and Description.
- Real-time search across titles, authors, genres, and ISBNs.
- Category filtering and "In-Stock Only" availability filtering.

### 3. Borrowing Lifecycle & Inventory Synchronization
Borrowing records follow a stateful lifecycle:
```
[REQUESTED] ──(Librarian Approves)──> [APPROVED] ──(Physical Hand-over)──> [ISSUED]
     │                                                                        │
     └──(Librarian Rejects)──> [REJECTED]                                     │
                                                                       (Student Returns)
                                                                              ▼
                                                                         [RETURNED]
                                                              (or [OVERDUE] if past due date)
```
- Available copy stock is decremented atomically when a book is **ISSUED**.
- Stock is incremented atomically when a book is **RETURNED**.
- Students are blocked from exceeding the maximum borrow limit (default: 3 books).

### 4. Overdue Tracking & Fine Calculation
- Overdue status is detected automatically by checking loan due dates.
- Fine formula:
  $$\text{Fine} = \max(0, \text{Days Overdue}) \times \text{Fine Rate per Day}$$
  *(Default rate: ₹5.00/day after 14-day loan period).*
- Scheduled background task checks overdue records and triggers student alerts.
- Librarians can record cash/digital fine payments, marking status as **PAID**.

### 5. In-App Notifications
- Automated system notifications dispatched for:
  - Account registration welcome
  - Borrow request submission
  - Request approval / rejection
  - Physical book issuance with due date
  - 24-hour return reminders
  - Overdue alerts and fine generation
  - Return check-in confirmations

---

## 5. AI Recommendation Engine: Algorithmic Details

The recommendation service (`ai-recommendation-service`) implements a multi-stage Content-Based Recommendation pipeline:

### Step 1: Text Feature Preprocessing
Metadata from each book (title, author, genre, category, synopsis) is sanitized:
- Punctuation, special characters, URLs, and numeric digits are removed.
- Common english stopwords are filtered out.
- Author and genre tokens are repeated with synthetic weights to amplify topical clustering.

### Step 2: TF-IDF Vectorization
The combined text representation of each book $d$ is converted into a vector in the vocabulary space $V$:

$$\text{TF}(t, d) = \frac{f_{t, d}}{\sum_{t' \in d} f_{t', d}}$$

$$\text{IDF}(t, D) = \ln\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1.0$$

$$\mathbf{v}_d(t) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

Vectors are $L_2$-normalized:

$$\hat{\mathbf{v}}_d = \frac{\mathbf{v}_d}{\|\mathbf{v}_d\|_2}$$

### Step 3: Cosine Similarity Scoring
For any two books $A$ and $B$, their content similarity is computed as the inner product of their unit vectors:

$$\text{Cosine Similarity}(A, B) = \hat{\mathbf{v}}_A \cdot \hat{\mathbf{v}}_B = \frac{\mathbf{v}_A \cdot \mathbf{v}_B}{\|\mathbf{v}_A\|_2 \|\mathbf{v}_B\|_2}$$

### Step 4: User Profile Synthesis
The student's preference profile is synthesized by aggregating:
1. Feature vectors of all previously borrowed books.
2. Selected academic interest genres (weighted $\times 3$).
3. Specified favorite authors (weighted $\times 2$).

### Step 5: Explainable Recommendations
For every recommended book, the system calculates:
- **Match Score (%):** Derived directly from the cosine similarity value.
- **Human-Readable Reason:** Dynamic rationale explaining why the item was selected (e.g., *"Recommended because you previously borrowed 'Artificial Intelligence: A Modern Approach' and follow author Stuart Russell"*).

---

## 6. Complete REST API Reference

### Authentication Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student account with preferences | Public |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token | Public |
| `GET` | `/api/auth/me` | Retrieve profile of authenticated user | Authenticated |

### Book Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/books` | Paginated catalog with query & category filter | Public |
| `GET` | `/api/books/{id}` | Get book details by ID | Public |
| `GET` | `/api/books/search` | Search books by keyword | Public |
| `POST` | `/api/books` | Add new book to inventory | Librarian / Admin |
| `PUT` | `/api/books/{id}` | Update existing book details | Librarian / Admin |
| `DELETE` | `/api/books/{id}` | Delete book from catalog | Librarian / Admin |

### Borrowing & Circulation Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/borrow/request` | Submit borrow request for available book | Student |
| `PUT` | `/api/borrow/{id}/approve` | Approve a pending borrow request | Librarian / Admin |
| `PUT` | `/api/borrow/{id}/reject` | Reject a borrow request with notes | Librarian / Admin |
| `PUT` | `/api/borrow/{id}/issue` | Physically issue book & decrement copies | Librarian / Admin |
| `PUT` | `/api/borrow/{id}/return` | Record book return & compute fines | Authenticated |
| `GET` | `/api/borrow/my-books` | Get user's active borrowed books | Student |
| `GET` | `/api/borrow/history` | Get user's complete borrow history | Student |
| `GET` | `/api/borrow/all` | Get all borrow transactions (filtered by status) | Librarian / Admin |
| `GET` | `/api/borrow/requests` | Get all pending borrow requests | Librarian / Admin |
| `GET` | `/api/borrow/overdue` | Get list of overdue active loans | Librarian / Admin |

### AI Recommendation Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/recommendations/me` | Get personalized recommendations | Student |
| `GET` | `/api/recommendations/similar/{id}` | Get books content-similar to ID | Public |
| `GET` | `/api/recommendations/popular` | Get trending / most borrowed books | Public |
| `GET` | `/api/recommendations/preferences` | Get user's preferred genres & authors | Student |
| `PUT` | `/api/recommendations/preferences` | Update genre & author preferences | Student |

### Dashboard & Analytics Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/student` | Active loans, fines, recommendations KPI | Student |
| `GET` | `/api/dashboard/librarian` | Inventory counts, circulation trends, queues | Librarian / Admin |
| `GET` | `/api/dashboard/admin` | System user metrics, categories, audit logs | Admin |

### Fines & Notifications Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/fines/my-fines` | View student fine balance | Student |
| `GET` | `/api/fines/all` | View all system fines | Librarian / Admin |
| `PUT` | `/api/fines/{id}/pay` | Record fine payment | Authenticated |
| `GET` | `/api/notifications` | Get in-app notification alerts | Authenticated |
| `PUT` | `/api/notifications/{id}/read` | Mark notification as read | Authenticated |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | Authenticated |

---

## 7. Project Structure

```
ai-library-management-system/
│
├── frontend/                                # React.js + Vite Application
│   ├── src/
│   │   ├── components/                      # Reusable UI components
│   │   │   ├── BookCard.jsx                 # Cover image, wishlist, borrow trigger
│   │   │   ├── BorrowModal.jsx              # Modal for borrow request submission
│   │   │   ├── ProtectedRoute.jsx           # Role-based route guard
│   │   │   ├── RecommendationBadge.jsx      # Similarity score & reason indicator
│   │   │   └── StatCard.jsx                 # Metric KPI card
│   │   ├── context/
│   │   │   └── AuthContext.jsx              # User session & JWT state provider
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx               # Responsive master layout
│   │   │   ├── Navbar.jsx                   # Top header with search & notifications
│   │   │   └── Sidebar.jsx                  # Role-aware navigation drawer
│   │   ├── pages/
│   │   │   ├── public/                      # Landing, Catalog, Book Details, Login, Register
│   │   │   ├── student/                     # Dashboard, Browse, Loans, History, AI Recs, Wishlist, Profile
│   │   │   ├── librarian/                   # Dashboard, Books, Students, Requests, Desk, Fines, Reports
│   │   │   └── admin/                       # Dashboard, User Directory, Librarians, Settings
│   │   ├── services/
│   │   │   └── api.js                       # Central Axios API client with JWT interceptor
│   │   ├── App.jsx                          # Main routing specification
│   │   ├── main.jsx                         # React DOM mount point
│   │   └── index.css                        # Tailwind CSS imports
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                                 # Spring Boot REST API
│   ├── src/main/java/com/library/
│   │   ├── config/                          # DataInitializer (Seed Data)
│   │   ├── controller/                      # 10 REST Controllers
│   │   ├── dto/                             # Data Transfer Objects
│   │   ├── entity/                          # JPA Entities (User, Book, BorrowRecord, Fine, etc.)
│   │   ├── exception/                       # GlobalExceptionHandler & Custom Exceptions
│   │   ├── repository/                      # Spring Data JPA Repositories
│   │   ├── security/                        # SecurityConfig, JwtTokenProvider, Filters
│   │   ├── service/                         # Business logic services
│   │   └── AiLibraryBackendApplication.java # Spring Boot main class
│   ├── src/main/resources/
│   │   ├── application.properties           # Main configuration
│   │   ├── application-h2.properties        # Zero-setup in-memory database
│   │   └── application-mysql.properties     # Production MySQL database
│   ├── src/test/java/com/library/           # JUnit 5 & MockMvc integration tests
│   └── pom.xml                              # Maven project definition
│
├── ai-recommendation-service/               # Python Recommendation Microservice
│   ├── data/
│   │   └── books.json                       # Corpus of book metadata
│   ├── preprocessing.py                     # Text normalization & feature combination
│   ├── recommender.py                       # TF-IDF, Cosine Similarity, and explanations
│   ├── main.py                              # FastAPI REST microservice + HTTP fallback
│   ├── test_recommender.py                  # Pytest / Unittest test suite
│   └── requirements.txt                     # Python dependencies
│
├── database/                                # Database Assets
│   ├── schema.sql                           # MySQL 8 table DDL definitions
│   └── sample_data.sql                      # Seed data script
│
├── start-all.bat                            # One-click startup script (all services)
├── start-backend.bat                        # Standalone backend starter
├── start-frontend.bat                       # Standalone frontend starter
├── start-ai-service.bat                     # Standalone AI service starter
└── README.md                                # Comprehensive documentation
```

---

## 8. Installation & Execution Guide

### Prerequisites
- **Java:** JDK 21 installed (`java -version`)
- **Maven:** Apache Maven 3.8+ (`mvn -v`)
- **Node.js:** Node v18+ and npm (`node -v`)
- **Python:** Python 3.10+ (`python --version`)
- *(Optional)* MySQL 8.0+ (Only required if not using the default zero-setup H2 profile)

---

### Option A: One-Click Startup (Recommended)

Simply double-click or run:
```bash
start-all.bat
```
This automatically launches the AI service on port 8000, the Spring Boot backend on port 8080, and the React frontend on port 5173 in separate terminals.

---

### Option B: Manual Step-by-Step Startup

#### Step 1: Start the AI Recommendation Service
```bash
cd ai-library-management-system/ai-recommendation-service
python main.py
```
*Service starts on `http://localhost:8000` with status health-check at `http://localhost:8000/health`.*

#### Step 2: Start the Spring Boot Backend
```bash
cd ai-library-management-system/backend
mvn spring-boot:run
```
*Backend initializes on `http://localhost:8080`. Seed data is loaded automatically on startup.*

*(To run against MySQL instead of H2, set `spring.profiles.active=mysql` in `src/main/resources/application.properties` and ensure `library_db` is created using `database/schema.sql`).*

#### Step 3: Start the React Frontend
```bash
cd ai-library-management-system/frontend
npm run dev
```
*Frontend opens at `http://localhost:5173`.*

---

## 9. Verification & Automated Testing

### 1. Run Spring Boot Backend Tests
```bash
cd ai-library-management-system/backend
mvn test
```
*Executes all 7 JUnit 5 & MockMvc integration tests (login, registration, book search, borrow lifecycle, stock updates, fine formula calculation).*

### 2. Run AI Recommendation Engine Tests
```bash
cd ai-library-management-system/ai-recommendation-service
python test_recommender.py
```
*Executes all 7 unit tests (text preprocessing, TF-IDF vectorization, cosine similarity, personalized filtering, and popularity fallback).*

### 3. Verify Frontend Production Build
```bash
cd ai-library-management-system/frontend
npm run build
```
*Builds production assets in `dist/` without any compilation errors.*

---

Render Link:https://ai-based-library-management-l70m.onrender.com
