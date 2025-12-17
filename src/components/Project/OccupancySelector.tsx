/**
 * OccupancySelector - Visual selector for NTCB occupancy classifications
 * Provides a complete visual list organized by groups with search functionality
 */
import { useState, useMemo, useEffect } from 'react';
import { Search, Building2, Flame, Users, ChevronDown, ChevronRight, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { OCCUPANCY_DIVISIONS, OCCUPANCY_GROUPS } from '@/core/ntcbClassification';
import { FIRE_LOAD_BY_OCCUPANCY, POPULATION_PARAMS, CNAE_MAPPING } from '@/core/ntcbData';

interface OccupancySelectorProps {
  value?: string;
  onSelect: (selection: {
    occupancyCode: string;
    occupancyName: string;
    fireLoad: number;
    cnaeCode?: string;
  }) => void;
  disabled?: boolean;
}

interface RegulationActivity {
  id: string;
  code: string;
  description: string;
  occupancy_group: string;
  occupancy_division: string;
  fire_load_value: number;
  fire_load_unit: string;
}

export function OccupancySelector({ value, onSelect, disabled }: OccupancySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'groups' | 'search' | 'database'>('groups');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['A', 'B', 'C']);
  const [dbActivities, setDbActivities] = useState<RegulationActivity[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Fetch activities from database
  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingDb(true);
      try {
        const { data, error } = await supabase
          .from('regulation_activities')
          .select('*')
          .order('occupancy_group')
          .order('occupancy_division')
          .order('description');
        
        if (error) throw error;
        setDbActivities(data || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoadingDb(false);
      }
    };
    
    if (open) {
      fetchActivities();
    }
  }, [open]);

  // Get fire load for a division
  const getFireLoadForDivision = (code: string): number => {
    const fireLoad = FIRE_LOAD_BY_OCCUPANCY.find((f) => f.occupancyCode === code);
    return fireLoad?.fireLoadMJm2 || 500;
  };

  // Get selected occupation name
  const selectedOccupation = useMemo(() => {
    if (!value) return null;
    return OCCUPANCY_DIVISIONS.find(d => d.code === value);
  }, [value]);

  // Filter divisions based on search
  const filteredDivisions = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return OCCUPANCY_DIVISIONS.filter(
      d => d.code.toLowerCase().includes(term) ||
           d.name.toLowerCase().includes(term) ||
           d.description.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Filter CNAE mappings based on search
  const filteredCNAEs = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return CNAE_MAPPING.filter(
      c => c.code.toLowerCase().includes(term) ||
           c.description.toLowerCase().includes(term)
    ).slice(0, 30);
  }, [searchTerm]);

  // Filter database activities based on search
  const filteredDbActivities = useMemo(() => {
    if (!searchTerm) return dbActivities.slice(0, 50);
    const term = searchTerm.toLowerCase();
    return dbActivities.filter(
      a => a.code.toLowerCase().includes(term) ||
           a.description.toLowerCase().includes(term) ||
           a.occupancy_division.toLowerCase().includes(term)
    ).slice(0, 50);
  }, [searchTerm, dbActivities]);

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  // Handle division selection
  const handleDivisionSelect = (code: string, name: string, fireLoad?: number) => {
    const finalFireLoad = fireLoad || getFireLoadForDivision(code);
    onSelect({
      occupancyCode: code,
      occupancyName: name,
      fireLoad: finalFireLoad,
    });
    setOpen(false);
    setSearchTerm('');
  };

  // Handle CNAE selection
  const handleCNAESelect = (cnae: typeof CNAE_MAPPING[0]) => {
    const division = cnae.suggestedDivisions[0];
    const occupancy = OCCUPANCY_DIVISIONS.find(d => d.code === division);
    onSelect({
      occupancyCode: division,
      occupancyName: occupancy?.name || '',
      fireLoad: cnae.defaultFireLoad || getFireLoadForDivision(division),
      cnaeCode: cnae.code,
    });
    setOpen(false);
    setSearchTerm('');
  };

  // Handle database activity selection
  const handleDbActivitySelect = (activity: RegulationActivity) => {
    const occupancy = OCCUPANCY_DIVISIONS.find(d => d.code === activity.occupancy_division);
    onSelect({
      occupancyCode: activity.occupancy_division,
      occupancyName: occupancy?.name || activity.description,
      fireLoad: activity.fire_load_value,
      cnaeCode: activity.code,
    });
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto min-h-10 py-2"
          disabled={disabled}
        >
          {selectedOccupation ? (
            <div className="flex items-center gap-2 text-left">
              <Badge variant="secondary" className="font-mono">{selectedOccupation.code}</Badge>
              <span className="truncate">{selectedOccupation.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Selecionar ocupação...</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Seleção de Ocupação - NTCB 01/2025
          </DialogTitle>
          <DialogDescription>
            Selecione a ocupação do setor conforme classificação NTCB. A carga de incêndio será aplicada automaticamente.
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por CNAE, descrição ou código de ocupação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col px-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="groups" className="gap-2">
              <Building2 className="h-4 w-4" />
              Por Grupo
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Por CNAE
            </TabsTrigger>
            <TabsTrigger value="database" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Base NTCB 07
            </TabsTrigger>
          </TabsList>

          {/* Groups Tab */}
          <TabsContent value="groups" className="flex-1 mt-4">
            <ScrollArea className="h-[calc(80vh-220px)]">
              <div className="space-y-2 pr-4">
                {OCCUPANCY_GROUPS.map((group) => {
                  const divisions = OCCUPANCY_DIVISIONS.filter(d => d.group === group.group);
                  const isExpanded = expandedGroups.includes(group.group);
                  
                  return (
                    <Collapsible key={group.group} open={isExpanded} onOpenChange={() => toggleGroup(group.group)}>
                      <Card className="border-l-4" style={{ borderLeftColor: `hsl(${(group.group.charCodeAt(0) - 65) * 30}, 70%, 50%)` }}>
                        <CollapsibleTrigger asChild>
                          <CardContent className="py-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                <Badge variant="outline" className="font-mono">Grupo {group.group}</Badge>
                                <span className="font-medium">{group.name}</span>
                              </div>
                              <Badge variant="secondary">{divisions.length} divisões</Badge>
                            </div>
                          </CardContent>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t">
                            {divisions.map((division) => {
                              const fireLoad = getFireLoadForDivision(division.code);
                              const popParams = POPULATION_PARAMS[division.code];
                              
                              return (
                                <div
                                  key={division.code}
                                  className={`px-4 py-3 cursor-pointer hover:bg-primary/5 transition-colors border-b last:border-b-0
                                    ${value === division.code ? 'bg-primary/10 border-l-2 border-l-primary' : ''}`}
                                  onClick={() => handleDivisionSelect(division.code, division.name, fireLoad)}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="default" className="font-mono shrink-0">{division.code}</Badge>
                                        <span className="font-medium truncate">{division.name}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{division.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      <div className="flex items-center gap-1 text-sm">
                                        <Flame className="h-3 w-3 text-orange-500" />
                                        <span className="font-mono">{fireLoad}</span>
                                        <span className="text-muted-foreground">MJ/m²</span>
                                      </div>
                                      {popParams && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Users className="h-3 w-3" />
                                          <span>{popParams.description}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* CNAE Search Tab */}
          <TabsContent value="search" className="flex-1 mt-4">
            <ScrollArea className="h-[calc(80vh-220px)]">
              {searchTerm ? (
                <div className="space-y-4 pr-4">
                  {/* Division matches */}
                  {filteredDivisions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Divisões de Ocupação</h4>
                      <div className="space-y-1">
                        {filteredDivisions.map((division) => (
                          <Card
                            key={division.code}
                            className="cursor-pointer hover:bg-primary/5 transition-colors"
                            onClick={() => handleDivisionSelect(division.code, division.name)}
                          >
                            <CardContent className="py-2 px-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="default" className="font-mono">{division.code}</Badge>
                                  <span>{division.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Flame className="h-3 w-3 text-orange-500" />
                                  <span className="font-mono">{getFireLoadForDivision(division.code)} MJ/m²</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CNAE matches */}
                  {filteredCNAEs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Códigos CNAE</h4>
                      <div className="space-y-1">
                        {filteredCNAEs.map((cnae) => (
                          <Card
                            key={cnae.code}
                            className="cursor-pointer hover:bg-primary/5 transition-colors"
                            onClick={() => handleCNAESelect(cnae)}
                          >
                            <CardContent className="py-2 px-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="font-mono shrink-0">{cnae.code}</Badge>
                                    <div className="flex gap-1">
                                      {cnae.suggestedDivisions.map(div => (
                                        <Badge key={div} variant="secondary" className="font-mono text-xs">{div}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">{cnae.description}</p>
                                </div>
                                {cnae.defaultFireLoad && (
                                  <div className="flex items-center gap-1 text-sm shrink-0">
                                    <Flame className="h-3 w-3 text-orange-500" />
                                    <span className="font-mono">{cnae.defaultFireLoad} MJ/m²</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredDivisions.length === 0 && filteredCNAEs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum resultado encontrado para "{searchTerm}"</p>
                      <p className="text-sm mt-2">Tente buscar por código CNAE, descrição ou divisão</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Digite para buscar por CNAE ou descrição</p>
                  <p className="text-sm mt-2">Ex: "restaurante", "47.11", "comércio", "escola"</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="flex-1 mt-4">
            <ScrollArea className="h-[calc(80vh-220px)]">
              {loadingDb ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p>Carregando base de dados...</p>
                </div>
              ) : filteredDbActivities.length > 0 ? (
                <div className="space-y-1 pr-4">
                  {filteredDbActivities.map((activity) => (
                    <Card
                      key={activity.id}
                      className="cursor-pointer hover:bg-primary/5 transition-colors"
                      onClick={() => handleDbActivitySelect(activity)}
                    >
                      <CardContent className="py-2 px-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="default" className="font-mono shrink-0">{activity.occupancy_division}</Badge>
                              <Badge variant="outline" className="font-mono shrink-0 text-xs">{activity.code}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm shrink-0">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span className="font-mono">{activity.fire_load_value}</span>
                            <span className="text-muted-foreground text-xs">{activity.fire_load_unit}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredDbActivities.length >= 50 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Mostrando primeiros 50 resultados. Refine sua busca para ver mais.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atividade encontrada</p>
                  <p className="text-sm mt-2">A base de dados contém {dbActivities.length} atividades cadastradas</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}