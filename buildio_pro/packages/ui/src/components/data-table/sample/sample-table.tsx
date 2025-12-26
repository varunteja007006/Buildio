import { DataTable } from "@workspace/ui/components/data-table/data-table";
import {
  columns,
  payments,
} from "@workspace/ui/components/data-table/sample/data";

export default function SampleTable() {
  return (
    <div>
      <DataTable columns={columns} data={payments} />
    </div>
  );
}
