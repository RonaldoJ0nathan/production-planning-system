import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
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
  Stepper,
  Step,
  StepLabel,
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

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  // Store the newly created product ID during the creation flow so we can attach materials to it in Step 2
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);

  // The effectively active product ID (either the one we are editing, or the one we just created in step 1)
  const effectiveProductId = productToEdit?.id || createdProductId;

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', value: 0 },
  });

  // Set form defaults when opening with or without a product to edit
  useEffect(() => {
    if (open) {
      if (productToEdit) {
        reset({ name: productToEdit.name, value: productToEdit.value });
      } else {
        reset({ name: '', value: 0 });
      }
    }
  }, [open, productToEdit, reset]);

  const handleClose = () => {
    onClose();
    // Delay resetting steps to avoid visual jumps while modal is closing
    setTimeout(() => {
      setActiveStep(0);
      setCreatedProductId(null);
    }, 200);
  };

  const handleNextStep = async (data: FormData) => {
    try {
      if (isEditing && productToEdit) {
        if (!isDirty) {
          setActiveStep(1); // Skip API call and go to next step
          return;
        }
        await updateProduct({ id: productToEdit.id, body: data }).unwrap();
        toast.success('Produto atualizado com sucesso!');
        setActiveStep(1); // Move to recipe step
      } else {
        const newProduct = await addProduct(data).unwrap();
        setCreatedProductId(newProduct.id);
        toast.success('Produto criado! Configure a receita a seguir.');
        setActiveStep(1); // Move to recipe step
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any)?.data?.message || 'Falha ao salvar produto');
    }
  };

  const handleFinish = () => {
    handleClose();
  };

  // --- Associations Logic (only visible if editing or after creation in Step 1) ---
  const showRecipe = activeStep === 1;
  const { data: associations } = useGetProductRawMaterialsQuery(
    effectiveProductId ?? 0,
    { skip: !showRecipe || !effectiveProductId }
  );
  const { data: materials } = useGetMaterialsQuery(undefined, {
    skip: !showRecipe,
  });
  const [addAssoc, { isLoading: isAddingAssoc }] = useAddAssociationMutation();
  const [deleteAssoc] = useDeleteAssociationMutation();

  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
  const [requiredQty, setRequiredQty] = useState<number | ''>('');

  const handleAddAssociation = async () => {
    if (!effectiveProductId || !selectedMaterialId || !requiredQty) return;
    try {
      await addAssoc({
        productId: effectiveProductId,
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
    if (!effectiveProductId) return;
    try {
      await deleteAssoc({ id: assocId, productId: effectiveProductId }).unwrap();
      toast.success('Vínculo removido com sucesso!');
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any)?.data?.message || 'Falha ao remover vínculo');
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Configurar Produto' : 'Novo Produto'}</DialogTitle>
      
      <Box sx={{ width: '100%', pt: 1, px: 3, pb: 2 }}>
        <Stepper activeStep={activeStep}>
          <Step>
            <StepLabel>Informações Principais</StepLabel>
          </Step>
          <Step>
            <StepLabel>Receita de Produção (Opcional)</StepLabel>
          </Step>
        </Stepper>
      </Box>

      <form onSubmit={handleSubmit(handleNextStep)}>
        <DialogContent dividers>
          
          {activeStep === 0 && (
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
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
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
            </Stack>
          )}

          {/* Sub-form for composing the product with Raw Materials */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Adicione as matérias-primas necessárias para fabricar uma unidade deste produto. Você pode ignorar esta etapa e concluir se preferir.
              </Typography>

              <List dense sx={{ bgcolor: 'background.default', borderRadius: 1, my: 2 }}>
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

        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleClose} disabled={isLoading} color="inherit">
            {activeStep === 0 ? 'Cancelar' : 'Fechar'}
          </Button>
          
          <Box>
            {activeStep === 0 ? (
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isEditing && !isDirty
                  ? 'Ver Receita (Avançar)'
                  : isLoading
                  ? 'Salvando...' : 'Salvar e Ver Receita'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleFinish}>
                Concluir Definição
              </Button>
            )}
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}
