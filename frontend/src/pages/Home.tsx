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
        <Typography color="error" gutterBottom>Failed to load production suggestions.</Typography>
        <Typography variant="body2" color="text.secondary" onClick={() => refetch()} sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
          Click here to retry
        </Typography>
      </Box>
    );
  }

  const hasSuggestions = suggestions && suggestions.length > 0;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Production Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to AutoFlex. Based on your current raw material inventory and recipes, here is the idealized production plan ordered by maximum profitability.
        </Typography>
      </Box>

      {!hasSuggestions && (
        <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3 }}>
          <PrecisionManufacturingIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No production capacity</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            You don't have enough materials in stock to manufacture any of your registered products. Try editing material inventory.
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
                    label="Most Profitable" 
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
                    <Typography color="text.secondary" variant="body2">Unit Value:</Typography>
                    <Typography fontWeight={500}>${sug.productValue.toFixed(2)}</Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary" variant="body2">Max Possible Output:</Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <InventoryIcon fontSize="small" color="primary" />
                      <Typography fontWeight={700} color="primary.main">{sug.producibleQuantity} units</Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mt={2} pt={2} borderTop={1} borderColor="divider">
                    <Typography fontWeight={600}>Total Potential Revenue:</Typography>
                    <Typography fontWeight={800} color="secondary.main" variant="h6" lineHeight={1}>
                      ${sug.totalValue.toFixed(2)}
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
