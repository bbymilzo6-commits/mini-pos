'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Pencil, Trash2, Check, X, PackageSearch } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    unit: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    unit: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!form.sku || !form.name || !form.price || !form.stock || !form.unit) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    setError('');
    const { error } = await supabase.from('products').insert([
      {
        sku: form.sku,
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        unit: form.unit,
      },
    ]);

    if (error) {
      setError(error.message);
      return;
    }

    setForm({ sku: '', name: '', price: '', stock: '', unit: '' });
    fetchProducts();
  }

  async function handleDeleteProduct(id) {
    if (!confirm('ยืนยันการลบสินค้านี้?')) return;

    setError('');
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    fetchProducts();
  }

  function startEdit(product) {
    setEditingId(product.id);
    setEditForm({
      sku: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ sku: '', name: '', price: '', stock: '', unit: '' });
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveEdit(id) {
    if (!editForm.sku || !editForm.name || !editForm.price || !editForm.stock || !editForm.unit) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    setError('');
    const { error } = await supabase
      .from('products')
      .update({
        sku: editForm.sku,
        name: editForm.name,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock, 10),
        unit: editForm.unit,
      })
      .eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    cancelEdit();
    fetchProducts();
  }

  return (
    <div>
      <h1 className="page-title">รายการสินค้า</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="glass card">
        <h2 className="section-title">
          <Plus size={18} />
          เพิ่มสินค้าใหม่
        </h2>
        <form onSubmit={handleAddProduct}>
          <div className="form-row">
            <input
              type="text"
              name="sku"
              placeholder="SKU"
              value={form.sku}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="name"
              placeholder="ชื่อสินค้า"
              value={form.name}
              onChange={handleFormChange}
            />
            <input
              type="number"
              name="price"
              placeholder="ราคา"
              value={form.price}
              onChange={handleFormChange}
              step="0.01"
            />
            <input
              type="number"
              name="stock"
              placeholder="คงเหลือ"
              value={form.stock}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="unit"
              placeholder="หน่วย"
              value={form.unit}
              onChange={handleFormChange}
            />
            <button type="submit" className="btn btn-accent">
              <Plus size={16} />
              เพิ่มสินค้า
            </button>
          </div>
        </form>
      </div>

      <div className="glass card">
        {loading ? (
          <p className="empty-state">กำลังโหลดข้อมูล...</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <PackageSearch size={32} />
            <p>ยังไม่มีสินค้าในระบบ</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>ชื่อสินค้า</th>
                  <th>ราคา</th>
                  <th>คงเหลือ</th>
                  <th>หน่วย</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    {editingId === product.id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            name="sku"
                            value={editForm.sku}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="price"
                            value={editForm.price}
                            onChange={handleEditChange}
                            step="0.01"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="stock"
                            value={editForm.stock}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="unit"
                            value={editForm.unit}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => handleSaveEdit(product.id)}
                              aria-label="บันทึก"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={cancelEdit}
                              aria-label="ยกเลิก"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{product.sku}</td>
                        <td>{product.name}</td>
                        <td>{Number(product.price).toFixed(2)}</td>
                        <td>{product.stock}</td>
                        <td>{product.unit}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => startEdit(product)}
                              aria-label="แก้ไข"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn icon-btn-danger"
                              onClick={() => handleDeleteProduct(product.id)}
                              aria-label="ลบ"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
