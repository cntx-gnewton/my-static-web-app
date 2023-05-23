//  ./services/userProducts.api.js

export const handleFileUploaded = (file, setProducts) => {
    const formData = new FormData();
    formData.append('file', file);
    fetch('/api/newjob', {
        method: 'POST',
        body: formData,
    })
    .then((response) => response.json())
      .then((data) => {
        console.log('File uploaded and processed:', data);
        setProducts(data);
        // const parsed_data = parseList(data, 200);
        // console.log('Parsed data:', parsed_data);
    })
    .catch((error) => {
      console.error('Error uploading file:', error);
    });
};