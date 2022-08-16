import { CognitoIdentityServiceProvider } from "aws-sdk";
interface User {
    username: string;
    password: string;
    confirmed?: boolean | undefined;
    standardAttributes?: StandardAttributes;
    customAttributes?: {
        [attribute: string]: string;
    };
}
interface CreateUserInput {
    clientId: string;
    userPoolId: string;
    confirmed: boolean;
    standardAttributes?: Array<keyof StandardAttributes>;
    customAttributes?: {
        [key: string]: unknown;
    };
}
interface StandardAttributes {
    address: string;
    birthdate: string;
    email: string;
    family_name: string;
    gender: string;
    given_name: string;
    locale: string;
    middle_name: string;
    name: string;
    nickname: string;
    phone_number: string;
    picture: string;
    preferred_username: string;
    profile: string;
    updated_at: string;
    website: string;
    zoneinfo: string;
}
export declare const createUnauthenticatedUser: (input: CreateUserInput) => Promise<User>;
export declare const createAuthenticatedUser: (input: CreateUserInput) => Promise<CognitoIdentityServiceProvider.AdminConfirmSignUpResponse>;
export {};
