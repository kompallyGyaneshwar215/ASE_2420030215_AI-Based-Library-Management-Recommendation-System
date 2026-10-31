import React, { useState, useEffect } from 'react';
import { wishlistApi } from '../../services/api';
import { BookCard } from '../../components/BookCard';
import { Heart, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const res = await wishlistApi.getAll();
      setWishlist(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Saved Wishlist</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Books you've bookmarked for upcoming semesters and research projects.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the heart icon on any book card in the catalog to save it to your wishlist.
          </p>
          <div className="pt-2">
            <Link
              to="/student/browse"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-200 inline-block"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((book) => (
            <BookCard
              key={book.id}
              book={{ ...book, inWishlist: true }}
              onWishlistChange={loadWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};
