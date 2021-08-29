process.env = Object.assign(process.env, {
    AWS_DEFAULT_REGION: 'local-env',
    AWS_DYNAMODB_ENDPOINT: 'http://localhost:8080'
});