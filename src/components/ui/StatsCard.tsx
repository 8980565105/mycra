import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FacetItem {
  id?: string;
  name: string;
  count?: number;
}

interface StatsCardProps {
  title: string;
  count: number;
  list?: FacetItem[];
  keyName?: string;
}

export function StatsCard({
  title,
  count,
  list = [],
  keyName = "name",
}: StatsCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-300 border rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
            {count}
          </div>
        </div>
      </CardHeader>

      <CardContent>

        <div className="border rounded-lg h-[208px] overflow-y-auto">
          {list.length > 0 ? (
            <ul className="divide-y">
              {list.map((item: any, index: number) => (
                <li
                  key={item.id || index}
                  className="px-3 py-2 hover:bg-muted transition flex justify-between"
                >
                  <span>{index + 1} {item[keyName]}</span>
                  {item.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {item.count}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              No Data Found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}