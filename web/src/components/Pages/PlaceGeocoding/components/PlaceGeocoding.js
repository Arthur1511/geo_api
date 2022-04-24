import Map from '../../../Map'
import ApiClient from '../../../../clients/api'
import { Component } from "react"
import AsyncSelect from 'react-select/async';
import '../../../Pages/styles.css'
import '../../../../App.css'

class AddressGeocoding extends Component {
    constructor(props) {
        super(props)
        this.apiClient = new ApiClient()
        this.state = {
            locations: [],
            name: "",
            type: "Lugares Direta",
            clickedLat: "",
            clickedLong: "",
            selectedState: { value: "Todos os estados", label: "Todos os estados" },
            selectedMeso: { value: 'Todas as mesorregiões', label: 'Todos as mesorregiões' }
        }
        this.states = []
        this.mesos = []
    }

    getStatesSelectOptions = async () => {
        this.states = await (await this.apiClient.getEstados({})).data
        const statesOptions = [
            { value: 'Todos os estados', label: 'Todos os estados' },
            ...this.states.map((state) => { return { value: state.id, label: state.name } })
        ]
        console.log('statesOptions', statesOptions)
        return statesOptions
    }
    getMesosSelectOptions = async () => {
        console.log('dentro de getMesos, selectedState:', this.state.selectedState.value)
        if (this.state.selectedState.value === "Todos os estados") return
        this.mesos = await (await this.apiClient.getMeso({ estado_id: this.state.selectedState.value })).data
        const mesosOptions = [
            { value: 'Todas as mesorregiões', label: 'Todos as mesorregiões' },
            ...this.mesos.map((meso) => { return { value: meso.nomemeso, label: meso.nomemeso } })
        ]
        console.log('mesosOptions', mesosOptions)
        return mesosOptions
    }

    handleSubmit = async (e) => {
        console.log('dentro do submitt')
        e.preventDefault();
        // TODO: caso selectedState ou Meso sejam padrão -> não enviar nada
        let response = []
        if (this.state.selectedMeso.label !== "Todas as mesorregiões") {
            response = await this.apiClient.getPlaceGeocoding({ "nome": this.state.name, "estado": this.state.selectedState.label, "meso": this.state.selectedMeso.label });
        }
        else if (this.state.selectedState.label !== "Todos os estados") {
            response = await this.apiClient.getPlaceGeocoding({ "nome": this.state.name, "estado": this.state.selectedState.label });
        }
        else {
            response = await this.apiClient.getPlaceGeocoding({ "nome": this.state.name });
        }

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
            <div class='page'>
                <form name="form" class="form" onSubmit={this.handleSubmit}>

                    <div class="form-inline " >
                        <div class='input'>
                            {/* <label for="name" class='label'>Nome do lugar</label> */}
                            <input
                                class='form-control'
                                type="text"
                                name="name"
                                id="name"
                                required
                                placeholder="Nome"
                                value={this.state.name}
                                onChange={(e) => this.setState({ name: e.target.value })}
                            />
                        </div>
                        <div class='input input-select'>
                            {/* <label for='stateSelection'>Selecione o estado</label> */}
                            <AsyncSelect
                                name="stateSelection"
                                id="stateSelection"
                                placeholder="Selecione o estado"
                                loadOptions={this.getStatesSelectOptions}
                                onChange={e => this.setState({ selectedState: e }, () => { })}
                                defaultOptions
                                cacheOptions
                            />
                        </div>
                        <div class='input input-select'>
                            {/* <label for='mesoSelection'>Selecione a mesorregião</label> */}
                            <AsyncSelect
                                key={this.state.selectedState.value}
                                name="mesoSelection"
                                id="mesoSelection"
                                placeholder="Selecione a mesorregião"
                                loadOptions={this.getMesosSelectOptions}
                                onChange={e => this.setState({ selectedMeso: e })}
                                defaultOptions
                                cacheOptions
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