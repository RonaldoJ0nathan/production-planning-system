import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';

import {
  useGetMaterialsQuery,
  useDeleteMaterialMutation,
} from '../features/materials/materialsApi';
import type { RawMaterial } from '../features/materials/materialsApi';
import MaterialFormDialog from '../features/materials/MaterialFormDialog';

export default function Materials() {
  const { data: materials, isLoading, isError, refetch } = useGetMaterialsQuery();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const handleOpenNew = () => {
    setEditingMaterial(null);
    setDialogOpen(true);
  };

  const handleEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza de que deseja excluir esta matéria-prima?')) {
      try {
        await deleteMaterial(id).unwrap();
        toast.success('Matéria-prima excluída com sucesso');
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error((err as any)?.data?.message || 'Falha ao excluir matéria-prima');
      }
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">Falha ao carregar as matérias-primas.</Typography>
        <Button onClick={() => refetch()} sx={{ mt: 2 }}>Tentar Novamente</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Matérias Primas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNew}
        >
          Adicionar Matéria Prima
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Nome</b></TableCell>
                <TableCell align="right"><b>Estoque (Qtd)</b></TableCell>
                <TableCell align="center"><b>Ações</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">Nenhuma matéria-prima encontrada. Adicione uma para começar.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                materials?.map((mat) => (
                  <TableRow key={mat.id} hover>
                    <TableCell>{mat.id}</TableCell>
                    <TableCell>{mat.name}</TableCell>
                    <TableCell align="right">{mat.stockQuantity}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEdit(mat)} size="small" sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(mat.id)} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <MaterialFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        materialToEdit={editingMaterial}
      />
    </Box>
  );
}
