import type { AdminSellerFull, AdminSellerShopFields } from '../types/admin';

export function pickShopFields(seller: AdminSellerFull['seller']): AdminSellerShopFields {
  const {
    id: _id,
    email: _e,
    username: _u,
    shopName: _sn,
    country: _c,
    currency: _cur,
    logo: _l,
    suspended: _s,
    dashboardSuspended: _ds,
    createdAt: _ca,
    updatedAt: _ua,
    ...shop
  } = seller;
  return shop;
}
