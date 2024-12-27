// src/app/(shop)/cart/_components/CartSkeleton.tsx
export function CartSkeleton() {
  return (
    <div className="container py-8">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                <div className="h-24 w-24 animate-pulse rounded bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="rounded-lg border p-6">
            <div className="space-y-4">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
              <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
