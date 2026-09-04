export type Role = 'retailer' | 'dispatcher' | 'rider'
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'delivered'

export interface Profile {
  id: string
  full_name: string
  role: Role
  created_at: string
}

export interface Delivery {
  id: string
  retailer_id: string
  customer_name: string
  phone: string
  address: string
  item: string
  status: DeliveryStatus
  rider_id: string | null
  proof_scan: string | null
  confirmation_code: string
  created_at: string
  updated_at: string
  rider?: Profile | null
}
