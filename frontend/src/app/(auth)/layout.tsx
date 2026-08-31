export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] w-full items-center justify-center overflow-hidden bg-slate-50 text-foreground p-0 sm:p-4 lg:p-6 select-none">
      {/* Background decorations for desktop */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-tertiary/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">{children}</div>
    </div>
  );
}
