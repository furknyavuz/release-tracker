module.exports = {
    "port": process.env.PORT || 3000,
    "jwt_secret": "release-tracker-secret123",
    "jwt_expiration_in_seconds": 36000,
    "environment": "dev",
    "permissionLevels": {
        "NORMAL_USER": 1,
        "ADMIN": 2
    },
    "mongoDbUri": process.env.MONGODB_URI || "mongodb://localhost/release-tracker",
    "githubEndpoint": "https://api.github.com/graphql",
    "githubAccessToken": process.env.GITHUB_ACCESS_TOKEN,
    "netlifyEndpoint": process.env.NETLIFY_BUILD_HOOK
};
