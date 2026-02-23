import { Typography, Box, Paper, Grid } from '@mui/material';

export default function Home() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Production Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to AutoFlex. Navigate through the menu to manage products and raw materials.
      </Typography>
      
      <Grid container spacing={3} mt={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Products</Typography>
            <Typography variant="body2" color="text.secondary">Configure production items</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Raw Materials</Typography>
            <Typography variant="body2" color="text.secondary">Manage inventory levels</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Suggestions</Typography>
            <Typography variant="body2" color="text.secondary">Calculate production potential</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
