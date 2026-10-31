import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { wishlistApi } from '../services/api';
import { BorrowModal } from './BorrowModal';
import { RecommendationBadge } from './RecommendationBadge';
import { Heart, BookOpen, Check, Layers } from 'lucide-react';

export const BookCard = ({ book, onWishlistChange, isRecommendation = false }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [inWishlist, setInWishlist] = useState(book.inWishlist || false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await wishlistApi.remove(book.id || book.bookId);
        setInWishlist(false);
      } else {
        await wishlistApi.add(book.id || book.bookId);
        setInWishlist(true);
      }
      onWishlistChange && onWishlistChange();
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleBorrowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowBorrowModal(true);
  };

  const bookId = book.id || book.bookId;
  const isAvailable = book.availableCopies > 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col group">
        
        {/* Cover image container */}
        <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
          <img
            src={book.coverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
              inWishlist
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white'
            }`}
            title={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Category Chip */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs tracking-wide">
              {book.genre || book.categoryName || 'General'}
            </span>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <Link to={`/books/${bookId}`} className="block">
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1" title={book.title}>
                {book.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              by {book.author}
            </p>

            {/* Recommendation Score & Reason */}
            {isRecommendation && book.similarityScore && (
              <div className="mt-2.5 pt-2 border-t border-slate-100">
                <RecommendationBadge score={book.similarityScore} reason={book.reason} />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              <span className={`text-[11px] font-semibold ${isAvailable ? 'text-emerald-700' : 'text-slate-400'}`}>
                {isAvailable ? `${book.availableCopies} Copies Available` : 'Unavailable'}
              </span>
            </div>

            {(!user || user.role === 'STUDENT') && (
              <button
                onClick={handleBorrowClick}
                disabled={!isAvailable}
                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                Borrow
              </button>
            )}
          </div>

        </div>
      </div>

      {showBorrowModal && (
        <BorrowModal
          book={{ ...book, id: bookId }}
          isOpen={showBorrowModal}
          onClose={() => setShowBorrowModal(false)}
          onSuccess={() => onWishlistChange && onWishlistChange()}
        />
      )}
    </>
  );
};
