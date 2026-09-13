'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  PackageSearch,
} from 'lucide-react';

export default function SellPage() {
  const [products, setProducts] = useState([]);
  // แต่ละรายการในตะกร้า: { productId, sku, name, price, unit, stock, quantity }
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const hasStockIssue = cart.some((item) => item.quantity > item.stock);

  function addToCart(product) {
    setError('');
    setSuccess('');
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      if (product.stock <= 0) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          unit: product.unit,
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  }

  function changeQuantity(productId, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function resetCart() {
    setCart([]);
    setSearch('');
  }

  async function handleCheckout() {
    setError('');
    setSuccess('');

    if (cart.length === 0) {
      setError('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    if (hasStockIssue) {
      setError('มีสินค้าบางรายการเกินจำนวนคงเหลือ กรุณาปรับจำนวนก่อนขาย');
      return;
    }

    setSubmitting(true);

    // บันทึกทีละรายการ: เพิ่มแถวใน sales แล้วตัดสต็อกใน products
    for (const item of cart) {
      const total = item.price * item.quantity;

      const { error: saleError } = await supabase.from('sales').insert([
        {
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          total_price: total,
          sold_at: new Date().toISOString(),
        },
      ]);

      if (saleError) {
        setError(saleError.message);
        setSubmitting(false);
        fetchProducts();
        return;
      }

      const newStock = item.stock - item.quantity;
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.productId);

      if (stockError) {
        setError(stockError.message);
        setSubmitting(false);
        fetchProducts();
        return;
      }
    }

    setSuccess(`ขายสำเร็จ ${totalItems} ชิ้น รวม ${totalPrice.toFixed(2)} บาท`);
    resetCart();
    fetchProducts();
    setSubmitting(false);
  }

  return (
    <div className="sell-page">
      {/* แถบสรุปยอดรวม ลอยอยู่บนสุดตลอดเวลา ให้ทั้งผู้ขายและลูกค้าเห็นตัวเลขชัดเจน */}
      <div className="total-bar glass">
        <div>
          <span className="total-label">ยอดรวมทั้งหมด</span>
          <div className="total-amount">{totalPrice.toFixed(2)} บาท</div>
          <span className="total-sub">{totalItems} ชิ้น</span>
        </div>
        <button
          type="button"
          className="btn btn-accent btn-lg"
          onClick={handleCheckout}
          disabled={submitting || cart.length === 0 || hasStockIssue}
        >
          <CheckCircle2 size={20} />
          {submitting ? 'กำลังบันทึก...' : 'ยืนยันการขาย'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="sell-layout">
        <section className="glass panel">
          <div className="panel-header">
            <h2>เลือกสินค้า</h2>
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="ค้นหาสินค้า หรือ SKU"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="empty-state">กำลังโหลดสินค้า...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <PackageSearch size={32} />
              <p>ไม่พบสินค้าที่ค้นหา</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const inCart = cart.find((item) => item.productId === product.id);
                const remaining = product.stock - (inCart ? inCart.quantity : 0);
                return (
                  <button
                    key={product.id}
                    type="button"
                    className="product-tile"
                    onClick={() => addToCart(product)}
                    disabled={remaining <= 0}
                  >
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">
                      {Number(product.price).toFixed(2)} บาท
                    </span>
                    <span className="product-stock">
                      คงเหลือ {remaining} {product.unit}
                    </span>
                    <span className="product-add">
                      <Plus size={16} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="glass panel cart-panel">
          <div className="panel-header">
            <h2>
              <ShoppingCart size={18} />
              ตะกร้าสินค้า
            </h2>
          </div>

          {cart.length === 0 ? (
            <p className="empty-state">ยังไม่มีสินค้าในตะกร้า</p>
          ) : (
            <ul className="cart-list">
              {cart.map((item) => {
                const overStock = item.quantity > item.stock;
                return (
                  <li
                    key={item.productId}
                    className={overStock ? 'cart-item cart-item-warning' : 'cart-item'}
                  >
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-price">
                        {item.price.toFixed(2)} บาท / {item.unit}
                      </span>
                      {overStock && (
                        <span className="cart-item-warning-text">
                          เกินคงเหลือ ({item.stock} {item.unit})
                        </span>
                      )}
                    </div>

                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => changeQuantity(item.productId, -1)}
                        aria-label="ลดจำนวน"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => changeQuantity(item.productId, 1)}
                        aria-label="เพิ่มจำนวน"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="cart-item-total">
                      {(item.price * item.quantity).toFixed(2)} บาท
                    </span>

                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      onClick={() => removeFromCart(item.productId)}
                      aria-label="ลบออกจากตะกร้า"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {cart.length > 0 && (
            <div className="cart-summary">
              <span>รวม {totalItems} ชิ้น</span>
              <span className="cart-summary-total">{totalPrice.toFixed(2)} บาท</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
