

// export const handleFileUploaded = (file) => {
//     // Call your /api/newjob endpoint with the uploaded file here
//     const formData = new FormData();
//     formData.append('file', file);
//     fetch('/api/newjob', {
//         method: 'POST',
//         body: formData,
//     })
//     .then((response) => response.json())
//     .then((data) => {
//         console.log('File uploaded and processed:', data);
//         return data;
//     })
//     .catch((error) => {
//         console.error('Error uploading file:', error);
//     });
// };