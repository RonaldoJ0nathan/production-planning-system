import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Divider,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';

import {
  useAddProductMutation,
  useUpdateProductMutation,
  useGetProductRawMaterialsQuery,
  useAddAssociationMutation,
  useDeleteAssociationMutation,
} from './productsApi';
import type { Product } from './productsApi';
import { useGetMaterialsQuery } from '../materials/materialsApi';

const schema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  value: z.number().min(0.01, 'O valor deve ser maior que zero'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export default function ProductFormDialog({ open, onClose, productToEdit }: Props) {
  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const isEditing = !!productToEdit;
  const isLoading = isAdding || isUpdating;

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', value: 0 },
  });

  useEffect(() => {
    if (productToEdit && open) {
      reset({ name: productToEdit.name, value: productToEdit.value });
    } else if (!open) {
      reset({ name: '', value: 0 });
    }
  }, [productToEdit, open, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateProduct({ id: productToEdit.id, body: data }).unwrap();
        toast.success('Produto atualizado com sucesso!');
        onClose(); // In edit mode, we can close (materials are edited inline)
      } else {
        await addProduct(data).unwrap();
        toast.success('Produto criado! Agora você pode vincular materiais.');
        onClose();
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any)?.data?.message || 'Falha ao salvar produto');
    }
  };

  // --- Associations Logic (only visible if editing) ---
  const { data: associations } = useGetProductRawMaterialsQuery(
    productToEdit?.id ?? 0,
    { skip: !isEditing }
  );
  const { data: materials } = useGetMaterialsQuery(undefined, {
    skip: !isEditing,
  });
  const [addAssoc, { isLoading: isAddingAssoc }] = useAddAssociationMutation();
  const [deleteAssoc] = useDeleteAssociationMutation();

  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
  const [requiredQty, setRequiredQty] = useState<number | ''>('');

  const handleAddAssociation = async () => {
    if (!productToEdit || !selectedMaterialId || !requiredQty) return;
    try {
      await addAssoc({
        productId: productToEdit.id,
        rawMaterialId: selectedMaterialId as number,
        requiredQuantity: requiredQty as number,
      }).unwrap();
      setSelectedMaterialId('');
      setRequiredQty('');
      toast.success('Material vinculado com sucesso!');
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any)?.data?.message || 'Falha ao vincular material');
    }
  };

  const handleDeleteAssociation = async (assocId: number) => {
    if (!productToEdit) return;
    try {
      await deleteAssoc({ id: assocId, productId: productToEdit.id }).unwrap();
      toast.success('Vínculo removido com sucesso!');
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any)?.data?.message || 'Falha ao remover vínculo');
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Produto e Receita' : 'Novo Produto'}</DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome do Produto"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isLoading}
                />
              )}
            />
            <Controller
              name="value"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  label="Valor do Produto (Preço)"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                  value={value === undefined ? '' : value}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    onChange(isNaN(parsed) ? '' : parsed);
                  }}
                  error={!!errors.value}
                  helperText={errors.value?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Sub-form for composing the product with Raw Materials */}
            {isEditing && (
              <Box mt={2}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Receita de Produção (Materiais Vinculados)
                </Typography>

                <List dense sx={{ bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                  {associations?.length === 0 && (
                    <ListItem>
                      <ListItemText secondary="Nenhum material vinculado ainda. Adicione alguns abaixo." />
                    </ListItem>
                  )}
                  {associations?.map((assoc) => (
                    <ListItem
                      key={assoc.id}
                      secondaryAction={
                        <IconButton edge="end" color="error" onClick={() => handleDeleteAssociation(assoc.id)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={assoc.rawMaterialName}
                        secondary={`Requer ${assoc.requiredQuantity} unidades por produto`}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box display="flex" gap={2} alignItems="center">
                  <FormControl fullWidth size="small">
                    <InputLabel>Material</InputLabel>
                    <Select
                      value={selectedMaterialId}
                      label="Material"
                      onChange={(e) => setSelectedMaterialId(e.target.value as number)}
                    >
                      {materials?.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name} (Estoque: {m.stockQuantity})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Qtd. Necessária"
                    size="small"
                    type="number"
                    sx={{ width: 140 }}
                    value={requiredQty}
                    onChange={(e) => setRequiredQty(parseFloat(e.target.value) || '')}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={handleAddAssociation}
                    disabled={!selectedMaterialId || !requiredQty || isAddingAssoc}
                  >
                    <AddCircleIcon fontSize="large" />
                  </IconButton>
                </Box>
              </Box>
            )}

          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            Cancelar / Fechar
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Detalhes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
