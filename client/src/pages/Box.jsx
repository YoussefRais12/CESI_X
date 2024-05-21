import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import '../styles/box.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Box() {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);

  const user = useSelector((state) => state.user?.user); // Assuming user details include role
  const navigate = useNavigate();

  
  // Check for permission
  useEffect(() => {
   
    const allowedRoles = ['chef service hse','responsable erp']; // Define appropriate roles that can access
    if (!allowedRoles.includes(user?.role)) {
      navigate('/error'); // Redirect to the Error page
    }
  }, [user, navigate]);

  const handleFile = (e) => {
    let fileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setExcelFile(e.target.result);
          const workbook = XLSX.read(e.target.result, { type: 'buffer' });
          setSheetNames(workbook.SheetNames);
        };
      } else {
        setTypeError('Please select only excel file types');
        setExcelFile(null);
      }
    } else {
      console.log('Please select your file');
    }
  };

  const handleFileSubmit = (e) => {
    e.preventDefault();
    if (excelFile !== null && selectedSheet !== "") {
      const workbook = XLSX.read(excelFile, { type: 'buffer' });
      const worksheet = workbook.Sheets[selectedSheet];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(data);
    }
  };

  const handleSheetChange = (e) => {
    setSelectedSheet(e.target.value);
  };

  return (
    <div className="wrapper">
      <h3>Upload & View Excel Sheets</h3>

      <form className="form-group custom-form" onSubmit={handleFileSubmit}>
        <input type="file" className="form-control" required onChange={handleFile} />
        <select className="form-control" value={selectedSheet} onChange={handleSheetChange} required>
          <option value="" disabled>Select a sheet</option>
          {sheetNames.map((sheetName, index) => (
            <option key={index} value={sheetName}>{sheetName}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-success btn-md">UPLOAD</button>
        {typeError && (
          <div className="alert alert-danger" role="alert">{typeError}</div>
        )}
      </form>

      <div className="viewer">
        {excelData ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((individualExcelData, index) => (
                  <tr key={index}>
                    {Object.keys(individualExcelData).map((key) => (
                      <td key={key}>{individualExcelData[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>No File is uploaded yet!</div>
        )}
      </div>
    </div>
  );
}

export default Box;
