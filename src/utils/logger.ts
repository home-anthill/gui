import { toast } from 'sonner';

export function logError(message: string, err?: unknown): void {
  console.error(message, err);
  toast.error(message);
}
