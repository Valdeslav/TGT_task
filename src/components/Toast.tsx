import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  detail?: string;
}

export function Toast({ message, detail }: ToastProps) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-icon">
        <CheckCircle2 size={19} />
      </span>
      <span className="toast-copy">
        <b>{message}</b>
        {detail && <small>{detail}</small>}
      </span>
    </div>
  );
}
