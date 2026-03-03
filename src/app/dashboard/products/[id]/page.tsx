import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ProductService } from '@/services/productService';
import styles from '../new/new-product.module.css';

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await ProductService.getProduct(id);

    if (!product) notFound();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Edit Product</h1>
                <p className={styles.subtitle}>Update your product details and availability.</p>
            </div>

            <form className={`card ${styles.formCard}`}>
                <div className={styles.formGrid}>
                    <div className={styles.mainFields}>
                        <div className="input-group">
                            <label className="input-label">Product Name</label>
                            <input type="text" className="input-field" defaultValue={product.name} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Description</label>
                            <textarea className="input-field" rows={5} defaultValue={product.description} />
                        </div>

                        <div className={styles.row}>
                            <div className="input-group">
                                <label className="input-label">Price (₦)</label>
                                <input type="number" className="input-field" defaultValue={product.price} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Stock Quantity</label>
                                <input type="number" className="input-field" defaultValue={product.stock_quantity} required />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Category</label>
                            <select className="input-field" defaultValue={product.category}>
                                <option>Accessories</option>
                                <option>Fashion</option>
                                <option>Electronics</option>
                                <option>Home</option>
                                <option>Beauty</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.sideFields}>
                        <label className="input-label">Product Image</label>
                        <div className={styles.imageUpload}>
                            {product.image_url ? (
                                <>
                                    <Image
                                        src={product.image_url}
                                        alt="Preview"
                                        width={400}
                                        height={400}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                    />
                                </>
                            ) : (
                                <>
                                    <span>📸</span>
                                    <p>Click to change image</p>
                                </>
                            )}
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: 'var(--space-sm)' }}>
                            Recommended: 1000x1000px, PNG or JPG.
                        </p>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" className="btn btn-ghost">Discard Changes</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    );
}
