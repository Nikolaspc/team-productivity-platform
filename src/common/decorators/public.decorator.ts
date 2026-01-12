// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

// English: Key used to identify public routes in the reflector
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
