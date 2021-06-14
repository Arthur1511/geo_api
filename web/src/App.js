import logo from './Logo_mpmg.png';
import React, { useState } from "react";
import './App.css';
// import { BrowserRouter } from 'react-router-dom';
// import Routes from './Routes';
import api from "./services/api";

import Map from './components/Map';
// import Form from './components/Form';


function App() {
  const [locations, setLocations] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  // var locations;

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await api.post("/coord_estado", { "longitude": longitude, "latitude": latitude });

    setLocations(response.data);
    // locations = response.data;
    // console.log(locations);
    // setLocations([]);
  }

  return (
    <div className="App" >
      <header>
        <div className="header-content">
          <h1>Geolocation API <img className="logo" src={logo} alt="MPMG" /></h1>

        </div>

      </header>

      <main>
        {/* <BrowserRouter>
          <Routes />
        </BrowserRouter> */}
        <form name="Geoform" onSubmit={handleSubmit}>

          <div className="input-group">
            <div className="input-lat">
              {/* <label htmlFor="latitude" /> */}
              <input
                type="number"
                name="latitude"
                id="latitude"
                required
                placeholder="Latitude"
                value={latitude}
                onChange={e => setLatitude(Number(e.target.value))}
              />
            </div>

            <div className="input-long">
              {/* <label htmlFor="longitude" /> */}
              <input
                type="number"
                name="longitude"
                id="longitude"
                required
                placeholder="Longitude"
                value={longitude}
                onChange={e => setLongitude(Number(e.target.value))}
              />

            </div>
          </div>
          <button type="submit">Buscar</button>
        </form>

        <Map loc={locations} />
      </main>

    </div>


  );
}

export default App;
