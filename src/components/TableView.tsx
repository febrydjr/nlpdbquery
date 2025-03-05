
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronDown, ChevronRight, Database, Key, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TableSchema, ColumnSchema } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TableViewProps {
  tables: TableSchema[];
}

const TableView: React.FC<TableViewProps> = ({ tables }) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTableExpansion = (tableName: string) => {
    setExpandedTables({
      ...expandedTables,
      [tableName]: !expandedTables[tableName]
    });
  };

  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-slide-in flex flex-col h-full">
      <div className="flex items-center">
        <h2 className="text-xl font-medium">Tables</h2>
        <Badge variant="outline" className="ml-2 bg-secondary">
          {tables.length}
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tables..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-2">
          {filteredTables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tables found
            </div>
          ) : (
            filteredTables.map((table) => (
              <Card 
                key={table.name}
                className="border transition-all duration-200 hover:shadow-sm"
              >
                <CardHeader className="py-3 px-4 cursor-pointer" onClick={() => toggleTableExpansion(table.name)}>
                  <div className="flex items-center">
                    {expandedTables[table.name] ? (
                      <ChevronDown className="h-4 w-4 mr-2 text-primary/70" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2 text-primary/70" />
                    )}
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Database className="h-4 w-4 mr-2 text-primary/70" />
                      {table.name}
                    </CardTitle>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {table.columns.length} columns
                    </Badge>
                  </div>
                </CardHeader>
                {expandedTables[table.name] && (
                  <CardContent className="py-2 px-4 bg-secondary/30 rounded-b-lg">
                    <div className="text-xs">
                      <div className="grid grid-cols-12 font-medium text-muted-foreground py-1 border-b">
                        <div className="col-span-4">Column</div>
                        <div className="col-span-3">Type</div>
                        <div className="col-span-5">Attributes</div>
                      </div>
                      {table.columns.map((column) => (
                        <ColumnItem key={column.name} column={column} />
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface ColumnItemProps {
  column: ColumnSchema;
}

const ColumnItem: React.FC<ColumnItemProps> = ({ column }) => {
  return (
    <div className="grid grid-cols-12 py-2 border-b border-secondary last:border-0">
      <div className="col-span-4 font-medium flex items-center">
        {column.isPrimaryKey && (
          <Key className="h-3 w-3 mr-1 text-amber-500" />
        )}
        {column.isForeignKey && (
          <Link2 className="h-3 w-3 mr-1 text-blue-500" />
        )}
        {column.name}
      </div>
      <div className="col-span-3 text-muted-foreground">{column.dataType}</div>
      <div className="col-span-5 flex gap-1 flex-wrap">
        {column.isPrimaryKey && (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
            PK
          </Badge>
        )}
        {column.isForeignKey && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
            FK: {column.foreignKeyReference?.table}.{column.foreignKeyReference?.column}
          </Badge>
        )}
        {column.isRequired ? (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
            Required
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-200">
            Optional
          </Badge>
        )}
      </div>
    </div>
  );
};

export default TableView;
