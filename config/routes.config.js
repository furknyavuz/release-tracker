const UsersController = require('../users/controllers/users.controller');
const GitHubController = require('../github-releases/controllers/github-release.controller');
const GitHubReleaseGroupController = require('../github-releases/controllers/github-release-group.controller');
const PermissionMiddleware = require('../authorization/middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../authorization/middlewares/auth.validation.middleware');
const config = require('./env.config');

const ADMIN = config.permissionLevels.ADMIN;
const PAID = config.permissionLevels.PAID_USER;
const FREE = config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {
    app.post('/github-releases', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        GitHubController.insert
    ]);
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
