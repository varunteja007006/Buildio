import { DataTable } from "../data-table.js";
import { columns, payments } from "./data.js";

export default function SampleTable() {
  return (
    <div>
      <DataTable columns={columns} data={payments} />
    </div>
  );
}
