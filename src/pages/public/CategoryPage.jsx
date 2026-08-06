import { useParams } from "react-router-dom";
import { Package } from "lucide-react";
import { useProductsByCategory } from "@/hooks/useProducts";
import ProductCard from "@/components/shared/ProductCard.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";

export default function CategoryPage() {
  const { slug } = useParams();
  const { products, loading } = useProductsByCategory(slug);

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
        ক্যাটাগরির পণ্যসমূহ
      </h1>

      {loading ? (
        <LoadingSpinner label="পণ্য লোড হচ্ছে..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই"
          description="পরে আবার চেষ্টা করুন অথবা অন্য ক্যাটাগরি দেখুন।"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
