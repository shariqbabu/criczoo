export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Cricket ball animation */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-red-600 ball-bounce shadow-lg flex items-center justify-center">
            <div className="w-14 h-0.5 bg-red-800 rounded-full absolute" />
            <div className="w-0.5 h-14 bg-red-800 rounded-full absolute" />
            <div className="w-10 h-10 rounded-full border-2 border-red-800/40 absolute" />
          </div>
        </div>

        {/* App name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">CricPro</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading...</p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
            style={{
              animation: 'loading 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
