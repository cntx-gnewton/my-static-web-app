// filename: src/services/handlers.js
// Description: This file contains the handlers for the Azure Functions that are used to interact with the Azure Cosmos DB database. The handlers are used by the React app to create, read, update, and delete data from the database.

export async function getUserInfo() {
    try {
        const response = await fetch('/.auth/me');
        const payload = await response.json();
        const { clientPrincipal } = payload;
        return clientPrincipal;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('No profile could be found');
        return undefined;
    }
}

export const runSNPPipeline = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await fetch('/api/newjob', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        console.log('File uploaded and processed:', data);
        return data;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};
