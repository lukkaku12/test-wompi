import { client } from './client'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string | null
  availableUnits: number
}

export const getProducts = async () => client<Product[]>('/products')
