import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
    height: '80vh',
    width: '80vw',
    center: true
}
// const center = {
//     lat: -14.2400732,
//     lng: -53.1805017,
// }


function Map({ loc }) {

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    })

    if (loadError) return "Error loading Maps";
    if (!isLoaded) return "Loading Maps";

    function averageGeolocation(coords) {
        if (coords.length === 0) {
            return {
                lat: -14.2400732,
                lng: -53.1805017,
            };
        }
        if (coords.length === 1) {
            return coords[0];
        }

        let x = 0.0;
        let y = 0.0;
        let z = 0.0;

        for (let coord of coords) {
            let latitude = coord.lat * Math.PI / 180;
            let longitude = coord.long * Math.PI / 180;

            x += Math.cos(latitude) * Math.cos(longitude);
            y += Math.cos(latitude) * Math.sin(longitude);
            z += Math.sin(latitude);
        }

        let total = coords.length;

        x = x / total;
        y = y / total;
        z = z / total;

        let centralLongitude = Math.atan2(y, x);
        let centralSquareRoot = Math.sqrt(x * x + y * y);
        let centralLatitude = Math.atan2(z, centralSquareRoot);
        return {
            lat: centralLatitude * 180 / Math.PI,
            lng: centralLongitude * 180 / Math.PI
        };

    }

    return (

        <div className="Map" align='center' >

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={averageGeolocation(loc)}
                zoom={4}
            >
                {/* <Marker position={center}></Marker> */}
                {loc.map(location => (

                    <Marker key={location.place_id} position={{
                        lat: location.lat,
                        lng: location.long,
                    }} />))}
            </GoogleMap>

        </div>
    );
}

export default Map;
