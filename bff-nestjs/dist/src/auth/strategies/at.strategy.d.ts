import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';
type JwtPayload = {
    sub: number;
    email: string;
    role: Role;
};
declare const AtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class AtStrategy extends AtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): JwtPayload;
}
export {};
