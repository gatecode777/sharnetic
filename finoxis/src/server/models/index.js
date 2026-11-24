// Importing this module registers every Mongoose model.
// Express loaded all models at boot; in Next.js each route bundle only pulls in what it
// imports, so populate('category' | 'seller' | 'user' | ...) needs this central registry.
import Address from './Address';
import Admin from './Admin';
import Cart from './Cart';
import Category from './Category';
import Enquiry from './Enquiry';
import Order from './Order';
import Product from './Product';
import Seller from './Seller';
import User from './User';

export { Address, Admin, Cart, Category, Enquiry, Order, Product, Seller, User };
