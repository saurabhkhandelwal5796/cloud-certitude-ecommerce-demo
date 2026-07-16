import React from "react";

interface ReviewType {
  name: string;
  rating: number;
  review: string;
  date: string;
}

interface ProductReviewsProps {
  rating: number;
  reviewCount: number;
  reviews: ReviewType[];
}

/**
 * ProductReviews Component
 *
 * Renders the rating summary charts and detailed verified customer review listings.
 * Styled in warm cream, soft borders, and gold star details.
 */
export default function ProductReviews({ rating, reviewCount, reviews }: ProductReviewsProps) {
  // Mock distributions for stars
  const distributions = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 6 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <div className="border-t border-stone-200/50 py-16">
      <h2 className="text-xl font-black text-stone-900 tracking-wider uppercase mb-10 text-left">
        Customer Reviews
      </h2>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: Star stats overview breakdown */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 text-left">
          <div>
            <h3 className="text-sm font-bold text-stone-700 uppercase tracking-widest">
              Review Summary
            </h3>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-4xl font-extrabold text-stone-900">{rating.toFixed(1)}</span>
              <span className="text-sm text-stone-400 font-light">out of 5.0</span>
            </div>
            {/* Stars */}
            <div className="flex text-amber-400 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(rating) ? "fill-current" : "text-stone-200"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.03a1 1 0 00-1.175 0l-2.8 2.03c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mt-2 text-xs text-stone-400 font-light">Based on {reviewCount} ratings</p>
          </div>

          {/* Star breakdown bar charts */}
          <div className="space-y-3">
            {distributions.map((d) => (
              <div key={d.stars} className="flex items-center gap-4 text-xs">
                <span className="w-12 text-stone-500 font-semibold">{d.stars} Stars</span>
                {/* Bar */}
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E0A99E] rounded-full"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-stone-400 font-bold">{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Customer reviews list (5 reviews) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8 text-left">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-3 pb-8 ${
                idx < reviews.length - 1 ? "border-b border-stone-100" : ""
              }`}
            >
              {/* Stars & verified buyer badge */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4.5 w-4.5 ${i < r.rating ? "fill-current" : "text-stone-250"}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.03a1 1 0 00-1.175 0l-2.8 2.03c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[10px] font-extrabold text-[#E0A99E] uppercase tracking-wider flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Buyer
                </span>
              </div>

              {/* Customer details */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-extrabold text-stone-850">{r.name}</span>
                <span className="text-stone-300">&middot;</span>
                <span className="text-stone-400 font-light">{r.date}</span>
              </div>

              {/* Review text */}
              <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-light">
                &ldquo;{r.review}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
