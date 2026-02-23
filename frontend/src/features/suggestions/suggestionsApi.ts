import { apiSlice } from '../../store/apiSlice';

export interface ProductionSuggestion {
  productId: number;
  productName: string;
  productValue: number;
  producibleQuantity: number;
  totalValue: number;
}

export const suggestionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSuggestions: builder.query<ProductionSuggestion[], void>({
      query: () => '/production-suggestions',
      // We listen to Product and RawMaterial invalidations because
      // any change in inventory or recipes affects production capacity.
      providesTags: ['ProductionSuggestion', 'RawMaterial', 'Product', 'ProductRawMaterial'],
    }),
  }),
});

export const { useGetSuggestionsQuery } = suggestionsApi;
