import { ChannelBreakdownChart } from "@/components/efferd/d3/channel-breakdown-chart";
import { ConversationVolumeChart } from "@/components/efferd/d3/conversation-volume-chart";
import { CsatResponsesChart } from "@/components/efferd/d3/csat-responses-chart";
import { FirstReplyTimeChart } from "@/components/efferd/d3/first-reply-time-chart";
import { RecentConversations } from "@/components/efferd/d3/recent-conversations";
import { DashboardStats } from "@/components/efferd/d3/stats";
import { SupportActivity } from "@/components/efferd/d3/support-activity";
import { TeamOnDuty } from "@/components/efferd/d3/team-on-duty";

export function Dashboard() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<DashboardStats />
			<ConversationVolumeChart />
			<ChannelBreakdownChart />
			<CsatResponsesChart />
			<FirstReplyTimeChart />
			<TeamOnDuty />
			<RecentConversations />
			<SupportActivity />
		</div>
	);
}
