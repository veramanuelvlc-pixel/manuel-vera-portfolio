import { BillingHealth } from "@/components/efferd/d2/billing-health";
import { ChannelSalesChart } from "@/components/efferd/d2/channel-sales-chart";
import { DashboardActivity } from "@/components/efferd/d2/dashboard-activity";
import { DashboardInvoices } from "@/components/efferd/d2/dashboard-invoices";
import { NetRevenueChart } from "@/components/efferd/d2/net-revenue-chart";
import { DashboardStats } from "@/components/efferd/d2/stats";

export function Dashboard() {
	return (
		<div className="grid grid-cols-1 gap-px bg-border p-px md:grid-cols-2 lg:grid-cols-4">
			<DashboardStats />
			<NetRevenueChart />
			<ChannelSalesChart />
			<DashboardInvoices />
			<BillingHealth />
			<DashboardActivity />
		</div>
	);
}
