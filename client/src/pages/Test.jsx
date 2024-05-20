import {useEffect, useState} from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../styles/Test.css';

export default function Test() {
    const [downloadUrl,
        setDownloadUrl] = useState(null);
    const [fileName,
        setFileName] = useState('');
    const [file,
        setFile] = useState(null);

    // Handler for file selection
    const handleFileChange = (event) => {
        setFile(event.target.files[0]); // Set the selected file
    };

    // Handler for uploading the file
   // Handler for uploading the file
const handleUpload = () => {
    if (file) {
        const formData = new FormData();
        formData.append("file", file); // Append the file to form data

        // POST request to server
        axios.post('http://localhost:5000/user/data', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            console.log('Response:', response.data);
            alert('File uploaded successfully');
            // Assuming the response from the server includes the file's original name
            setFileName(file.name.replace('.csv', '')); // Remove .csv from file name
        })
        .catch(error => {
            console.error('Upload error:', error);
            alert('Error uploading file');
        });
    } else {
        alert('Please select a file to upload');
    }
};


    // useEffect to handle GET request and processing
    useEffect(() => {
        axios
            .get('http://localhost:5000/user/data')
            .then(response => {
                const fileBuffer = response.data.data[0].file.data;
                let localFileName = response.data.data[0].filename;
                console.log(localFileName);

                if (localFileName.endsWith('.csv')) {
                    localFileName = localFileName.replace('.csv', '');
                }

                setFileName(localFileName); // Update state with the modified filename

                // Convert buffer to workbook
                const workbook = XLSX.read(fileBuffer, {type: 'array'});

                // Convert workbook to binary Excel data
                const excelData = XLSX.write(workbook, {
                    type: 'array',
                    bookType: 'xlsx'
                });

                // Create a Blob object with the Excel data
                const blob = new Blob([excelData], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});

                // Create and save the URL for the Blob
                const url = URL.createObjectURL(blob);
                setDownloadUrl(url); // Store the URL in state
            })
            .catch(error => {
                console.error('Error:', error);
            });

        // Cleanup function to revoke the Blob URL when the component unmounts
        return () => {
            if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
            }
        };
    }, []); // Runs only on component mount

    return (
        <div className="container">

            {downloadUrl && (
                <a
                    href={downloadUrl}
                    download={fileName}
                    style={{
                    textDecoration: 'none'
                }}>
                    <button className="button">Download File</button>
                </a>

            )}
            
            <div>
                <button className="button" onClick={handleUpload}>Upload File</button>
            </div>
            <input type="file" className="input-file" onChange={handleFileChange}/>
        </div>
    );
}
