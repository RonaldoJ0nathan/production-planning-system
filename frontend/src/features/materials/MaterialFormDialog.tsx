import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import {
  useAddMaterialMutation,
  useUpdateMaterialMutation,
} from './materialsApi';
import type { RawMaterial } from './materialsApi';

const schema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  stockQuantity: z.number().min(0, 'A quantidade não pode ser negativa'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  materialToEdit?: RawMaterial | null;
}

export default function MaterialFormDialog({ open, onClose, materialToEdit }: Props) {
  const [addMaterial, { isLoading: isAdding }] = useAddMaterialMutation();
  const [updateMaterial, { isLoading: isUpdating }] = useUpdateMaterialMutation();

  const isEditing = !!materialToEdit;
  const isLoading = isAdding || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      stockQuantity: 0,
    },
  });

  useEffect(() => {
    if (materialToEdit && open) {
      reset({
        name: materialToEdit.name,
        stockQuantity: materialToEdit.stockQuantity,
      });
    } else if (!open) {
      reset({ name: '', stockQuantity: 0 }); // Clean up on close
    }
  }, [materialToEdit, open, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateMaterial({ id: materialToEdit.id, body: data }).unwrap();
        toast.success('Matéria-prima atualizada com sucesso!');
      } else {
        await addMaterial(data).unwrap();
        toast.success('Matéria-prima criada com sucesso!');
      }
      onClose();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any)?.data?.message || 'Falha ao salvar a matéria-prima');
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Matéria Prima' : 'Nova Matéria Prima'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome do Material"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isLoading}
                />
              )}
            />
            <Controller
              name="stockQuantity"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Quantidade em Estoque"
                  fullWidth
                  value={value === undefined ? '' : value}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    onChange(isNaN(parsed) ? '' : parsed);
                  }}
                  error={!!errors.stockQuantity}
                  helperText={errors.stockQuantity?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Material'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
