import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { BookCatalogPage } from './pages/public/BookCatalogPage';
import { BookDetailsPage } from './pages/public/BookDetailsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { BrowseBooksPage } from './pages/student/BrowseBooksPage';
import { MyBorrowedBooksPage } from './pages/student/MyBorrowedBooksPage';
import { BorrowingHistoryPage } from './pages/student/BorrowingHistoryPage';
import { AiRecommendationsPage } from './pages/student/AiRecommendationsPage';
import { WishlistPage } from './pages/student/WishlistPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Librarian Pages
import { LibrarianDashboard } from './pages/librarian/LibrarianDashboard';
import { ManageBooksPage } from './pages/librarian/ManageBooksPage';
import { ManageStudentsPage } from './pages/librarian/ManageStudentsPage';
import { BorrowRequestsPage } from './pages/librarian/BorrowRequestsPage';
import { IssueReturnDeskPage } from './pages/librarian/IssueReturnDeskPage';
import { OverdueFinesPage } from './pages/librarian/OverdueFinesPage';
import { LibraryReportsPage } from './pages/librarian/LibraryReportsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { LibrarianManagementPage } from './pages/admin/LibrarianManagementPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="catalog" element={<BookCatalogPage />} />
            <Route path="books" element={<BookCatalogPage />} />
            <Route path="books/:id" element={<BookDetailsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Student Protected Routes */}
            <Route
              path="student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'LIBRARIAN', 'ADMIN']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/browse"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'LIBRARIAN', 'ADMIN']}>
                  <BrowseBooksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/my-books"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'LIBRARIAN', 'ADMIN']}>
                  <MyBorrowedBooksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/history"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'LIBRARIAN', 'ADMIN']}>
                  <BorrowingHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/recommendations"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'LIBRARIAN', 'ADMIN']}>
                  <AiRecommendationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/wishlist"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'LIBRARIAN', 'ADMIN']}>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/notifications"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'LIBRARIAN', 'ADMIN']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'LIBRARIAN', 'ADMIN']}>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Librarian Protected Routes */}
            <Route
              path="librarian/dashboard"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <LibrarianDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="librarian/books"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <ManageBooksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="librarian/students"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <ManageStudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="librarian/requests"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <BorrowRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="librarian/desk"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <IssueReturnDeskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="librarian/fines"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <OverdueFinesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="librarian/reports"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <LibraryReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/librarians"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <LibrarianManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <SystemSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
