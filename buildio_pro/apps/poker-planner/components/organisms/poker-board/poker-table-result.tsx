import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

export function PokerResultTable({
  chartData,
}: Readonly<{
  chartData: {
    name: string;
    value: number;
  }[];
}>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold text-primary">Points</TableHead>
          <TableHead className="font-bold text-primary">Votes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {chartData.map((item) => (
          <TableRow key={item.name}>
            <TableCell className="font-semibold text-primary">
              {item.name}
            </TableCell>
            <TableCell className="font-semibold text-primary">
              {item.value}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
