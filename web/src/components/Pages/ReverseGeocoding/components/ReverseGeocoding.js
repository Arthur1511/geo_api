import Map from '../../../Map'
import ApiClient from '../../../../clients/api'
import { Component } from "react"

class ReverseGeocoding extends Component {
    constructor(props) {
        super(props)
        this.apiClient = new ApiClient()
        this.state = {
            locations: [],
            latitude: "",
            longitude: "",
            limite: 5,
            type: "Endereços"
        }
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        let response = []
        if (this.state.type === "Endereços") {
            console.log(this.state.type, "Endereços", this.state.type === "Endereços")
            response = await this.apiClient.getAddressReverseGeocoding({
                "lat": this.state.latitude,
                "long": this.state.longitude,
                "limite": this.state.limite
            });
        }
        else if (this.state.type === "Lugares") {
            console.log(this.state.type, "Lugares", this.state.type === "Lugares")
            response = await this.apiClient.getPlaceReverseGeocoding({
                "lat": this.state.latitude,
                "long": this.state.longitude,
                "limite": this.state.limite
            });
        }
        else {
            console.error("Tipo selecionado errado, deve ser 'Endereços' ou 'Lugares'.")
        }

        console.log('response', response)
        this.setState({ locations: response.data });
    }

    getClickedCoordinates(lat, long) {
        console.log('lat long', lat, long)
        this.setState({ latitude: lat })
        this.setState({ longitude: long })
    }
    render() {
        return (
            <div>
                <form name="Geoform" onSubmit={this.handleSubmit}>

                    <div className="input-group">
                        <div className="input-type">
                            {/* <input
                                list="types"
                                // name="types"
                                // id="types"
                                // required
                                value={this.state.type}
                                onChange={e => this.setState({ type: e.target.value })}
                            />
                            <datalist id="types">
                                <option value="Endereços" defaultChecked />
                                <option value="Lugares" />
                            </datalist> */}
                            <select name="types" id="types" onChange={e => this.setState({ type: e.target.value }, () => console.log('setando type', this.state.type))} value={this.state.type}>
                                <option value="Endereços">Endereços</option>
                                <option value="Lugares">Lugares</option>
                            </select>

                        </div>
                        <div className="input-lat">
                            <input
                                type="number"
                                name="lat"
                                id="lat"
                                required
                                placeholder="Latitude"
                                value={this.state.latitude}
                                onChange={e => this.setState({ latitude: Number(e.target.value) })}
                            />
                        </div>
                        <div className="input-long">
                            <input
                                type="number"
                                name="long"
                                id="long"
                                required
                                placeholder="Longitude"
                                value={this.state.longitude}
                                onChange={e => this.setState({ longitude: Number(e.target.value) })}
                            />
                        </div>
                        <div className="input-limite">
                            <input
                                type="number"
                                min="1" step="1"
                                name="limite"
                                id="limite"
                                required
                                placeholder="Limite"
                                value={this.state.limite}
                                onChange={e => this.setState({ limite: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <button type="submit">Buscar</button>
                </form>

                <Map id="mapContainer"
                    sendClickedCoordinates={this.getClickedCoordinates.bind(this)}
                    locations={{ "response": this.state.locations, "type": this.state.type }}
                />
            </div>
        )
    }
}

export default ReverseGeocoding