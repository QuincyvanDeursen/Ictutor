
import { Role } from './role.enum';

export interface User {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: Role[];
}
