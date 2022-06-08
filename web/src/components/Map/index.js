import { Component } from 'react'
import mapboxgl from "mapbox-gl";
import './styles.css'

class Map extends Component {
    constructor(props) {
        super(props);
        //TODO: colocar token nas variáveis de ambiente
        mapboxgl.accessToken = 'pk.eyJ1IjoibGVvbmVsbW90YSIsImEiOiJja3k0ZmhmZWUwYmRzMnZwOGVzc3gzc3JtIn0._T-Ie9E_XOgWuGgLytYIAg';
        this.map = {}
        this.state = {
            locations: []
        }
        this.clickMarker = undefined
        this.currentMarkers = []
    }

    componentDidMount = () => {
        this.createMap()
        this.addLocations()
    }

    componentDidUpdate = () => {
        if (this.props.locations.response !== this.state.locations.response) {
            this.addLocations()
            this.setState({ locations: this.props.locations })
        }
    }

    createMap = () => {
        console.log('dentro de create map')
        if (this.map.current) return
        this.map.current = new mapboxgl.Map({
            container: "mapContainer",
            style: "mapbox://styles/mapbox/streets-v11",
            center: [-43.96, -19.91],
            zoom: 12,
        });
        const nav = new mapboxgl.NavigationControl();
        this.map.current.addControl(nav, "top-right");
        this.map.current.on('click', e => this.clickEvent(e))
    }

    clickEvent = (e) => {
        console.log('click event', e.lngLat)
        if (this.clickMarker !== undefined) {
            console.log('removendo marker', this.clickMarker)
            this.clickMarker.remove()
            }
        this.clickMarker = new mapboxgl.Marker({ color: '#A52A2A', scale: 0.5 })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                    .setHTML(
                        `<p>Ponto clicado</p>`
                    )
            )
            .addTo(this.map.current)
        console.log('marker element', this.clickMarker.getElement())
        this.props.sendClickedCoordinates(e.lngLat.lat, e.lngLat.lng)
    }

    addLocations() {
        console.log('dentro de addLocations', this.props)  

        this.currentMarkers.forEach((marker) => {
            marker.remove()
        })
        if (this.props.locations.response === undefined || this.props.locations.response.length === 0 || !this.map.current) {
            console.log('locations vazio')
            this.map.current.setCenter([0, 30])
            this.map.current.setZoom(1)
            return
        }
            

        var bounds = new mapboxgl.LngLatBounds();
        console.log()
        switch (this.props.locations.type) {
            case "Endereços":
                this.props.locations.response.forEach((end => {
                    bounds.extend(end.geom_json.coordinates)
                    const newMarker = new mapboxgl.Marker()
                        .setLngLat(end.geom_json.coordinates)
                        .setPopup(
                            new mapboxgl.Popup({ offset: 25 })
                                .setHTML(
                                    `<p><b>Id:</b> ${end.id}</p>
                                    <p><b>Tipo Logradouro:</b> ${end.tipo_logra}</p>
                                    <p><b>Nome do Logradouro:</b> ${end.nome_logra}</p>
                                    <p><b>Número:</b> ${end.numero}</p>
                                    <p><b>Bairro:</b> ${end.bairro || 'null'}</p>
                                    <p><b>Cidade:</b> ${end.cidade}</p>
                                    `
                                )
                        )
                        .addTo(this.map.current)
                    this.currentMarkers.push(newMarker)
                }))
                break
            case "Endereços Reversa":
                this.props.locations.response.forEach((end => {
                    bounds.extend(end.geom_json.coordinates)
                    const newMarker = new mapboxgl.Marker()
                        .setLngLat(end.geom_json.coordinates)
                        .setPopup(
                            new mapboxgl.Popup({ offset: 25 })
                                .setHTML(
                                    ` <div style="max-height: 200px; overflow: scroll;">
                                    <p><b>Id:</b> ${end.id}</p>
                                    <p><b>Tipo Logradouro:</b> ${end.tipo_logra}</p>
                                    <p><b>Nome do Logradouro:</b> ${end.nome_logra}</p>
                                    <p><b>Número:</b> ${end.numero}</p>
                                    <p><b>Bairro:</b> ${end.bairro || 'null'}</p>
                                    <p><b>Cidade:</b> ${end.cidade}</p>
                                    <p><b>Tipo:</b> ${end.tipo}</p>
                                    <p><b>Microrregião:</b> ${end.mg_microrregiao}</p>
                                    <p><b>Mesorregião:</b> ${end.mg_mesorregiao}</p>
                                    <p><b>Macrorregião:</b> ${end.mg_macrorregiao_2020}</p>
                                    <p><b>Região Geográfica Intermadiária:</b> ${end.mg_regiao_geografica_intermediaria}</p>
                                    <p><b>Região Geográfica Imediata:</b> ${end.mg_regiao_geografica_imediata}</p>
                                    <p><b>Polo Saúde:</b> ${end.mg_saude_polo}</p>
                                    <p><b>Bacia:</b> ${end.mpmg_bacias}</p>
                                    <p><b>Cimos:</b> ${end.mpmg_cimos}</p>
                                    <p><b>Comarca:</b> ${end.mpmg_comarca}</p>
                                    <p><b>CRDS:</b> ${end.mpmg_crds}</p>
                                    <p><b>CREDCA:</b> ${end.mpmg_credca}</p>
                                    <p><b>RISP:</b> ${end.risp}</p>
                                    <p><b>RISP ACISP:</b> ${end.risp_acisp}</p>
                                    <p><b>RISP AISP:</b> ${end.risp_aisp}</p>
                                    <p><b>RISP Região:</b> ${end.risp_regiao}</p>
                                    </div>
                                    `
                                )
                        )
                        .addTo(this.map.current)
                    this.currentMarkers.push(newMarker)
                }))

                break
            case "Endereços CEP":
                this.props.locations.response.forEach((end => {
                    bounds.extend(end.geom.coordinates)
                    const newMarker = new mapboxgl.Marker()
                        .setLngLat(end.geom.coordinates)
                        .setPopup(
                            new mapboxgl.Popup({ offset: 25 })
                                .setHTML(
                                    `<p><b>Id:</b> ${end.id}</p>
                                    <p><b>Tipo Logradouro:</b> ${end.tipo_logra}</p>
                                    <p><b>Nome do Logradouro:</b> ${end.nome_logra}</p>
                                    <p><b>Número:</b> ${end.numero}</p>
                                    <p><b>Bairro:</b> ${end.bairro || 'null'}</p>
                                    <p><b>Cidade:</b> ${end.cidade}</p>
                                    `
                                )
                        )
                        .addTo(this.map.current)
                    this.currentMarkers.push(newMarker)
                }))

                break
            case "Lugares":
                this.props.locations.response.forEach((plc => {
                    if (plc.objeto.type !== "Point") return
                    bounds.extend(plc.objeto.coordinates)
                    const newMarker = new mapboxgl.Marker()
                        .setLngLat(plc.objeto.coordinates)
                        .setPopup(
                            new mapboxgl.Popup({ offset: 25 })
                                .setHTML(
                                    `
                                    <div style="max-height: 200px; overflow: scroll;">
                                    <p><b>Id:</b> ${plc.place_id}</p>
                                    <p><b>Nome:</b> ${plc.nome}</p>
                                    <p><b>Tipo:</b> ${plc.tipo}</p>
                                    <p><b>Microrregião:</b> ${plc.mg_microrregiao}</p>
                                    <p><b>Mesorregião:</b> ${plc.mg_mesorregiao}</p>
                                    <p><b>Macrorregião:</b> ${plc.mg_macrorregiao_2020}</p>
                                    <p><b>Região Geográfica Intermadiária:</b> ${plc.mg_regiao_geografica_intermediaria}</p>
                                    <p><b>Região Geográfica Imediata:</b> ${plc.mg_regiao_geografica_imediata}</p>
                                    <p><b>Polo Saúde:</b> ${plc.mg_saude_polo}</p>
                                    <p><b>Bacia:</b> ${plc.mpmg_bacias}</p>
                                    <p><b>Cimos:</b> ${plc.mpmg_cimos}</p>
                                    <p><b>Comarca:</b> ${plc.mpmg_comarca}</p>
                                    <p><b>CRDS:</b> ${plc.mpmg_crds}</p>
                                    <p><b>CREDCA:</b> ${plc.mpmg_credca}</p>
                                    <p><b>RISP:</b> ${plc.risp}</p>
                                    <p><b>RISP ACISP:</b> ${plc.risp_acisp}</p>
                                    <p><b>RISP AISP:</b> ${plc.risp_aisp}</p>
                                    <p><b>RISP Região:</b> ${plc.risp_regiao}</p>
                                    </div>
                                    `
                                )
                        )
                        .addTo(this.map.current)
                    this.currentMarkers.push(newMarker)
                }))
                break
            case "Lugares Direta":
                this.props.locations.response.forEach((plc => {
                    if (!plc.point) return
                    bounds.extend(plc.point.coordinates)
                    const newMarker = new mapboxgl.Marker()
                        .setLngLat(plc.point.coordinates)
                        .setPopup(
                            new mapboxgl.Popup({ offset: 25 })
                                .setHTML(
                                    `<p><b>Id:</b> ${plc.place_id}</p>
                                    <p><b>Nome:</b> ${plc.name}</p>
                                    `
                                )
                        )
                        .addTo(this.map.current)
                    this.currentMarkers.push(newMarker)
                }))
                break
            default:
        }
        this.map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }

    render() {
        return (
            <div class="row" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div id="mapContainer" className="map-container" style={{ height: "600px", width: "80%" }}></div>
            </div >
        )
    }
}

export default Map
