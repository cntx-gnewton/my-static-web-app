export const queryUserById = {
    query: 'SELECT * FROM Users WHERE Users.id = @id',
    parameters: [
        { name: '@id', value: '23587f434271b05b39e6f20a7c98e432' }
    ]
};