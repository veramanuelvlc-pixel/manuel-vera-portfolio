import { CategoryRankChart } from "@/components/efferd/d4/category-rank-chart";
import { QuickActions } from "@/components/efferd/d4/quick-actions";
import { RefundReturnRateChart } from "@/components/efferd/d4/refund-return-rate-chart";
import { RevenueChart } from "@/components/efferd/d4/revenue-chart";
import { DashboardStats } from "@/components/efferd/d4/stats";

export function Dashboard() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<DashboardStats />
			<RevenueChart />
			<RefundReturnRateChart />
			<CategoryRankChart />
			<QuickActions />
		</div>
	);
}
