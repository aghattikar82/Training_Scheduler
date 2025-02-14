import React, { useState } from "react";
import moment from "moment-timezone";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { countryData } from "./country"; // Importing your countryData
import { courseList } from "./coursename"; // Importing the course list

const App = () => {
  const [rows, setRows] = useState([]);
  const [modeOfTraining, setModeOfTraining] = useState("Online");
  const [courseName, setCourseName] = useState("");
  const [selectedDates, setSelectedDates] = useState([]); // Selected Dates from DatePicker
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [baseTimezone, setBaseTimezone] = useState("America/New_York");

  // Available base timezones for the dropdown
  const timezones = ["Asia/Kolkata", "America/New_York", "Europe/London", "Australia/Sydney", "Asia/Singapore"];

  // Add or remove a date to/from the selectedDates array
  const handleDateChange = (date) => {
    if (!date) return;

    // Check if the date is already selected
    const isAlreadySelected = selectedDates.some(
      (selectedDate) =>
        moment(selectedDate).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD")
    );

    // If already selected, remove it; otherwise, add it.
    if (isAlreadySelected) {
      setSelectedDates(
        selectedDates.filter(
          (selectedDate) =>
            moment(selectedDate).format("YYYY-MM-DD") !== moment(date).format("YYYY-MM-DD")
        )
      );
    } else {
      setSelectedDates([...selectedDates, date].sort((a, b) => a - b)); // Sort dates
    }
  };

  // Generate Dates String
  const generateDatesString = () => {
    return selectedDates.map((date) => moment(date).format("YYYY-MM-DD")).join("|");
  };

  // Function to format the Schedule Name
  const formatScheduleName = (startDate, endDate) => {
    const start = moment(startDate).format("MMM DD");
    const end = moment(endDate).format("MMM DD, YYYY");

    if (start === end) {
      // If start and end are the same, only display one date
      return start;
    } else {
      return `${start} - ${end}`;
    }
  };

  // Function to add a new row
  const addRow = () => {
    if (selectedDates.length === 0) {
      alert("Please select at least one date.");
      return;
    }

    const id = rows.length + 1;
    const startDate = moment(selectedDates[0]).format("YYYY-MM-DD");
    const endDate = moment(selectedDates[selectedDates.length - 1]).format("YYYY-MM-DD");
    const dates = generateDatesString();
    const scheduleName = formatScheduleName(startDate, endDate);

    const newRow = {
      ID: id,
      Mode_of_Training: modeOfTraining,
      Course_Name: courseName,
      Schedule_Name: scheduleName, // New column for Schedule Name
      Start_Date: startDate,
      End_Date: endDate,
      Dates: dates,
      Selected_Timezone: baseTimezone,
      Start_Time: startTime,
      End_Time: endTime,
    };

    setRows([...rows, newRow]);

    // Clear input fields
    setModeOfTraining("Online");
    setCourseName("");
    setSelectedDates([]);
    setStartTime("");
    setEndTime("");
    setBaseTimezone("America/New_York");
  };

  // Automatically update timezone when a new one is selected
  const handleTimezoneChange = (event) => {
    setBaseTimezone(event.target.value);
  };

  // Function to delete a row based on the index
  const handleDeleteRow = (indexToDelete) => {
    // Filter out the row that matches the index
    const updatedRows = rows.filter((_, index) => index !== indexToDelete);

    // Update the rows state with the remaining rows
    setRows(updatedRows);
  };
 

  // Function to download the Excel file
  const handleDownloadExcel = () => {
    // Format the user input rows with dates in Indian format (DD-MM-YYYY)
    const userInput = rows.map((row) => ({
      ...row,
      Start_Date: moment(row.Start_Date).format("DD-MM-YYYY"), // Format Start Date in Indian format
      End_Date: moment(row.End_Date).format("DD-MM-YYYY"), // Format End Date in Indian format
    }));

    const conversions = [];
    rows.forEach((row) => {
      countryData.forEach((entry) => {
        const convertedStart = moment
          .tz(`${row.Start_Date} ${row.Start_Time}`, row.Selected_Timezone) // Use the row's Selected_Timezone
          .tz(entry.timezone);
        const convertedEnd = moment
          .tz(`${row.End_Date} ${row.End_Time}`, row.Selected_Timezone) // Use the row's Selected_Timezone
          .tz(entry.timezone);

        conversions.push({
          ID: row.ID,
          Country: entry.country,
          City: entry.city,
          Region: entry.region,
          "Start Date": convertedStart.format("YYYY-MM-DD"),
          "Start Time": convertedStart.format("HH:mm:ss"),
          "End Date": convertedEnd.format("YYYY-MM-DD"),
          "End Time": convertedEnd.format("HH:mm:ss"),
          Timezone: entry.timezone,
        });
      });
    });

    // Create the workbook and add both sheets
    const workbook = XLSX.utils.book_new();

    // Sheet 1: User Input with Indian date format
    const userInputSheet = XLSX.utils.json_to_sheet(userInput);
    XLSX.utils.book_append_sheet(workbook, userInputSheet, "Sheet1");

    // Sheet 2: Timezone conversions (original logic)
    const conversionSheet = XLSX.utils.json_to_sheet(conversions);
    XLSX.utils.book_append_sheet(workbook, conversionSheet, "Sheet2");

    // Download the Excel file
    XLSX.writeFile(workbook, "timezone_conversions.xlsx");
  };

  return (
    <div className="App container mt-2">
      <h1 className="text-center mb-1 text-primary">Timezone Converter</h1>

      {/* Course Details Section */}
      <div className="card mb-2">
        <div className="card-body">
          <h4 className="card-title text-center mb-1">Course Details</h4>
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Mode of Training:</label>
              <select
                className="form-select"
                value={modeOfTraining}
                onChange={(e) => setModeOfTraining(e.target.value)}
              >
                <option value="">Select Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Course Name:</label>
              <input
                className="form-control"
                list="courseList"
                placeholder="Enter or select course"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
              <datalist id="courseList">
                {courseList.map((course, index) => (
                  <option key={index} value={course} />
                ))}
              </datalist>
            </div>
          </div>
        </div>
      </div>

      {/* Time Selection Section */}
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title text-center mb-4">Time Selection</h4>
          <div className="row mb-3" align="right">
            <div className="col-md-3">
              <label className="form-label">Select Multiple Dates (Click to toggle):</label>
              <DatePicker
                inline
                selected={null}
                onSelect={handleDateChange}
                highlightDates={selectedDates}
                dayClassName={(date) =>
                  selectedDates.some(
                    (selectedDate) =>
                      moment(selectedDate).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD")
                  )
                    ? "highlighted-date"
                    : undefined
                }
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Start Time:</label>
              <input
                type="time"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">End Time:</label>
              <input
                type="time"
                className="form-control"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Base Timezone:</label>
              <select
                className="form-select"
                value={baseTimezone}
                onChange={(e) => setBaseTimezone(e.target.value)}
              >
                {timezones.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center mb-4">
        <button className="btn btn-primary me-3" onClick={addRow}>
          Add Course
        </button>
        <button className="btn btn-success" onClick={handleDownloadExcel}>
          Download Excel
        </button>
      </div>

      {/* Displaying Rows */}
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark text-center">
            <tr>
              <th>ID</th>
              <th>Mode of Training</th>
              <th>Course Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Dates</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Base Timezone</th>
              <th>Action</th> {/* Add a column for the delete action */}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.ID}>
                <td>{row.ID}</td>
                <td>{row.Mode_of_Training}</td>
                <td>{row.Course_Name}</td>
                <td>{row.Start_Date}</td>
                <td>{row.End_Date}</td>
                <td>{row.Dates}</td>
                <td>{row.Start_Time}</td>
                <td>{row.End_Time}</td>
                <td>{row.Selected_Timezone}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDeleteRow(index)}>Delete</button> {/* Delete button */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
