interface StatusBadgeProps {
  status: "success" | "error" | "warning" | "info";
  children: React.ReactNode;
}

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusClasses = {
    success: "bg-green-900/30 text-green-400 border-green-700",
    error: "bg-red-900/30 text-red-400 border-red-700",
    warning: "bg-yellow-900/30 text-yellow-400 border-yellow-700",
    info: "bg-blue-900/30 text-blue-400 border-blue-700",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${statusClasses[status]}`}
    >
      {children}
    </div>
  );
}
