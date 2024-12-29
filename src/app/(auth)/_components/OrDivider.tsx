// src/app/(auth)/_components/OrDivider.tsx
export function OrDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-red-100" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-gray-500">Or</span>
      </div>
    </div>
  );
}