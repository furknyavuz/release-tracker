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
    "gatsbyEndpoint": "https://api.netlify.com/build_hooks/5c956202a33991f9a62144ea"
};
