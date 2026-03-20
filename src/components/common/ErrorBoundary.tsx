'use client';

export function ErrorMessage({ message }: { message?: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-800">{message || 'An error occurred. Please try again later.'}</p>
    </div>
  );
}
