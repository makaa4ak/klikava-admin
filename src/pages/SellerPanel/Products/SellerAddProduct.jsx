import { Input, Button, Select, message } from 'antd'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SellerAddProduct.module.css'
import api from '../../../api/axios'

function SellerAddProduct() {
  const navigate = useNavigate()
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState('')
  const [price, setPrice]             = useState('')
  const [stock, setStock]             = useState('')
  const [skuCode, setSkuCode]         = useState('')
  const [categoryId, setCategoryId]   = useState(null)
  const [categories, setCategories]   = useState([])
  const [status, setStatus]           = useState('PENDING')
  const [image, setImage]             = useState(null)
  const [gallery, setGallery]         = useState([])
  const [activeTab, setActiveTab]     = useState('price')
  const [loading, setLoading]         = useState(false)
  const imageRef   = useRef()
  const galleryRef = useRef()

  useEffect(() => {
    api.get('/categories').then(res => {
      const items = res.data?.data?.items ?? []
      setCategories(items.map(c => ({ value: c.id, label: c.name })))
    }).catch(() => {})
  }, [])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) setImage(URL.createObjectURL(file))
  }

  const handleGallery = (e) => {
    const files = Array.from(e.target.files)
    setGallery(files.map(f => URL.createObjectURL(f)))
  }

  const handlePublish = async () => {
    if (!title) return message.error('Please enter product name')
    if (!price)  return message.error('Please enter price')
    if (!categoryId) return message.error('Please select category')

    const user     = JSON.parse(localStorage.getItem('user') || '{}')
    const sellerId = user?.seller_id || user?.id

    setLoading(true)
    try {
      await api.post('/products', {
        title,
        description:   description || undefined,
        delivery_info: deliveryInfo || undefined,
        category_id:   categoryId,
        seller_id:     sellerId,
        status,
        variants: [
          {
            sku_code: skuCode || undefined,
            price:    parseFloat(price),
            stock:    parseInt(stock) || 0,
          }
        ],
      })
      message.success('Product published!')
      navigate('/seller/products')
    } catch (err) {
  console.log('Error status:', err.response?.status)
  console.log('Error data:', err.response?.data)
  message.error(err.response?.data?.detail || 'Failed to publish product')
} finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'price':
        return (
          <div className={styles.tabContent}>
            <div className={styles.dataRow}>
              <span>Price (₴)</span>
              <Input value={price} onChange={e => setPrice(e.target.value)} className={styles.smallInput} placeholder="0" />
            </div>
          </div>
        )
      case 'categories':
        return (
          <div className={styles.tabContent}>
            <div className={styles.dataRow}>
              <span>Category</span>
              <Select
                placeholder="Select"
                style={{ width: 160 }}
                value={categoryId}
                onChange={setCategoryId}
                options={categories}
              />
            </div>
          </div>
        )
      case 'sku':
        return (
          <div className={styles.tabContent}>
            <div className={styles.dataRow}>
              <span>SKU</span>
              <Input value={skuCode} onChange={e => setSkuCode(e.target.value)} className={styles.smallInput} />
            </div>
          </div>
        )
      case 'quantity':
        return (
          <div className={styles.tabContent}>
            <div className={styles.dataRow}>
              <span>Stock</span>
              <Input value={stock} onChange={e => setStock(e.target.value)} className={styles.smallInput} placeholder="0" />
            </div>
          </div>
        )
      case 'delivery':
        return (
          <div className={styles.tabContent}>
            <div className={styles.dataRow}>
              <span>Delivery info</span>
              <Input value={deliveryInfo} onChange={e => setDeliveryInfo(e.target.value)} className={styles.smallInput} />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Add product</h2>
        <Button className={styles.publishBtn} onClick={handlePublish} loading={loading}>
          Publish
        </Button>
      </div>

      <div className={styles.body}>
        <div className={styles.left}>
          <Input
            placeholder="Product Name"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={styles.nameInput}
          />

          <div className={styles.box}>
            <p className={styles.boxLabel}>Products Description</p>
            <Input.TextArea
              rows={8}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={styles.textarea}
              bordered={false}
            />
          </div>

          <div className={styles.box}>
            <p className={styles.boxLabel}>Products Data</p>
            <div className={styles.dataGrid}>
              <div className={styles.dataLeft}>
                {[
                  { key: 'price',      label: 'Price' },
                  { key: 'categories', label: 'Categories' },
                  { key: 'sku',        label: 'SKU' },
                  { key: 'quantity',   label: 'Quantity' },
                  { key: 'delivery',   label: 'Delivery' },
                ].map(tab => (
                  <div
                    key={tab.key}
                    className={`${styles.dataTab} ${activeTab === tab.key ? styles.dataTabActive : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
              <div className={styles.dataRight}>
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.box}>
            <p className={styles.boxLabel}>Publish</p>
            <div className={styles.statusRow}>
              <span>Status: </span>
              <Select
                value={status}
                onChange={setStatus}
                style={{ width: 130 }}
                options={[
                  { value: 'PENDING',   label: 'Pending' },
                  { value: 'ACTIVE',    label: 'Active' },
                  { value: 'INACTIVE',  label: 'Inactive' },
                ]}
              />
            </div>
          </div>

          <div className={styles.box}>
            <p className={styles.boxLabel}>Product Image</p>
            <div className={styles.imageWrap}>
              <Button className={styles.addImgBtn} onClick={() => imageRef.current.click()}>Add</Button>
              {image
                ? <img src={image} alt="product" className={styles.previewImg} />
                : <div className={styles.imagePlaceholder} />
              }
              <input type="file" ref={imageRef} style={{ display: 'none' }} accept="image/*" onChange={handleImage} />
            </div>
          </div>

          <div className={styles.box}>
            <p className={styles.boxLabel}>Product Gallery</p>
            <div className={styles.imageWrap}>
              <Button className={styles.addImgBtn} onClick={() => galleryRef.current.click()}>Add</Button>
              <div className={styles.galleryGrid}>
                {gallery.map((img, i) => (
                  <img key={i} src={img} alt="gallery" className={styles.galleryImg} />
                ))}
                {gallery.length === 0 && <div className={styles.imagePlaceholder} />}
              </div>
              <input type="file" ref={galleryRef} style={{ display: 'none' }} multiple accept="image/*" onChange={handleGallery} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerAddProduct