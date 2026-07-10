export function KanbanSkeleton() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-4 w-72 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-10 w-32 bg-amber-200/50 rounded-xl animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-hidden max-w-7xl mx-auto items-start">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-100/50 border border-slate-200/50 rounded-2xl p-4 w-80 shrink-0 min-h-[550px]">
            <div className="h-10 w-full bg-slate-200/70 rounded-xl mb-5 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-24 w-full bg-white border border-slate-100 rounded-xl animate-pulse shadow-sm"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}