
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, Table, FileJson, Code, Maximize2 } from 'lucide-react';
import { processNaturalLanguageQuery, formatAsJson, formatSql } from '@/utils/queryUtils';
import { Textarea } from '@/components/ui/textarea';
import { Query, staticDatabases } from '@/data/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import ExpandedQueryView from './ExpandedQueryView';

interface QueryInterfaceProps {
  onQueryExecuted: (query: Query) => void;
  connectionId: string;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({ 
  onQueryExecuted,
  connectionId
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [activeTab, setActiveTab] = useState('table');
  const [queryResult, setQueryResult] = useState<{
    data: any[] | null;
    sqlQuery: string;
    explanation: string;
  }>({
    data: null,
    sqlQuery: '',
    explanation: ''
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExpandedViewOpen, setIsExpandedViewOpen] = useState(false);

  const executeQuery = () => {
    if (!queryInput.trim()) return;
    
    setIsExecuting(true);
    
    // Simulate a network delay
    setTimeout(() => {
      try {
        const result = processNaturalLanguageQuery(queryInput, connectionId, staticDatabases);
        
        setQueryResult({
          data: result.data,
          sqlQuery: result.sqlQuery,
          explanation: result.explanation
        });
        
        const query: Query = {
          id: Date.now().toString(),
          connectionId,
          text: queryInput,
          executedAt: new Date(),
          duration: Math.floor(Math.random() * 200) + 50, // Random duration between 50-250ms
          status: 'success',
          result: result.data,
          sqlGenerated: result.sqlQuery,
          explanation: result.explanation
        };
        
        onQueryExecuted(query);
      } catch (error) {
        console.error('Error executing query:', error);
      } finally {
        setIsExecuting(false);
      }
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      executeQuery();
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full animate-slide-in">
      <div className="flex flex-col space-y-2">
        <label htmlFor="query" className="text-xl font-medium">
          Query
        </label>
        <div className="relative">
          <Textarea
            id="query"
            placeholder="Enter your query in natural language (e.g., 'Show me all users' or 'Find products with stock less than 10')"
            className="min-h-20 resize-none text-base"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={executeQuery}
            disabled={!queryInput.trim() || isExecuting}
            className="absolute bottom-2 right-2 transition-all duration-300 ease-in-out"
            size="sm"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            {isExecuting ? 'Executing...' : 'Execute Query'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground italic">
          Press Ctrl+Enter to execute
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <TabsList>
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
            
            {queryResult.data && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsExpandedViewOpen(true)}
                className="ml-auto"
              >
                <Maximize2 className="h-4 w-4 mr-1" />
                Expand
              </Button>
            )}
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <TabsContent value="table" className="flex-1 flex flex-col overflow-hidden mt-0">
              {queryResult.data ? (
                queryResult.data.length > 0 ? (
                  <Card className="flex-1 overflow-hidden border">
                    <CardContent className="p-0">
                      <ScrollArea className="h-[350px] w-full">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-full divide-y divide-gray-200">
                            <thead className="bg-muted/50 sticky top-0">
                              <tr>
                                {Object.keys(queryResult.data[0]).map((key) => (
                                  <th
                                    key={key}
                                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                                  >
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-gray-200">
                              {queryResult.data.map((row, rowIndex) => (
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
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="flex-1 flex items-center justify-center">
                    <CardContent>
                      <p className="text-muted-foreground">No results found</p>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="flex-1 flex items-center justify-center border-dashed">
                  <CardContent className="text-center py-10">
                    <Table className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Enter a query and execute it to see results</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="json" className="flex-1 flex flex-col overflow-hidden mt-0">
              <Card className="flex-1 overflow-hidden border">
                <CardContent className="p-0">
                  <ScrollArea className="h-[350px] w-full">
                    <pre className="p-4 text-sm font-mono">
                      {queryResult.data 
                        ? formatAsJson(queryResult.data) 
                        : '// Execute a query to see JSON results'}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sql" className="flex-1 flex flex-col overflow-hidden mt-0">
              <Card className="flex-1 overflow-hidden border">
                <CardContent className="p-0">
                  <ScrollArea className="h-[350px] w-full">
                    <pre className="p-4 text-sm font-mono">
                      {queryResult.sqlQuery 
                        ? formatSql(queryResult.sqlQuery) 
                        : '-- Execute a query to see generated SQL'}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {queryResult.explanation && (
        <Card className="border-muted bg-secondary/30">
          <CardContent className="py-3 px-4 text-sm">
            <strong className="font-medium text-primary">Explanation:</strong> {queryResult.explanation}
          </CardContent>
        </Card>
      )}

      <ExpandedQueryView
        isOpen={isExpandedViewOpen}
        onClose={() => setIsExpandedViewOpen(false)}
        data={queryResult.data}
        sqlQuery={queryResult.sqlQuery}
        activeTab={activeTab}
      />
    </div>
  );
};

export default QueryInterface;
