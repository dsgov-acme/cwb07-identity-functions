import { config, getUserTypeByTenant } from '../common/config';
import { client, UserResponse } from '../client/user-management-client';
import { UserRecord } from 'gcip-cloud-functions';
import { ProfileLink } from '../client/user-management-client';
import { parse as parseUuid } from 'uuid';


export async function createUserForRemote(user: UserRecord): Promise<UserResponse> {
    const userType: 'agency' | 'public' = getUserTypeByTenant(user.tenantId);
    return client.createUser({
        displayName: user.displayName || user.email,
        email: user.email,
        externalId: user.uid,
        identityProvider: config.identityProvider,
        userType
    }, true);
}

export async function getUserFromRemote(user: UserRecord): Promise<UserResponse> {
    const apiUser: UserResponse | null = await client.getUserByExternalId(config.identityProvider, user.uid, true, true);
    if (apiUser === null) {
        return createUserForRemote(user);
    }

    return apiUser;
}

export async function processUserProfiles(profiles: ProfileLink[]): Promise<string[] | null> {
    if (profiles.length > 20) {
        return null;
    }

    return profiles.map(profile => {
        const encodedType = encodeProfileType(profile.type);
        const encodedId = Buffer.from(parseUuid(profile.id)).toString('base64').replace(/=+$/, '');
        const accessLevel = profile.accessLevel;
        return `${encodedType}:${encodedId}:${accessLevel}`;
    });
}

function encodeProfileType(type: 'employer' | 'individual'): string {
    switch (type) {
        case 'employer': return 'EM';
        case 'individual': return 'IN';
        default: throw new Error(`Unknown profile type: ${type}`);
    }
}
