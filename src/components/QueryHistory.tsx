
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Query } from '@/data/mock-data';
import { Badge } from '@/components/ui/badge';

interface QueryHistoryProps {
  queries: Query[];
  onSelectQuery: (query: Query) => void;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ queries, onSelectQuery }) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  };

  // Group queries by date
  const groupedQueries: Record<string, Query[]> = {};
  
  queries.forEach(query => {
    const dateKey = formatDate(new Date(query.executedAt));
    if (!groupedQueries[dateKey]) {
      groupedQueries[dateKey] = [];
    }
    groupedQueries[dateKey].push(query);
  });

  return (
    <div className="space-y-4 animate-slide-in flex flex-col h-full">
      <h2 className="text-xl font-medium flex items-center">
        <Clock className="mr-2 h-5 w-5 text-primary/70" />
        Query History
      </h2>

      <ScrollArea className="flex-1">
        <div className="space-y-6 pr-4">
          {Object.keys(groupedQueries).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No query history yet
            </div>
          ) : (
            Object.entries(groupedQueries).map(([date, dateQueries]) => (
              <div key={date} className="space-y-2">
                <div className="sticky top-0 bg-background z-10 py-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {date}
                  </h3>
                </div>
                {dateQueries.map((query) => (
                  <Card 
                    key={query.id}
                    className="border cursor-pointer transition-all duration-200 hover:shadow-sm"
                    onClick={() => onSelectQuery(query)}
                  >
                    <CardContent className="p-3 text-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium line-clamp-1 mr-2">{query.text}</div>
                        <div className="flex items-center shrink-0">
                          {query.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTime(new Date(query.executedAt))}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-muted-foreground line-clamp-1 italic">
                          {query.sqlGenerated}
                        </div>
                        <Badge variant="outline" className="shrink-0 ml-2">
                          {query.duration}ms
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default QueryHistory;
