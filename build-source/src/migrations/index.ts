import * as migration_20260926_172653_init_affiliate_and_ai from './20260926_172653_init_affiliate_and_ai';
import * as migration_20260926_204830_add_faq_block from './20260926_204830_add_faq_block';
import * as migration_20261023_093000_add_products from './20261023_093000_add_products';
import * as migration_20261023_101500_products_takeads_network_notes from './20261023_101500_products_takeads_network_notes';

export const migrations = [
  {
    up: migration_20260926_172653_init_affiliate_and_ai.up,
    down: migration_20260926_172653_init_affiliate_and_ai.down,
    name: '20260926_172653_init_affiliate_and_ai',
  },
  {
    up: migration_20260926_204830_add_faq_block.up,
    down: migration_20260926_204830_add_faq_block.down,
    name: '20260926_204830_add_faq_block'
  },
  {
    up: migration_20261023_093000_add_products.up,
    down: migration_20261023_093000_add_products.down,
    name: '20261023_093000_add_products',
  },
  {
    up: migration_20261023_101500_products_takeads_network_notes.up,
    down: migration_20261023_101500_products_takeads_network_notes.down,
    name: '20261023_101500_products_takeads_network_notes',
  },
];
