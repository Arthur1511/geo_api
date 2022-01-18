import Map from '../../../Map'
import ApiClient from '../../../../clients/api'
import { Component } from "react"

class AddressGeocoding extends Component {
    constructor(props) {
        super(props)
        this.apiClient = new ApiClient()
        this.state = {
            locations: [],
            name: "",
            type: "Lugares Direta",
            clickedLat: "",
            clickedLong: ""
        }
    }

    handleSubmit = async (e) => {
        console.log('dentro do submitt')
        e.preventDefault();
        const response = await this.apiClient.getPlaceGeocoding({ "nome": this.state.name });
        console.log('response', response)
        this.setState({ locations: response.data })
    }

    getClickedCoordinates(lat, long) {
        console.log('lat long', lat, long)
        this.setState({ clickedLat: lat })
        this.setState({ clickedLong: long })
    }
    render() {
        return (
            <div>
                <form name="Geoform" onSubmit={this.handleSubmit}>

                    <div className="input-group">
                        <div className="input-name">
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                placeholder="Nome"
                                value={this.state.name}
                                onChange={(e) => this.setState({ name: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit">Buscar</button>
                </form>

                <Map id="mapContainer"
                    sendClickedCoordinates={this.getClickedCoordinates.bind(this)}
                    locations={{ "response": this.state.locations, "type": this.state.type }}
                />
            </div >
        )
    }
}

export default AddressGeocoding