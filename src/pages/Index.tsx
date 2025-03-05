
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import MainLayout from '@/components/layout/MainLayout';
import ConnectionManager from '@/components/ConnectionManager';
import TableView from '@/components/TableView';
import QueryInterface from '@/components/QueryInterface';
import QueryHistory from '@/components/QueryHistory';
import { connections, queryHistory as initialQueryHistory, DatabaseConfig, Query, staticDatabases } from '@/data/mock-data';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConfig | null>(null);
  const [queryHistory, setQueryHistory] = useState<Query[]>(initialQueryHistory);

  const handleConnectionSelect = (connection: DatabaseConfig) => {
    setSelectedConnection(connection);
    // Update query history based on the selected connection
    const connectionQueries = initialQueryHistory.filter(q => q.connectionId === connection.id);
    setQueryHistory(connectionQueries);
  };

  const handleQueryExecuted = (query: Query) => {
    setQueryHistory([query, ...queryHistory]);
  };

  const handleHistoryQuerySelect = (query: Query) => {
    // Re-run the selected query
    const newQuery = {
      ...query,
      id: Date.now().toString(),
      executedAt: new Date(),
      duration: Math.floor(Math.random() * 200) + 50, // Random duration between 50-250ms
    };
    setQueryHistory([newQuery, ...queryHistory]);
  };

  // Get the current database based on selected connection
  const currentDatabase = selectedConnection 
    ? staticDatabases.find(db => db.id === selectedConnection.id) 
    : null;

  return (
    <MainLayout>
      <div className="flex items-center space-x-2 mb-6">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Natural Query Explorer</h1>
          <p className="text-muted-foreground mt-1">
            Connect to databases and query using natural language
          </p>
        </div>
      </div>

      {/* Connection Manager - Full Width */}
      <div className="mb-6">
        <div className="bg-card rounded-lg p-5 border shadow-sm">
          <ConnectionManager 
            onSelectConnection={handleConnectionSelect}
            selectedConnectionId={selectedConnection?.id || null}
          />
        </div>
      </div>

      {/* Tables, Query Interface, and History - Below Connections */}
      {selectedConnection ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Table View */}
          <div className="col-span-12 md:col-span-3 lg:col-span-3">
            <div className="bg-card rounded-lg p-5 border shadow-sm h-[calc(100vh-220px)] overflow-hidden flex flex-col">
              <ScrollArea className="h-full">
                {currentDatabase ? (
                  <TableView tables={currentDatabase.tables} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Badge className="mb-2" variant="outline">
                      No Tables Found
                    </Badge>
                    <p className="text-muted-foreground">
                      This connection has no tables
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Query Interface */}
          <div className="col-span-12 md:col-span-6 lg:col-span-6">
            <div className="bg-card rounded-lg p-5 border shadow-sm h-[calc(100vh-220px)] overflow-hidden flex flex-col">
              <QueryInterface 
                onQueryExecuted={handleQueryExecuted}
                connectionId={selectedConnection.id}
              />
            </div>
          </div>

          {/* Query History */}
          <div className="col-span-12 md:col-span-3 lg:col-span-3">
            <div className="bg-card rounded-lg p-5 border shadow-sm h-[calc(100vh-220px)] overflow-hidden flex flex-col">
              <ScrollArea className="h-full">
                <QueryHistory 
                  queries={queryHistory}
                  onSelectQuery={handleHistoryQuerySelect}
                />
              </ScrollArea>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-card rounded-lg p-12 border shadow-sm text-center">
          <Database className="h-16 w-16 text-muted mb-4" />
          <h2 className="text-2xl font-medium mb-2">No Connection Selected</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Select a connection from the list above to view tables and execute queries.
          </p>
        </div>
      )}
    </MainLayout>
  );
};

export default Index;
