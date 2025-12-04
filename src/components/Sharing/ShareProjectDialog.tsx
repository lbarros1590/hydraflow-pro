/**
 * Diálogo de Compartilhamento de Projeto
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Share2,
  UserPlus,
  Trash2,
  Mail,
  Eye,
  MessageSquare,
  Edit,
  Copy,
  Check,
} from 'lucide-react';

interface ProjectShare {
  id: string;
  project_id: string;
  owner_id: string;
  shared_with_email: string;
  shared_with_user_id: string | null;
  permission: string;
  accepted_at: string | null;
  created_at: string;
}

const PERMISSIONS = [
  { value: 'view', label: 'Visualizar', icon: Eye, description: 'Pode ver o projeto' },
  { value: 'comment', label: 'Comentar', icon: MessageSquare, description: 'Pode ver e adicionar revisões' },
  { value: 'edit', label: 'Editar', icon: Edit, description: 'Pode editar o projeto' },
];

interface ShareProjectDialogProps {
  projectId: string;
  projectName: string;
  trigger?: React.ReactNode;
}

export function ShareProjectDialog({ projectId, projectName, trigger }: ShareProjectDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState<ProjectShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      fetchShares();
    }
  }, [open, projectId]);

  const fetchShares = async () => {
    try {
      const { data, error } = await supabase
        .from('project_shares')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error('Error fetching shares:', error);
    }
  };

  const handleShare = async () => {
    if (!email || !user) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, insira um email válido.',
        variant: 'destructive',
      });
      return;
    }

    // Check if already shared
    if (shares.some(s => s.shared_with_email.toLowerCase() === email.toLowerCase())) {
      toast({
        title: 'Já compartilhado',
        description: 'Este projeto já foi compartilhado com este email.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_shares')
        .insert({
          project_id: projectId,
          owner_id: user.id,
          shared_with_email: email.toLowerCase(),
          permission,
        });

      if (error) throw error;

      toast({
        title: 'Projeto compartilhado',
        description: `Convite enviado para ${email}`,
      });

      setEmail('');
      fetchShares();
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Erro ao compartilhar',
        description: 'Não foi possível compartilhar o projeto.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: 'Acesso removido',
        description: 'O compartilhamento foi revogado.',
      });

      fetchShares();
    } catch (error) {
      console.error('Remove share error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o acesso.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePermission = async (shareId: string, newPermission: string) => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .update({ permission: newPermission })
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: 'Permissão atualizada',
        description: 'A permissão foi alterada com sucesso.',
      });

      fetchShares();
    } catch (error) {
      console.error('Update permission error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a permissão.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/app/projects/${projectId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Link copiado',
      description: 'O link do projeto foi copiado para a área de transferência.',
    });
  };

  const getPermissionIcon = (perm: string) => {
    const p = PERMISSIONS.find(p => p.value === perm);
    return p?.icon || Eye;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Projeto
          </DialogTitle>
          <DialogDescription>
            {projectName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new share */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Email do colaborador"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERMISSIONS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <p.icon className="h-4 w-4" />
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleShare} disabled={loading || !email} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Enviando...' : 'Convidar'}
            </Button>
          </div>

          {/* Copy link */}
          <div className="flex gap-2">
            <Input
              readOnly
              value={`${window.location.origin}/app/projects/${projectId}`}
              className="text-sm"
            />
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Current shares */}
          {shares.length > 0 && (
            <div className="space-y-3">
              <Label>Pessoas com acesso</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {shares.map(share => {
                  const PermIcon = getPermissionIcon(share.permission);
                  return (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{share.shared_with_email}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <PermIcon className="h-3 w-3 mr-1" />
                              {PERMISSIONS.find(p => p.value === share.permission)?.label}
                            </Badge>
                            {share.accepted_at && (
                              <Badge variant="secondary" className="text-xs">Ativo</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={share.permission}
                          onValueChange={v => handleUpdatePermission(share.id, v)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PERMISSIONS.map(p => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveShare(share.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
