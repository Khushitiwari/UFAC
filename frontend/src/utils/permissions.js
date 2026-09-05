export const isContact = (user) => user?.role === 'CONTACT';

export const isAdmin = (user) => user?.role === 'ADMIN';

export const isStaff = (user) => user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';

export const canWrite = (user) => isStaff(user);

export const canDelete = (user) => isAdmin(user);

export const canManagePortalUsers = (user) => isAdmin(user);

export const canViewReports = (user) => isStaff(user);
