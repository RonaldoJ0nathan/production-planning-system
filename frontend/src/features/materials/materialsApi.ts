import { apiSlice } from '../../store/apiSlice';

export interface RawMaterial {
  id: number;
  name: string;
  stockQuantity: number;
}

export type RawMaterialRequest = Omit<RawMaterial, 'id'>;

export const materialsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMaterials: builder.query<RawMaterial[], void>({
      query: () => '/raw-materials',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'RawMaterial' as const, id })),
              { type: 'RawMaterial', id: 'LIST' },
            ]
          : [{ type: 'RawMaterial', id: 'LIST' }],
    }),
    
    getMaterial: builder.query<RawMaterial, number>({
      query: (id) => `/raw-materials/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'RawMaterial', id }],
    }),

    addMaterial: builder.mutation<RawMaterial, RawMaterialRequest>({
      query: (body) => ({
        url: '/raw-materials',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RawMaterial', id: 'LIST' }],
    }),

    updateMaterial: builder.mutation<RawMaterial, { id: number; body: RawMaterialRequest }>({
      query: ({ id, body }) => ({
        url: `/raw-materials/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'RawMaterial', id }],
    }),

    deleteMaterial: builder.mutation<void, number>({
      query: (id) => ({
        url: `/raw-materials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'RawMaterial', id },
        { type: 'RawMaterial', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetMaterialsQuery,
  useGetMaterialQuery,
  useAddMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} = materialsApi;
