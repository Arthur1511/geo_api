import logo from './Logo_mpmg.png';
import React from "react";
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import './App.css';
import PlaceGeocoding from './components/Pages/PlaceGeocoding';
import AddressGeocoding from './components/Pages/AddressGeocoding';
import ReverseGeocoding from './components/Pages/ReverseGeocoding';
import AddressGeocodingByCEP from './components/Pages/AddressGeocodingByCEP'


function App() {

  return (
    <div className="App" >
      <header>
        <div className="header-content">
          <h1>Geolocation API <img className="logo" src={logo} alt="MPMG" /></h1>
        </div>
      </header>

      <main>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AddressGeocoding />} />
            <Route path="/address_geocoding" element={<AddressGeocoding />} />
            <Route path="/place_geocoding" element={<PlaceGeocoding />} />
            <Route path="/reverse_geocoding" element={<ReverseGeocoding />} />
            <Route path="/address_geocoding_cep" element={<AddressGeocodingByCEP />} />
          </Routes>
        </BrowserRouter>
      </main>

    </div>


  );
}

export default App;
