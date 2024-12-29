export default function AddressSelectorSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-1/4 rounded bg-gray-200" />
        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <div className="h-64 rounded-lg bg-gray-200" />
            <div className="h-64 rounded-lg bg-gray-200" />
          </div>
          <div className="h-96 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
