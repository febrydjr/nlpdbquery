
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Database, Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { connections, DatabaseConfig } from '@/data/mock-data';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ConnectionManagerProps {
  onSelectConnection: (connection: DatabaseConfig) => void;
  selectedConnectionId: string | null;
}

const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  onSelectConnection,
  selectedConnectionId
}) => {
  const [localConnections, setLocalConnections] = useState<DatabaseConfig[]>(connections);
  const [isNewConnectionDialogOpen, setIsNewConnectionDialogOpen] = useState(false);
  const [newConnection, setNewConnection] = useState<Partial<DatabaseConfig>>({
    name: '',
    type: 'static'
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCreateConnection = () => {
    if (!newConnection.name) return;

    const connection: DatabaseConfig = {
      id: Date.now().toString(),
      name: newConnection.name,
      type: newConnection.type as 'static',
      createdAt: new Date(),
      lastConnected: new Date()
    };

    setLocalConnections([...localConnections, connection]);
    setIsNewConnectionDialogOpen(false);
    setNewConnection({ name: '', type: 'static' });
    onSelectConnection(connection);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Database Connections</h2>
        <Dialog open={isNewConnectionDialogOpen} onOpenChange={setIsNewConnectionDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center transition-all duration-300 ease-in-out hover:shadow-md">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass card-shadow">
            <DialogHeader>
              <DialogTitle>Create new connection</DialogTitle>
              <DialogDescription>
                Configure a new database connection
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newConnection.name}
                  onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  onValueChange={(value) => setNewConnection({ ...newConnection, type: value as any })}
                  defaultValue={newConnection.type}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static (Demo)</SelectItem>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="supabase">Supabase</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewConnectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateConnection}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <Button variant="outline" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm" onClick={scrollLeft}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-4 pt-1 px-2 scrollbar-hide space-x-4 mx-8" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {localConnections.map((connection) => (
            <Card 
              key={connection.id}
              className={cn(
                "transition-all duration-300 border hover:shadow-md cursor-pointer flex-shrink-0 w-[280px]",
                selectedConnectionId === connection.id ? "ring-2 ring-primary/20 bg-[#F2FCE2]" : ""
              )}
              onClick={() => onSelectConnection(connection)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md font-medium flex items-center">
                    <Database className="h-4 w-4 mr-2 text-primary/70" />
                    {connection.name}
                  </CardTitle>
                  <div className="bg-secondary px-2 py-1 rounded-full text-xs text-secondary-foreground">
                    {connection.type}
                  </div>
                </div>
                <CardDescription className="text-xs flex items-center">
                  <Calendar className="h-3 w-3 mr-1 inline text-muted-foreground" />
                  Last connected: {formatDate(connection.lastConnected)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground flex items-center">
                  <ExternalLink className="h-3 w-3 mr-1 inline" />
                  {connection.host || 'Local storage'}{connection.port ? `:${connection.port}` : ''}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <Button variant="outline" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm" onClick={scrollRight}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionManager;
