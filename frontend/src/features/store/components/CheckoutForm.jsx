function CheckoutForm({ checkoutForm, errors, onChange, showMemberId = false }) {
  return (
    <div className="checkout-fields">
      {showMemberId && (
        <label>
          Member ID
          <input
            value={checkoutForm.memberId}
            onChange={(event) => onChange('memberId', event.target.value)}
            placeholder="Server member id"
          />
        </label>
      )}
      <label>
        Name
        <input
          value={checkoutForm.name}
          onChange={(event) => onChange('name', event.target.value)}
          placeholder="Customer name"
        />
      </label>
      <label>
        Email
        <input
          type="email"
          value={checkoutForm.email}
          onChange={(event) => onChange('email', event.target.value)}
          placeholder="name@example.com"
        />
      </label>
      <label>
        Phone
        <input
          value={checkoutForm.phone}
          onChange={(event) => onChange('phone', event.target.value)}
          placeholder="010-0000-0000"
        />
      </label>
      <label className="full-width">
        Address
        <textarea
          value={checkoutForm.address}
          onChange={(event) => onChange('address', event.target.value)}
          placeholder="Shipping address"
          rows="3"
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
