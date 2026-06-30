function CheckoutForm({ checkoutForm, errors, onChange }) {
  return (
    <div className="checkout-fields">
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
          inputMode="numeric"
          maxLength="13"
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
