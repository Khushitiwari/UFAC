import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createContactSchema,
  parseAddressFields,
  toContactPayload,
} from '../../validators/contact.schema.js';
import Button from '../common/Button.jsx';
import { Avatar } from '../common/KanbanBoard.jsx';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const defaultValues = {
  name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  address: '',
  type: 'CUSTOMER',
  taxId: '',
  imageUrl: '',
  createPortalUser: false,
  portalPassword: '',
  portalUserName: '',
};

const ContactForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Confirm',
  allowPortalUser = false,
  showPortalFields = true,
}) => {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(() => ({
    ...defaultValues,
    ...parseAddressFields(initialValues?.address),
    ...initialValues,
    createPortalUser: false,
    portalPassword: '',
    portalUserName: initialValues?.name || '',
  }));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...defaultValues,
        ...parseAddressFields(initialValues.address),
        ...initialValues,
        createPortalUser: false,
        portalPassword: '',
        portalUserName: initialValues.name || '',
      });
    }
  }, [initialValues]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, imageUrl: 'Please select an image file (JPG, PNG, or WebP)' }));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({ ...prev, imageUrl: 'Image must be under 2 MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, imageUrl: reader.result }));
      setErrors((prev) => ({ ...prev, imageUrl: undefined }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setForm((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const result = createContactSchema.safeParse(form);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setErrors({});
      try {
        const payload = toContactPayload(form, { includePortalUser: allowPortalUser });
        await onSubmit(payload);
      } catch (err) {
        setErrors({ form: err.response?.data?.error || 'Failed to save contact' });
      }
    },
    [form, onSubmit, allowPortalUser],
  );

  return (
    <form onSubmit={handleSubmit} className="master-form">
      {errors.form && <div className="alert-error">{errors.form}</div>}

      <div className="master-form-layout">
        <div className="master-form-fields">
          <div className="form-group">
            <label htmlFor="name">Contact Name *</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Company or person name" />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Unique Email *</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="contact@company.com" />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="type">Contact Type *</label>
            <select id="type" name="type" value={form.type} onChange={handleChange}>
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="street">Street</label>
            <input id="street" name="street" value={form.street || ''} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input id="city" name="city" value={form.city || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input id="state" name="state" value={form.state || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input id="country" name="country" value={form.country || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input id="pincode" name="pincode" value={form.pincode || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="taxId">Tax ID</label>
            <input id="taxId" name="taxId" value={form.taxId || ''} onChange={handleChange} />
          </div>

          {allowPortalUser && showPortalFields && (
            <div className="portal-user-section">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="createPortalUser"
                  checked={form.createPortalUser}
                  onChange={handleChange}
                />
                Create portal login (customer/vendor user)
              </label>
              {form.createPortalUser && (
                <>
                  <div className="form-group">
                    <label htmlFor="portalUserName">Portal display name</label>
                    <input
                      id="portalUserName"
                      name="portalUserName"
                      value={form.portalUserName || ''}
                      onChange={handleChange}
                      placeholder={form.name || 'Same as contact name'}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="portalPassword">Portal password *</label>
                    <input
                      id="portalPassword"
                      name="portalPassword"
                      type="password"
                      value={form.portalPassword || ''}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                    />
                    {errors.portalPassword && <div className="form-error">{errors.portalPassword}</div>}
                  </div>
                  <p className="field-hint">User signs in with the contact email and this password. Role: CONTACT.</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="master-form-aside">
          <label htmlFor="contact-image">Contact Photo</label>
          <button
            type="button"
            className="upload-placeholder upload-placeholder-clickable"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar name={form.name || 'Contact'} imageUrl={form.imageUrl} size={88} />
            <span>{form.imageUrl ? 'Change photo' : 'Upload image'}</span>
            <span className="upload-hint">JPG, PNG, WebP · max 2 MB</span>
          </button>
          <input
            ref={fileInputRef}
            id="contact-image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleImageChange}
          />
          {errors.imageUrl && <div className="form-error">{errors.imageUrl}</div>}
          {form.imageUrl && (
            <button type="button" className="upload-remove-btn" onClick={handleRemoveImage}>
              Remove photo
            </button>
          )}
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Back
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};

export default ContactForm;
