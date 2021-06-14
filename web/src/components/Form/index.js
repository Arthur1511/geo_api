import React from "react";
import "./styles.css";


function GeoForm({handleSubmit}) {


    return (

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
                    />

                </div>
            </div>
            <button type="submit">Buscar</button>


        </form>
    );
}

export default GeoForm;