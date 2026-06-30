import { useState } from 'react'

const LOCKABLE_FIELDS = new Set(['name', 'email', 'phone', 'address', 'addressDetail'])

function CheckoutForm({ checkoutForm, errors, onChange }) {
  const [editableFields, setEditableFields] = useState({})

  const hasLockedValue = (field) =>
    LOCKABLE_FIELDS.has(field) &&
    Boolean(String(checkoutForm[field] ?? '').trim())

  const isEditing = (field) => Boolean(editableFields[field])

  const isLocked = (field) =>
    hasLockedValue(field) &&
    !isEditing(field)

  const toggleFieldEdit = (field) => {
    setEditableFields((currentFields) => ({
      ...currentFields,
      [field]: !currentFields[field],
    }))
  }

  const inputRowClassName = (field) =>
    [
      'checkout-input-row',
      isLocked(field) ? 'is-locked' : '',
      isEditing(field) ? 'is-editing' : '',
    ]
      .filter(Boolean)
      .join(' ')

  const renderFieldAction = (field) => {
    if (!hasLockedValue(field)) return null

    return (
      <button
        type="button"
        className={isEditing(field) ? 'is-confirming' : ''}
        onClick={() => toggleFieldEdit(field)}
      >
        {isEditing(field) ? '확인' : '변경하기'}
      </button>
    )
  }

  return (
    <div className="checkout-fields">
      <div className="checkout-field">
        <span>Name</span>
        <div className={inputRowClassName('name')}>
          <input
            readOnly={isLocked('name')}
            value={checkoutForm.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Customer name"
          />
          {renderFieldAction('name')}
        </div>
      </div>

      <div className="checkout-field">
        <span>Email</span>
        <div className={inputRowClassName('email')}>
          <input
            readOnly={isLocked('email')}
            type="email"
            value={checkoutForm.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="name@example.com"
          />
          {renderFieldAction('email')}
        </div>
      </div>

      <div className="checkout-field">
        <span>Phone</span>
        <div className={inputRowClassName('phone')}>
          <input
            readOnly={isLocked('phone')}
            inputMode="numeric"
            maxLength="13"
            value={checkoutForm.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            placeholder="010-0000-0000"
          />
          {renderFieldAction('phone')}
        </div>
      </div>

      <div className="checkout-field full-width">
        <span>Address</span>
        <div className={inputRowClassName('address')}>
          <textarea
            readOnly={isLocked('address')}
            value={checkoutForm.address}
            onChange={(event) => onChange('address', event.target.value)}
            placeholder="Shipping address"
            rows="3"
          />
          {renderFieldAction('address')}
        </div>
      </div>

      <div className="checkout-field full-width">
        <span>Address detail</span>
        <div className={inputRowClassName('addressDetail')}>
          <input
            readOnly={isLocked('addressDetail')}
            value={checkoutForm.addressDetail}
            onChange={(event) => onChange('addressDetail', event.target.value)}
            placeholder="Apartment, suite, unit"
          />
          {renderFieldAction('addressDetail')}
        </div>
      </div>

      <label className="full-width">
        Delivery request
        <textarea
          value={checkoutForm.deliveryRequest}
          onChange={(event) => onChange('deliveryRequest', event.target.value)}
          placeholder="Delivery instructions"
          rows="2"
        />
      </label>

      {errors.length > 0 && (
        <ul className="form-errors">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CheckoutForm
