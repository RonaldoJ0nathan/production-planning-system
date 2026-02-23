import { apiSlice } from '../../store/apiSlice';

export interface Product {
  id: number;
  name: string;
  value: number;
}

export type ProductRequest = Omit<Product, 'id'>;

export interface ProductRawMaterial {
  id: number;
  productId: number;
  productName: string;
  rawMaterialId: number;
  rawMaterialName: string;
  requiredQuantity: number;
}

export interface ProductRawMaterialRequest {
  productId: number;
  rawMaterialId: number;
  requiredQuantity: number;
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    addProduct: builder.mutation<Product, ProductRequest>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<Product, { id: number; body: ProductRequest }>({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // Associations
    getProductRawMaterials: builder.query<ProductRawMaterial[], number>({
      query: (productId) => `/product-raw-materials/product/${productId}`,
      providesTags: (result, _error, productId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ProductRawMaterial' as const, id })),
              { type: 'ProductRawMaterial', id: `PRODUCT_${productId}` },
            ]
          : [{ type: 'ProductRawMaterial', id: `PRODUCT_${productId}` }],
    }),
    addAssociation: builder.mutation<ProductRawMaterial, ProductRawMaterialRequest>({
      query: (body) => ({
        url: '/product-raw-materials',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'ProductRawMaterial', id: `PRODUCT_${productId}` },
      ],
    }),
    deleteAssociation: builder.mutation<void, { id: number; productId: number }>({
      query: ({ id }) => ({
        url: `/product-raw-materials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, productId }) => [
        { type: 'ProductRawMaterial', id },
        { type: 'ProductRawMaterial', id: `PRODUCT_${productId}` },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductRawMaterialsQuery,
  useAddAssociationMutation,
  useDeleteAssociationMutation,
} = productsApi;
