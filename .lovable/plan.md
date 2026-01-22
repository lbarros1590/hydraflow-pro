

## Correção do Erro de Tamanho de Coluna

### Problema Identificado

A tabela `regulation_activities` possui a coluna `occupancy_group` definida como `varchar(5)`, mas os valores do Anexo A da NTCB 07/2020 contêm textos maiores:

| Valor | Tamanho | Limite |
|-------|---------|--------|
| Residencial | 10 chars | 5 chars |
| Serviço de Hospedagem | 21 chars | 5 chars |
| Comercial | 9 chars | 5 chars |

### Solução

Alterar o tipo da coluna `occupancy_group` de `varchar(5)` para `varchar(50)` para acomodar os nomes completos dos grupos de ocupação.

### Passos da Implementação

1. **Alterar a estrutura da coluna** via migration:

```text
ALTER TABLE regulation_activities 
ALTER COLUMN occupancy_group TYPE varchar(50);
```

2. **Após a alteração**, os INSERTs com valores como 'Residencial', 'Serviço de Hospedagem' e 'Comercial' funcionarão corretamente.

### Observações Técnicas

- A alteração de `varchar(5)` para `varchar(50)` é uma operação segura e não requer reconstrução da tabela
- Não há dados existentes na tabela (foi limpa anteriormente), portanto não há risco de perda de dados
- A coluna `fire_load_unit` também é `varchar(20)`, suficiente para 'MJ/m2' (6 caracteres)

