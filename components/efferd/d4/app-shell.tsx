// Sidebar and decorative header removed — the dashboard pages supply the
// shared top nav and own the full width.
export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
	);
}
