export default function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-xl border bg-white p-6 shadow-sm animate-pulse"
        >
          <div className="h-4 w-24 rounded bg-gray-200 mb-4" />

          <div className="h-8 w-16 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
