import logo from './Logo_mpmg.png';
import React from "react";
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import './App.css';
import PlaceGeocoding from './components/Pages/PlaceGeocoding';
import AddressGeocoding from './components/Pages/AddressGeocoding';
import ReverseGeocoding from './components/Pages/ReverseGeocoding';
import AddressGeocodingByCEP from './components/Pages/AddressGeocodingByCEP'
import AddressGeocodingStructured from "./components/Pages/AddressGeocodingStructured";
import Navbar from './components/Navbar';

function App() {

  return (
    <div className="App" >
      <header>
        <div className="App-header">
          <h1>Geocodificação<img className="logo" src={logo} alt="MPMG" /></h1>
        </div>
      </header>

      <BrowserRouter>
        <div class="row">

          <Navbar />

          <div class="col-sm">
            <Routes>
              <Route path="/" element={<AddressGeocoding />} />
              <Route path="/address_geocoding" element={<AddressGeocoding />} />
              <Route path="/place_geocoding" element={<PlaceGeocoding />} />
              <Route path="/reverse_geocoding" element={<ReverseGeocoding />} />
              <Route path="/address_geocoding_cep" element={<AddressGeocodingByCEP />} />
              <Route path="/address_geocoding_structured" element={<AddressGeocodingStructured />} />
            </Routes>
          </div>
        </div>


      </BrowserRouter>

    </div>


  );
}

export default App;
