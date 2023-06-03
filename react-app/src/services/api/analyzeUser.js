// Filename: services\api\analyzeUser.js
// Description: Runs the api call to the backend to analyze the user's genome
export const runProductPipeline = async (file, surveyData) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('surveyData', JSON.stringify(surveyData));
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