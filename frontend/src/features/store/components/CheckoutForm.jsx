import { useState } from 'react'

const LOCKABLE_FIELDS = new Set(['name', 'email', 'phone', 'address'])
const DELIVERY_REQUEST_OPTIONS = [
  '문 앞에 놓고 가주세요',
  '배송 전에 연락 주세요',
  '벨 눌러주세요',
  '부재 시 경비실에 맡겨주세요',
  '택배함에 넣어주세요',
]

function CheckoutForm({ checkoutForm, errors, onChange, onConfirmField }) {
  const [editableFields, setEditableFields] = useState({})
  const [savingField, setSavingField] = useState('')
  const [isDeliveryRequestOpen, setIsDeliveryRequestOpen] = useState(false)
  const [isDeliveryRequestCustom, setIsDeliveryRequestCustom] = useState(false)
  const deliveryRequest = String(checkoutForm.deliveryRequest ?? '')
  const isPredefinedDeliveryRequest = DELIVERY_REQUEST_OPTIONS.includes(deliveryRequest)
  const isDeliveryRequestEditable =
    isDeliveryRequestCustom || (Boolean(deliveryRequest.trim()) && !isPredefinedDeliveryRequest)

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

  const handleFieldAction = async (field) => {
    if (isEditing(field) && onConfirmField) {
      setSavingField(field)
      try {
        await onConfirmField(field)
      } catch {
        return
      } finally {
        setSavingField('')
      }
    }

    toggleFieldEdit(field)
  }

  const renderFieldAction = (field) => {
    if (!hasLockedValue(field)) return null
    const isSaving = savingField === field

    return (
      <button
        type="button"
        className={isEditing(field) ? 'is-confirming' : ''}
        disabled={isSaving}
        onClick={() => void handleFieldAction(field)}
      >
        {isEditing(field) ? (isSaving ? 'Saving' : '확인') : '변경하기'}
      </button>
    )
  }

  const handleDeliveryRequestBlur = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return
    }
    setIsDeliveryRequestOpen(false)
    if (onConfirmField) void onConfirmField('deliveryRequest')
  }

  const selectDeliveryRequest = (option) => {
    onChange('deliveryRequest', option)
    setIsDeliveryRequestCustom(false)
    setIsDeliveryRequestOpen(false)
  }

  const selectCustomDeliveryRequest = () => {
    onChange('deliveryRequest', '')
    setIsDeliveryRequestCustom(true)
    setIsDeliveryRequestOpen(false)
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
            onBlur={() => {
              if (onConfirmField) void onConfirmField('addressDetail')
            }}
            placeholder="Apartment, suite, unit"
          />
          {renderFieldAction('addressDetail')}
        </div>
      </div>

      <div className="checkout-field full-width">
        <span>Delivery request</span>
        <div className="checkout-input-row delivery-request-row" onBlur={handleDeliveryRequestBlur}>
          <input
            readOnly={!isDeliveryRequestEditable}
            value={checkoutForm.deliveryRequest}
            onChange={(event) => {
              if (isDeliveryRequestEditable) {
                onChange('deliveryRequest', event.target.value)
              }
            }}
            onFocus={() => setIsDeliveryRequestOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                setIsDeliveryRequestOpen(false)
                if (onConfirmField) void onConfirmField('deliveryRequest')
              }
            }}
            placeholder={isDeliveryRequestEditable ? '요청사항을 입력하세요' : '배송 요청사항 선택'}
          />
          {isDeliveryRequestOpen && (
            <div className="delivery-request-options" role="listbox">
              {DELIVERY_REQUEST_OPTIONS.map((option) => (
                <div
                  key={option}
                  role="option"
                  aria-selected={checkoutForm.deliveryRequest === option}
                  tabIndex="0"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectDeliveryRequest(option)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      selectDeliveryRequest(option)
                    }
                  }}
                >
                  {option}
                </div>
              ))}
              <div
                role="option"
                aria-selected={isDeliveryRequestEditable && !isPredefinedDeliveryRequest}
                tabIndex="0"
                onMouseDown={(event) => event.preventDefault()}
                onClick={selectCustomDeliveryRequest}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    selectCustomDeliveryRequest()
                  }
                }}
              >
                직접 입력
              </div>
            </div>
          )}
        </div>
      </div>

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
