import carettaLogo from './assets/carettaLogo.svg';
import './App.css';

function App() {
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={carettaLogo} width="200" alt="Caretta Logo" />
        </div>
        <div>
          <h2>Get started</h2>
          <p>Appointment care, with a soft shell</p>
        </div>
      </section>
    </>
  );
}

export default App;
