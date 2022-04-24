import Map from '../../../Map'
import ApiClient from '../../../../clients/api'
import { Component } from "react"
import '../../../Pages/styles.css'
import Select from 'react-select';

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
        this.typeOptions = [
            { value: 'Endereços Reversa', label: 'Endereços' },
            { value: 'Lugares', label: 'Lugares' }
        ]
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        let response = []
        if (this.state.type === "Endereços Reversa") {
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
            <div className='page'>
                <form name="form" class="form" onSubmit={this.handleSubmit}>
                    <div class="form-inline">
                        <div class="input input-type">
                            <Select
                                style={{ maxWidth: '100%' }}
                                onChange={e => this.setState({ type: e.value }, () => console.log('setando type', this.state.type))}
                                options={this.typeOptions}
                                defaultOptions
                                cacheOptions

                            />

                        </div>
                        <div class=" input input-lat">
                            <input
                                style={{ maxWidth: '100%' }}
                                type="number"
                                name="lat"
                                id="lat"
                                class="form-control"
                                required
                                placeholder="Latitude"
                                value={this.state.latitude}
                                onChange={e => this.setState({ latitude: Number(e.target.value) })}
                            />
                        </div>
                        <div class=" input input-long">
                            <input
                                style={{ maxWidth: '100%' }}
                                type="number"
                                name="long"
                                id="long"
                                class="form-control"
                                required
                                placeholder="Longitude"
                                value={this.state.longitude}
                                onChange={e => this.setState({ longitude: Number(e.target.value) })}
                            />
                        </div>
                        <div class=" input input-limite">
                            <input
                                style={{ maxWidth: '100%' }}
                                type="number"
                                min="1" step="1"
                                name="limite"
                                id="limite"
                                class="form-control"
                                required
                                placeholder="Limite"
                                value={this.state.limite}
                                onChange={e => this.setState({ limite: Number(e.target.value) })}
                            />
                        </div>
                        <button class="input btn" type="submit">Buscar</button>
                    </div>

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