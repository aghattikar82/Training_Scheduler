import React from 'react';
import TrainingForm from './components/TrainingForm'; // Importing the TrainingForm component
import 'bootstrap/dist/css/bootstrap.min.css';
function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <main>
        <TrainingForm /> {/* Rendering the TrainingForm component */}
      </main>
    </div>
  );
}

export default App;
