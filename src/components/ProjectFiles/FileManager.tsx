/**
 * Gerenciador de Arquivos do Projeto
 */
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Upload,
  File,
  FileText,
  Image,
  FileJson,
  Trash2,
  Download,
  MoreVertical,
  FolderOpen,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectFile {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_category: string;
  file_url: string;
  file_size: number | null;
  description: string | null;
  created_at: string;
}

const FILE_CATEGORIES = [
  { value: 'projeto', label: 'Projeto', icon: FileText },
  { value: 'memorial', label: 'Memorial', icon: FileText },
  { value: 'planta', label: 'Planta', icon: File },
  { value: 'foto', label: 'Foto', icon: Image },
  { value: 'calculo', label: 'Cálculo', icon: FileJson },
  { value: 'outros', label: 'Outros', icon: File },
];

const FILE_ICONS: Record<string, typeof File> = {
  pdf: FileText,
  dwg: File,
  dxf: File,
  jpg: Image,
  jpeg: Image,
  png: Image,
  json: FileJson,
  default: File,
};

interface FileManagerProps {
  projectId: string;
  onFileSelect?: (file: ProjectFile) => void;
}

export function FileManager({ projectId, onFileSelect }: FileManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [uploadCategory, setUploadCategory] = useState('projeto');
  const [uploadDescription, setUploadDescription] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os arquivos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 20MB.',
        variant: 'destructive',
      });
      return;
    }

    setPendingFile(file);
    setShowUploadDialog(true);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!pendingFile || !user) return;

    setUploading(true);
    try {
      const fileExt = pendingFile.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${Date.now()}_${pendingFile.name}`;
      const filePath = `${user.id}/${projectId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, pendingFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          user_id: user.id,
          file_name: pendingFile.name,
          file_type: fileExt,
          file_category: uploadCategory,
          file_url: urlData.publicUrl,
          file_size: pendingFile.size,
          description: uploadDescription || null,
        });

      if (dbError) throw dbError;

      toast({
        title: 'Arquivo enviado',
        description: `${pendingFile.name} foi adicionado ao projeto.`,
      });

      setShowUploadDialog(false);
      setPendingFile(null);
      setUploadDescription('');
      fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: ProjectFile) => {
    try {
      // Delete from storage
      const filePath = file.file_url.split('/project-files/')[1];
      if (filePath) {
        await supabase.storage.from('project-files').remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;

      toast({
        title: 'Arquivo excluído',
        description: `${file.file_name} foi removido.`,
      });

      fetchFiles();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o arquivo.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (file: ProjectFile) => {
    window.open(file.file_url, '_blank');
  };

  const getFileIcon = (fileType: string) => {
    const Icon = FILE_ICONS[fileType.toLowerCase()] || FILE_ICONS.default;
    return Icon;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = selectedCategory === 'todos'
    ? files
    : files.filter(f => f.file_category === selectedCategory);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Arquivos do Projeto
              </CardTitle>
              <CardDescription>
                {files.length} arquivo(s) • PDFs, plantas, fotos, cálculos
              </CardDescription>
            </div>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter */}
          <div className="mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {FILE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File List */}
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum arquivo encontrado</p>
              <p className="text-sm">Clique em "Adicionar" para enviar arquivos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map(file => {
                const FileIcon = getFileIcon(file.file_type);
                const category = FILE_CATEGORIES.find(c => c.value === file.file_category);
                
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onFileSelect?.(file)}
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.file_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {category?.label || file.file_category}
                        </Badge>
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(file.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(file)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.gif,.json,.doc,.docx,.xls,.xlsx"
      />

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Arquivo</DialogTitle>
            <DialogDescription>
              {pendingFile?.name} ({formatFileSize(pendingFile?.size || null)})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Categoria</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Input
                value={uploadDescription}
                onChange={e => setUploadDescription(e.target.value)}
                placeholder="Ex: Planta baixa térreo"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
