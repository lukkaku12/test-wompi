type StatusScreenProps = {
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  errorMessage?: string | null
  onReturn: () => void
}

const StatusScreen = ({ status, errorMessage, onReturn }: StatusScreenProps) => {
  const title =
    status === 'SUCCESS'
      ? 'Payment successful'
      : status === 'FAILED'
        ? 'Payment failed'
        : 'Payment pending'

  const message =
    status === 'SUCCESS'
      ? 'Your order is confirmed. Thanks for your purchase.'
      : status === 'FAILED'
        ? 'Something went wrong. Please try again.'
        : 'We are checking the payment. This can take a moment.'

  return (
    <div className="status">
      <p className={`status-pill status-pill-${status.toLowerCase()}`}>
        {status}
      </p>
      <h2 className="status-title">{title}</h2>
      <p className="status-message">{message}</p>
      {errorMessage && <p className="status-message">{errorMessage}</p>}
      <button className="status-return" type="button" onClick={onReturn}>
        Return to products
      </button>
    </div>
  )
}

export default StatusScreen
