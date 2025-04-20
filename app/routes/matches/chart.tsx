import { HistoryChart } from "~/components/charts/history/HistoryChart";
import { VerticalBarChart } from "~/components/charts/verticalBar/VerticalBarChart";
export default function Chart() {
  return (
    <div>
      <HistoryChart />
      <VerticalBarChart />
    </div>
  );
}
