import Map from '../../../Map'
import ApiClient from '../../../../clients/api'
import { Component } from "react"
import '../../../Pages/styles.css'

class AddressGeocodingByCEP extends Component {
    constructor(props) {
        super(props)
        this.apiClient = new ApiClient()
        this.state = {
            locations: [],
            cep: "",
            type: "Endereços CEP",
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
        const response = await this.apiClient.getAddressesByCEP({ "cep": this.state.cep });
        console.log('response', response)
        this.setState({ locations: response.data })
        this.setState({ address: this.currentAddress })
    }

    render() {
        return (
            <div className='page'>
                <form name="form" class="form" onSubmit={this.handleSubmit}>

                    <div class="form-inline ">
                        <div class="input">
                            <input
                                type="text"
                                name="cep"
                                class="form-control"
                                id="cepInput"
                                required
                                placeholder="Insira o CEP"
                                value={this.state.cep}
                                onChange={e => this.setState({ cep: e.target.value })}
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

export default AddressGeocodingByCEP