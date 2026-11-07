'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/products');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
      Loading Add Product...
    </div>
  );
}

