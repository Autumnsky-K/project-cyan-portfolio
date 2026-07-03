import IconButton from '../../shared/components/IconButton'
import './PasswordVisibilityButton.css'

function PasswordVisibilityButton({ isVisible, onClick }) {
  const label = isVisible ? '비밀번호 숨기기' : '비밀번호 보기'

  return (
    <IconButton
      className="password-visibility-button"
      icon={(
        <svg
          className="password-visibility-icon"
          fill="none"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path
            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          {isVisible && (
            <path
              d="M4.5 19.5 19.5 4.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          )}
        </svg>
      )}
      label={label}
      onClick={onClick}
      aria-pressed={isVisible}
      shape="square"
      size="small"
      title={label}
      variant="ghost"
    />
  )
}

export default PasswordVisibilityButton
