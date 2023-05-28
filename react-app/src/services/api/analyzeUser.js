
export const runProductPipeline = async (file) => {
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
