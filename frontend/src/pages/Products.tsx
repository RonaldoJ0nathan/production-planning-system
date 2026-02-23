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
  useGetProductsQuery,
  useDeleteProductMutation,
} from '../features/products/productsApi';
import type { Product } from '../features/products/productsApi';
import ProductFormDialog from '../features/products/ProductFormDialog';

export default function Products() {
  const { data: products, isLoading, isError, refetch } = useGetProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenNew = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product? All its material links will be lost.')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted successfully');
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error((err as any)?.data?.message || 'Failed to delete product');
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
        <Typography color="error">Failed to load products.</Typography>
        <Button onClick={() => refetch()} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNew}
        >
          Add Product
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Product Name</b></TableCell>
                <TableCell align="right"><b>Value ($)</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No products found. Add one to get started.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products?.map((prod) => (
                  <TableRow key={prod.id} hover>
                    <TableCell>{prod.id}</TableCell>
                    <TableCell>{prod.name}</TableCell>
                    <TableCell align="right">{prod.value.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEdit(prod)} size="small" sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(prod.id)} size="small">
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

      <ProductFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        productToEdit={editingProduct}
      />
    </Box>
  );
}
