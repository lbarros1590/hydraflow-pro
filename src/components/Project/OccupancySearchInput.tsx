/**
 * Occupancy Search Component - NTCB 07/2020 Fire Load Search
 * Allows searching occupancies by keyword/description with AI assistance
 */
import { useState, useCallback, useMemo } from 'react';
import { Check, ChevronsUpDown, Search, Flame, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CNAE_MAPPING, FIRE_LOAD_BY_OCCUPANCY, type CNAEMapping, type FireLoadData } from '@/core/ntcbData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Combined search result type
interface SearchResult {
  id: string;
  description: string;
  division: string;
  divisionName?: string;
  fireLoad: number;
  cnae?: string;
  source: 'cnae' | 'division';
}

// Helper to get division name
const DIVISION_NAMES: Record<string, string> = {
  'A-1': 'Habitação unifamiliar', 'A-2': 'Habitação multifamiliar', 'A-3': 'Habitação coletiva',
  'B-1': 'Hotel', 'B-2': 'Hotel residencial',
  'C-1': 'Comércio baixa carga', 'C-2': 'Comércio em geral', 'C-3': 'Shopping center',
  'D-1': 'Local prestação de serviços', 'D-2': 'Agência bancária', 'D-3': 'Serviço de reparação', 'D-4': 'Laboratório',
  'E-1': 'Escola', 'E-2': 'Escola especial', 'E-3': 'Espaço para cultura física', 'E-4': 'Centro de treinamento', 'E-5': 'Pré-escola', 'E-6': 'Escola para portadores de deficiência',
  'F-1': 'Local de reunião de público', 'F-2': 'Templo religioso', 'F-3': 'Centro esportivo', 'F-4': 'Estação e terminal', 'F-5': 'Arte cênica/auditório', 'F-6': 'Clube social', 'F-7': 'Construção provisória', 'F-8': 'Local alimentação', 'F-9': 'Recreação pública', 'F-10': 'Exposição de objetos', 'F-11': 'Local de eventos',
  'G-1': 'Garagem automática', 'G-2': 'Garagem coletiva', 'G-3': 'Local abastecimento veículos', 'G-4': 'Serviço de conservação/manutenção', 'G-5': 'Hangar',
  'H-1': 'Hospital veterinário', 'H-2': 'Local assistência à saúde', 'H-3': 'Hospital', 'H-4': 'Odontologia/laboratório/clínica', 'H-5': 'Local para restrição liberdade', 'H-6': 'Clínica e consultório médico',
  'I-1': 'Local risco baixo', 'I-2': 'Local risco médio', 'I-3': 'Local risco alto',
  'J-1': 'Depósito sem carga', 'J-2': 'Depósito carga baixa', 'J-3': 'Depósito carga média', 'J-4': 'Depósito carga alta',
  'L-1': 'Comércio de explosivos', 'L-2': 'Indústria de explosivos', 'L-3': 'Depósito de explosivos',
  'M-1': 'Túneis', 'M-2': 'Líquidos/gases inflamáveis', 'M-3': 'Central de comunicação', 'M-4': 'Propriedade em construção', 'M-5': 'Silos', 'M-6': 'Terra selvagem', 'M-7': 'Pátio de containers', 'M-8': 'Parque eólico/solar',
};

interface OccupancySearchInputProps {
  value?: string;
  onSelect: (result: { 
    occupancyCode: string; 
    occupancyName: string; 
    fireLoad: number; 
    cnaeCode?: string;
  }) => void;
  placeholder?: string;
  className?: string;
  showAIHelp?: boolean;
}

export function OccupancySearchInput({ 
  value, 
  onSelect, 
  placeholder = "Buscar atividade...",
  className,
  showAIHelp = true
}: OccupancySearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<SearchResult | null>(null);

  // Normalize string for search (remove accents, lowercase)
  const normalizeString = useCallback((str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.-]/g, ' ');
  }, []);

  // Build search results from CNAE and divisions
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];

    const normalizedQuery = normalizeString(searchQuery);
    const results: SearchResult[] = [];
    const addedDivisions = new Set<string>();

    // Search in CNAE mappings first
    CNAE_MAPPING.forEach(cnae => {
      const normalizedDesc = normalizeString(cnae.description);
      const normalizedCode = cnae.code.replace(/[.-]/g, '');
      
      if (normalizedDesc.includes(normalizedQuery) || normalizedCode.includes(normalizedQuery.replace(/\s/g, ''))) {
        const division = cnae.suggestedDivisions[0];
        results.push({
          id: `cnae-${cnae.code}`,
          description: cnae.description,
          division: division,
          divisionName: DIVISION_NAMES[division],
          fireLoad: cnae.defaultFireLoad || 500,
          cnae: cnae.code,
          source: 'cnae',
        });
      }
    });

    // Also search in fire load by occupancy (division-based)
    FIRE_LOAD_BY_OCCUPANCY.forEach(item => {
      const normalizedDesc = normalizeString(item.description);
      
      if (normalizedDesc.includes(normalizedQuery) && !addedDivisions.has(item.occupancyCode)) {
        addedDivisions.add(item.occupancyCode);
        results.push({
          id: `div-${item.occupancyCode}`,
          description: item.description,
          division: item.occupancyCode,
          divisionName: DIVISION_NAMES[item.occupancyCode],
          fireLoad: item.fireLoadMJm2,
          source: 'division',
        });
      }
    });

    return results.slice(0, 20); // Limit results
  }, [searchQuery, normalizeString]);

  const selectedItem = useMemo(() => {
    if (!value) return null;
    // Try to find the selected value
    const divItem = FIRE_LOAD_BY_OCCUPANCY.find(d => d.occupancyCode === value);
    if (divItem) {
      return {
        description: divItem.description,
        division: divItem.occupancyCode,
        fireLoad: divItem.fireLoadMJm2,
      };
    }
    return null;
  }, [value]);

  const handleSelect = (result: SearchResult) => {
    onSelect({
      occupancyCode: result.division,
      occupancyName: result.divisionName || result.description,
      fireLoad: result.fireLoad,
      cnaeCode: result.cnae,
    });
    setOpen(false);
    setSearchQuery('');
  };

  // AI Classification helper
  const handleAIClassify = async () => {
    if (!aiDescription.trim()) {
      toast.error('Descreva a atividade do local');
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('classify-occupancy', {
        body: { description: aiDescription }
      });

      if (error) throw error;

      if (data?.division && data?.fireLoad) {
        const suggestion: SearchResult = {
          id: 'ai-suggestion',
          description: data.description || aiDescription,
          division: data.division,
          divisionName: DIVISION_NAMES[data.division] || data.divisionName,
          fireLoad: data.fireLoad,
          cnae: data.cnae,
          source: 'division',
        };
        setAiSuggestion(suggestion);
      } else {
        toast.error('Não foi possível classificar. Tente descrever melhor.');
      }
    } catch (err) {
      console.error('AI classification error:', err);
      toast.error('Erro ao classificar com IA');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAISuggestion = () => {
    if (aiSuggestion) {
      handleSelect(aiSuggestion);
      setAiDialogOpen(false);
      setAiDescription('');
      setAiSuggestion(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("flex-1 justify-between h-8 text-sm", className)}
          >
            {selectedItem ? (
              <span className="truncate flex items-center gap-2">
                <Badge variant="secondary" className="text-xs shrink-0">{selectedItem.division}</Badge>
                <span className="truncate">{selectedItem.description}</span>
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-2">
                <Search className="h-3 w-3" />
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Digite para buscar (ex: supermercado, farmácia, escola)..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {searchQuery.length < 2 
                  ? "Digite pelo menos 2 caracteres..."
                  : "Nenhuma atividade encontrada."
                }
              </CommandEmpty>
              {searchResults.length > 0 && (
                <CommandGroup heading="Resultados">
                  {searchResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-start gap-2 py-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0 mt-0.5",
                          value === result.division ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs shrink-0">{result.division}</Badge>
                          {result.cnae && (
                            <Badge variant="secondary" className="text-xs shrink-0">CNAE {result.cnae}</Badge>
                          )}
                        </div>
                        <p className="text-sm truncate mt-1">{result.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <span>{result.fireLoad} MJ/m²</span>
                          {result.divisionName && (
                            <>
                              <span>•</span>
                              <span>{result.divisionName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showAIHelp && (
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" title="Ajuda IA para classificar">
              <Sparkles className="h-4 w-4 text-primary" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Classificar com IA
              </DialogTitle>
              <DialogDescription>
                Descreva a atividade do local e a IA vai sugerir a classificação NTCB mais adequada.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Textarea
                placeholder="Ex: Loja de roupas femininas com área de 100m², vende peças de vestuário, bolsas e acessórios..."
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                rows={4}
              />

              {aiSuggestion && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                  <p className="text-sm font-medium">Sugestão da IA:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default">{aiSuggestion.division}</Badge>
                    {aiSuggestion.cnae && (
                      <Badge variant="secondary">CNAE {aiSuggestion.cnae}</Badge>
                    )}
                  </div>
                  <p className="text-sm">{aiSuggestion.divisionName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>Carga de incêndio: {aiSuggestion.fireLoad} MJ/m²</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              {aiSuggestion ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setAiSuggestion(null)}>
                    Nova Busca
                  </Button>
                  <Button type="button" onClick={handleAcceptAISuggestion}>
                    Usar Esta Classificação
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={handleAIClassify} disabled={aiLoading || !aiDescription.trim()}>
                  {aiLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Classificar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
