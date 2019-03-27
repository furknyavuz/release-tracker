const UsersController = require('../controller/users.controller');
const GitHubController = require('../controller/github-release.controller');
const GitHubReleaseGroupController = require('../controller/github-release-group.controller');
const PermissionMiddleware = require('../middleware/auth.permission.middleware');
const ValidationMiddleware = require('../middleware/auth.validation.middleware');
const VerifyUserMiddleware = require('../middleware/verify.user.middleware');
const AuthorizationController = require('../controller/authorization.controller');
const AuthValidationMiddleware = require('../middleware/auth.validation.middleware');
const Config = require('./env.config');

const ADMIN = Config.permissionLevels.ADMIN;

exports.routesConfig = function (app) {

    app.post('/auth', [
        VerifyUserMiddleware.hasAuthValidFields,
        VerifyUserMiddleware.isPasswordAndUserMatch,
        AuthorizationController.login
    ]);

    app.post('/auth/refresh', [
        AuthValidationMiddleware.validJWTNeeded,
        AuthValidationMiddleware.verifyRefreshBodyField,
        AuthValidationMiddleware.validRefreshNeeded,
        AuthorizationController.login
    ]);

    // Inserting new repositories only allowed for admin
    app.post('/github-releases', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        GitHubController.insert
    ]);

    // Inserting new groups only allowed for admin
    app.post('/github-releases/group', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        GitHubReleaseGroupController.insert
    ]);

    app.get('/github-releases', [
        GitHubController.listByGroup
    ]);

    app.get('/github-releases/group', [
        GitHubReleaseGroupController.list
    ]);

    app.patch('/github-releases/:gitHubReleaseId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        GitHubController.patchById
    ]);

    app.post('/users', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.insert
    ]);

    app.get('/users', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.list
    ]);

    app.get('/users/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.getById
    ]);

    app.patch('/users/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.patchById
    ]);

    app.delete('/users/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.removeById
    ]);
};
