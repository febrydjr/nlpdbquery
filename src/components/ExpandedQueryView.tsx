
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, FileJson, Code } from 'lucide-react';
import { formatAsJson, formatSql } from '@/utils/queryUtils';

interface ExpandedQueryViewProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[] | null;
  sqlQuery: string;
  activeTab: string;
}

const ExpandedQueryView: React.FC<ExpandedQueryViewProps> = ({
  isOpen,
  onClose,
  data,
  sqlQuery,
  activeTab
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Query Results</DialogTitle>
          <DialogDescription>Expanded view of query results</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mb-2">
            <TabsTrigger value="table" className="flex items-center">
              <Table className="mr-2 h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center">
              <FileJson className="mr-2 h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="sql" className="flex items-center">
              <Code className="mr-2 h-4 w-4" />
              SQL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="flex-1 overflow-hidden">
            <div className="h-[calc(80vh-120px)] border rounded-md overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="w-full">
                  {data && data.length > 0 ? (
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-muted/50 sticky top-0 z-10">
                        <tr>
                          {Object.keys(data[0]).map((key) => (
                            <th
                              key={key}
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-muted/20">
                            {Object.values(row).map((value: any, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-4 py-2 text-sm whitespace-nowrap"
                              >
                                {value === null || value === undefined
                                  ? <span className="text-muted-foreground italic">null</span>
                                  : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex items-center justify-center h-full p-8">
                      <p className="text-muted-foreground">No results found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="json" className="flex-1 overflow-hidden">
            <div className="h-[calc(80vh-120px)] border rounded-md overflow-hidden">
              <ScrollArea className="h-full w-full">
                <pre className="p-4 text-sm font-mono">
                  {data ? formatAsJson(data) : '// No data available'}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="sql" className="flex-1 overflow-hidden">
            <div className="h-[calc(80vh-120px)] border rounded-md overflow-hidden">
              <ScrollArea className="h-full w-full">
                <pre className="p-4 text-sm font-mono">
                  {sqlQuery ? formatSql(sqlQuery) : '-- No SQL available'}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ExpandedQueryView;
