import { cn } from "~/lib/utils";

interface TableItem {
  label: string;
  value: React.ReactNode;
}

interface TableProps {
  items: TableItem[];
  children?: React.ReactNode;
}

export const Table = ({ children, items }: TableProps) => {
  return (
    <div className="rounded-md border border-night-800">
      <div className={cn("p-3", children && "border-b border-night-800")}>
        <table className="w-full space-y-3 text-sm text-night-400">
          <tbody>
            {items.map((item) => (
              <tr
                className="flex w-full items-center justify-between"
                key={item.label}
              >
                <td>{item.label}</td>
                <td className="font-medium">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {children && <div className="p-3">{children}</div>}
    </div>
  );
};
