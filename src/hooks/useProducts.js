import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const PRODUCT_SELECT =
  "*, shops:shop_id ( shop_name, slug, whatsapp_number ), categories:category_id ( name, slug )";

export function useLatestProducts({ limit = 8 } = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!active) return;
      if (error) setError(error.message);
      else setProducts(data ?? []);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [limit]);

  return { products, loading, error };
}

export function useProductsByCategory(categorySlug) {
  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categorySlug) return;
    let active = true;
    async function load() {
      setLoading(true);
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();

      if (!category) {
        if (active) {
          setProducts([]);
          setSubCategories([]);
          setLoading(false);
        }
        return;
      }

      // এই ক্যাটাগরির সাব-ক্যাটাগরি (থাকলে) খুঁজে বের করা হচ্ছে — মূল ক্যাটাগরিতে
      // ঢুকলে এর সব সাব-ক্যাটাগরির পণ্যও একসাথে দেখানো হবে
      const { data: children } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("parent_id", category.id)
        .order("sort_order", { ascending: true });

      const categoryIds = [category.id, ...(children ?? []).map((c) => c.id)];

      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .in("category_id", categoryIds)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) setError(error.message);
      else setProducts(data ?? []);
      setSubCategories(children ?? []);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [categorySlug]);

  return { products, subCategories, loading, error };
}

export function useProductBySlug(slug) {
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`${PRODUCT_SELECT}`)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (!active) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setProduct(data);

      const { data: imgs } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", data.id)
        .order("sort_order", { ascending: true });

      if (active) {
        setImages(imgs ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  return { product, images, loading, error };
}

export function useProductSearch(query) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      return;
    }
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_active", true)
        .ilike("name", `%${query}%`)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) setError(error.message);
      else setProducts(data ?? []);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [query]);

  return { products, loading, error };
}
