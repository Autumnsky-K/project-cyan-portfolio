import { type ChangeEvent, type FocusEvent, useEffect, useState } from 'react'
import IconButton from './IconButton'
import './QuantityStepper.css'

type QuantityStepperProps = {
  disabled?: boolean
  editable?: boolean
  label?: string
  max?: number | null
  min?: number
  onChange: (value: number) => void
  size?: 'compact' | 'medium'
  value: number
}

function clampQuantity(value: number, min: number, max?: number | null) {
  const upperBound = typeof max === 'number' ? Math.max(min, max) : Number.POSITIVE_INFINITY
  return Math.min(Math.max(value, min), upperBound)
}

export default function QuantityStepper({
  disabled = false,
  editable = false,
  label = '수량',
  max = null,
  min = 1,
  onChange,
  size = 'compact',
  value,
}: QuantityStepperProps) {
  const normalizedValue = clampQuantity(Number.isFinite(value) ? value : min, min, max)
  const [inputValue, setInputValue] = useState(String(normalizedValue))
  const canDecrease = !disabled && normalizedValue > min
  const canIncrease = !disabled && (max === null || normalizedValue < max)

  useEffect(() => {
    setInputValue(String(normalizedValue))
  }, [normalizedValue])

  function updateValue(nextValue: number) {
    if (!disabled && Number.isFinite(nextValue)) {
      onChange(clampQuantity(nextValue, min, max))
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.currentTarget.value
    setInputValue(nextValue)

    if (nextValue.trim() === '') {
      return
    }

    updateValue(event.currentTarget.valueAsNumber)
  }

  function handleInputBlur(event: FocusEvent<HTMLInputElement>) {
    if (event.currentTarget.value.trim() === '') {
      updateValue(min)
      setInputValue(String(min))
    }
  }

  return (
    <div className={`quantity-stepper quantity-stepper--${size}`} role="group" aria-label={label}>
      <IconButton
        disabled={!canDecrease}
        icon={<span aria-hidden="true">−</span>}
        label={`${label} 줄이기`}
        shape="square"
        size="small"
        variant="ghost"
        onClick={() => updateValue(normalizedValue - 1)}
      />
      {editable ? (
        <input
          aria-label={`${label} 직접 입력`}
          disabled={disabled}
          inputMode="numeric"
          max={max ?? undefined}
          min={min}
          type="number"
          value={inputValue}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
        />
      ) : (
        <output aria-live="polite">{normalizedValue}</output>
      )}
      <IconButton
        disabled={!canIncrease}
        icon={<span aria-hidden="true">+</span>}
        label={`${label} 늘리기`}
        shape="square"
        size="small"
        variant="ghost"
        onClick={() => updateValue(normalizedValue + 1)}
      />
    </div>
  )
}
