import { Typography, Box, Paper, Grid, CircularProgress, Card, CardContent, Divider, Chip } from '@mui/material';
import { useGetSuggestionsQuery } from '../features/suggestions/suggestionsApi';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import InventoryIcon from '@mui/icons-material/Inventory';

export default function Home() {
  const { data: suggestions, isLoading, isError, refetch } = useGetSuggestionsQuery();

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
        <Typography color="error" gutterBottom>Falha ao carregar as sugestões de produção.</Typography>
        <Typography variant="body2" color="text.secondary" onClick={() => refetch()} sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
          Clique aqui para tentar novamente
        </Typography>
      </Box>
    );
  }

  const hasSuggestions = suggestions && suggestions.length > 0;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard de Produção
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bem-vindo ao AutoFlex. Com base no seu estoque atual de matérias-primas e receitas, aqui está o plano de produção idealizado ordenado pela rentabilidade máxima.
        </Typography>
      </Box>

      {!hasSuggestions && (
        <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3 }}>
          <PrecisionManufacturingIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Nenhuma capacidade de produção</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Você não possui materiais suficientes em estoque para fabricar nenhum dos seus produtos registrados. Tente adicionar inventário de materiais.
          </Typography>
        </Paper>
      )}

      {hasSuggestions && (
        <Grid container spacing={3}>
          {suggestions.map((sug, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={sug.productId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
                {index === 0 && (
                  <Chip 
                    label="Mais Rentável" 
                    color="secondary" 
                    icon={<TrendingUpIcon />} 
                    sx={{ position: 'absolute', top: -14, right: 16, fontWeight: 'bold' }} 
                  />
                )}
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {sug.productName}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary" variant="body2">Valor Unitário:</Typography>
                    <Typography fontWeight={500}>R$ {sug.productValue.toFixed(2)}</Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary" variant="body2">Produção Máxima Possível:</Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <InventoryIcon fontSize="small" color="primary" />
                      <Typography fontWeight={700} color="primary.main">{sug.producibleQuantity} unidades</Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mt={2} pt={2} borderTop={1} borderColor="divider">
                    <Typography fontWeight={600}>Receita Total Potencial:</Typography>
                    <Typography fontWeight={800} color="secondary.main" variant="h6" lineHeight={1}>
                      R$ {sug.totalValue.toFixed(2)}
                    </Typography>
                  </Box>

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
