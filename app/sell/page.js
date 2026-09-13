'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SellPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');

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

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const parsedQuantity = parseInt(quantity, 10);
  const totalPrice =
    selectedProduct && !isNaN(parsedQuantity) && parsedQuantity > 0
      ? selectedProduct.price * parsedQuantity
      : 0;

  function resetForm() {
    setSelectedProductId('');
    setQuantity('');
  }

  async function handleSell(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedProductId) {
      setError('กรุณาเลือกสินค้า');
      return;
    }

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError('กรุณากรอกจำนวนให้ถูกต้อง');
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      setError('ไม่พบสินค้าที่เลือก');
      return;
    }

    if (parsedQuantity > product.stock) {
      setError(`สินค้าคงเหลือไม่พอ (คงเหลือ ${product.stock} ${product.unit})`);
      return;
    }

    setSubmitting(true);

    const total = product.price * parsedQuantity;

    const { error: saleError } = await supabase.from('sales').insert([
      {
        product_id: product.id,
        product_name: product.name,
        quantity: parsedQuantity,
        total_price: total,
        sold_at: new Date().toISOString(),
      },
    ]);

    if (saleError) {
      setError(saleError.message);
      setSubmitting(false);
      return;
    }

    const newStock = product.stock - parsedQuantity;
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', product.id);

    if (stockError) {
      setError(stockError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(`ขายสำเร็จ: ${product.name} จำนวน ${parsedQuantity} ${product.unit} รวม ${total.toFixed(2)} บาท`);
    resetForm();
    fetchProducts();
    setSubmitting(false);
  }

  return (
    <div>
      <h1>ขายสินค้า</h1>

      {error && (
        <div className="card" style={{ color: '#dc2626', backgroundColor: '#fef2f2' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="card" style={{ color: '#16a34a', backgroundColor: '#f0fdf4' }}>
          {success}
        </div>
      )}

      <div className="card">
        {loading ? (
          <p>กำลังโหลดข้อมูลสินค้า...</p>
        ) : products.length === 0 ? (
          <p>ยังไม่มีสินค้าในระบบ กรุณาเพิ่มสินค้าก่อน</p>
        ) : (
          <form onSubmit={handleSell}>
            <div className="form-row">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">-- เลือกสินค้า --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({Number(product.price).toFixed(2)} บาท) — คงเหลือ {product.stock} {product.unit}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="จำนวน"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div>
                <strong>ยอดรวม: {totalPrice.toFixed(2)} บาท</strong>
              </div>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? 'กำลังบันทึก...' : 'ขาย'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
