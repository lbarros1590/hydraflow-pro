/**
 * Admin page for managing state regulations PDFs
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface State {
  code: string;
  name: string;
  is_active: boolean;
}

interface Regulation {
  id: string;
  state_code: string;
  code: string;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string | null;
  content_text: string | null;
  version: string | null;
  created_at: string;
}

export default function RegulationsAdmin() {
  const [states, setStates] = useState<State[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');
  const { toast } = useToast();

  // Form state
  const [form, setForm] = useState({
    state_code: '',
    code: '',
    title: '',
    description: '',
    category: '',
    version: '',
    content_text: '',
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statesRes, regulationsRes] = await Promise.all([
        supabase.from('available_states').select('*').order('name'),
        supabase.from('state_regulations').select('*').order('state_code, code'),
      ]);

      if (statesRes.data) setStates(statesRes.data);
      if (regulationsRes.data) setRegulations(regulationsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo PDF.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.state_code || !form.code || !form.title) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha estado, código e título.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      let fileUrl = null;

      // Upload file if provided
      if (file) {
        const fileName = `${form.state_code}/${form.code.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('regulations')
          .upload(fileName, file, { contentType: 'application/pdf' });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('regulations')
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl.publicUrl;
      }

      // Insert regulation
      const { error: insertError } = await supabase.from('state_regulations').insert({
        state_code: form.state_code,
        code: form.code,
        title: form.title,
        description: form.description || null,
        category: form.category || null,
        version: form.version || null,
        content_text: form.content_text || null,
        file_url: fileUrl,
      });

      if (insertError) throw insertError;

      toast({
        title: 'Norma cadastrada',
        description: 'A norma foi cadastrada com sucesso.',
      });

      // Reset form
      setForm({
        state_code: '',
        code: '',
        title: '',
        description: '',
        category: '',
        version: '',
        content_text: '',
      });
      setFile(null);
      loadData();
    } catch (error) {
      console.error('Error saving regulation:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar a norma.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string | null) => {
    if (!confirm('Tem certeza que deseja excluir esta norma?')) return;

    try {
      // Delete file from storage if exists
      if (fileUrl) {
        const path = fileUrl.split('/regulations/')[1];
        if (path) {
          await supabase.storage.from('regulations').remove([path]);
        }
      }

      // Delete from database
      const { error } = await supabase.from('state_regulations').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Norma excluída', description: 'A norma foi removida com sucesso.' });
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Ocorreu um erro ao excluir a norma.',
        variant: 'destructive',
      });
    }
  };

  const filteredRegulations = selectedState
    ? regulations.filter((r) => r.state_code === selectedState)
    : regulations;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/app">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Normas</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie as normas técnicas por estado
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Cadastrar Nova Norma
            </CardTitle>
            <CardDescription>
              Adicione o conteúdo textual da norma para alimentar o chatbot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Select
                    value={form.state_code}
                    onValueChange={(v) => setForm({ ...form, state_code: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.code} - {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    placeholder="Ex: NTCB 19"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Sistema de Hidrantes e Mangotinhos"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Prevenção">Prevenção</SelectItem>
                      <SelectItem value="Combate">Combate</SelectItem>
                      <SelectItem value="Saída">Saída de Emergência</SelectItem>
                      <SelectItem value="Estrutural">Estrutural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    id="version"
                    placeholder="Ex: 2023"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Breve descrição da norma..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo para o Chatbot</Label>
                <Textarea
                  id="content"
                  placeholder="Cole aqui o conteúdo textual da norma que será usado pelo chatbot para responder perguntas..."
                  value={form.content_text}
                  onChange={(e) => setForm({ ...form, content_text: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Este conteúdo será usado pelo assistente IA para responder perguntas específicas do estado.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Arquivo PDF (opcional)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {file.name}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Cadastrar Norma
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Regulations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Normas Cadastradas
              </CardTitle>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os estados</SelectItem>
                  {states.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRegulations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma norma cadastrada
              </div>
            ) : (
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegulations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <Badge variant="outline">{reg.state_code}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{reg.code}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {reg.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {reg.file_url && (
                              <Badge variant="secondary" className="text-xs">
                                PDF
                              </Badge>
                            )}
                            {reg.content_text && (
                              <Badge variant="default" className="text-xs">
                                IA
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(reg.id, reg.file_url)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
