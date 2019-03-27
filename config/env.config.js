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
    "githubAccessToken": "2fa1cce9d1485592425ef9297e93a2f1d4ce7b24",
    "gatsbyEndpoint": "https://api.netlify.com/build_hooks/5c956202a33991f9a62144ea"
};
