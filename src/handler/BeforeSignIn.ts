import { AuthEventContext, UserEventUpdateRequest, UserRecord } from 'gcip-cloud-functions';
import { logger } from '../common/logging';
import { getUserFromRemote, processUserProfiles } from '../common/user-service';
import { UserResponse } from '../client/user-management-client';

export async function beforeSignInHandler(user: UserRecord, context: AuthEventContext): Promise<UserEventUpdateRequest> {
    logger.mdc.user = user;
    logger.mdc.context = context;

    logger.info('User has logged in.');

    let apiUser: UserResponse = await getUserFromRemote(user);

    let processedProfiles = await processUserProfiles(apiUser.profiles);

    return {
        sessionClaims: {
            name: apiUser.displayName,
            application_user_id: apiUser.id,
            roles: apiUser.applicationRoles || [],
            user_type: apiUser.userType,
            profile_id: apiUser.profile.id,
            profiles: processedProfiles
        }
    };
}
