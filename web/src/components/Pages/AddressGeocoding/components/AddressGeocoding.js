import Map from '../../../Map'
import ApiClient from '../../../../clients/api'
import { Component } from "react"
import '../../../Pages/styles.css'

class AddressGeocoding extends Component {
    constructor(props) {
        super(props)
        this.apiClient = new ApiClient()
        this.state = {
            locations: [],
            address: "",
            type: "Endereços",
            clickedLat: "",
            clickedLong: ""
        }
    }

    getClickedCoordinates(lat, long) {
        console.log('lat long', lat, long)
        this.setState({ clickedLat: lat })
        this.setState({ clickedLong: long })
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        const response = await this.apiClient.getAddressGeocoding({ "end": this.state.address });
        console.log('response', response)
        this.setState({ locations: response.data })
    }

    render() {
        return (
            <div class='page'>

                <form class="form" name="form" onSubmit={this.handleSubmit}>

                    <div class="form-inline ">
                        <div class="input input-address">
                            {/* <label for="address" class='label'>Endereço</label> */}
                            <input
                                style={{ width: '100%' }}
                                class="form-control"
                                type="text"
                                name="address"
                                id="addressInput"
                                required
                                placeholder="Insira o endereço completo"
                                value={this.state.address}
                                onChange={e => this.setState({ address: e.target.value })}
                            />
                        </div>
                        <button class="input btn" type="submit">Buscar</button>
                    </div>

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