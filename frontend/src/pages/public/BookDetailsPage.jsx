import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookApi, recommendationApi, wishlistApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookCard } from '../../components/BookCard';
import { BorrowModal } from '../../components/BorrowModal';
import { 
  BookOpen, 
  Heart, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Building, 
  Barcode, 
  Layers 
} from 'lucide-react';

export const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  useEffect(() => {
    loadBookDetails();
  }, [id]);

  const loadBookDetails = async () => {
    setLoading(true);
    try {
      const res = await bookApi.getById(id);
      setBook(res.data);
      setInWishlist(res.data?.inWishlist || false);

      // Load AI similar books
      const simRes = await recommendationApi.getSimilar(id, 4);
      setSimilarBooks(simRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (inWishlist) {
        await wishlistApi.remove(id);
        setInWishlist(false);
      } else {
        await wishlistApi.add(id);
        setInWishlist(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="py-16 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-800">Book Not Found</h3>
        <Link to="/catalog" className="text-xs font-semibold text-indigo-600 hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="space-y-12 py-4">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Book Primary Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: Book Cover */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-50">
              <img
                src={book.coverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={toggleWishlist}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
                  inWishlist
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right: Book Meta & Actions */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {book.genre}
                </span>
                {book.categoryName && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {book.categoryName}
                  </span>
                )}
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                  {isAvailable ? `${book.availableCopies} Copies Available` : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {book.title}
              </h1>

              <p className="text-sm font-semibold text-slate-600">
                by <span className="text-slate-900 font-bold">{book.author}</span>
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Barcode className="w-3 h-3" /> ISBN
                  </span>
                  <p className="text-xs font-bold text-slate-800">{book.isbn}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Building className="w-3 h-3" /> Publisher
                  </span>
                  <p className="text-xs font-bold text-slate-800">{book.publisher || 'N/A'}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Year
                  </span>
                  <p className="text-xs font-bold text-slate-800">{book.publicationYear || 'N/A'}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Inventory
                  </span>
                  <p className="text-xs font-bold text-slate-800">{book.availableCopies} / {book.totalCopies} Total</p>
                </div>
              </div>

              {/* Synopsis */}
              <div className="space-y-1.5 pt-1">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Book Overview</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {book.description || "No description provided for this volume."}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              {(!user || user.role === 'STUDENT') && (
                <button
                  onClick={() => {
                    if (!isAuthenticated) navigate('/login');
                    else setShowBorrowModal(true);
                  }}
                  disabled={!isAvailable}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all inline-flex items-center gap-2 disabled:opacity-40"
                >
                  <BookOpen className="w-4 h-4" />
                  {isAvailable ? 'Request Borrow' : 'Currently Unavailable'}
                </button>
              )}

              <button
                onClick={toggleWishlist}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors inline-flex items-center gap-2"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'text-rose-500 fill-rose-500' : ''}`} />
                {inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* AI Recommended Similar Books Section */}
      {similarBooks.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Similar Books Powered by AI
              </h2>
              <p className="text-xs text-slate-500">
                Calculated using TF-IDF feature vectors and Cosine Similarity against '{book.title}'
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarBooks.map((simBook) => (
              <BookCard
                key={simBook.id || simBook.bookId}
                book={simBook}
                isRecommendation={true}
                onWishlistChange={loadBookDetails}
              />
            ))}
          </div>
        </section>
      )}

      {showBorrowModal && (
        <BorrowModal
          book={book}
          isOpen={showBorrowModal}
          onClose={() => setShowBorrowModal(false)}
          onSuccess={loadBookDetails}
        />
      )}

    </div>
  );
};
