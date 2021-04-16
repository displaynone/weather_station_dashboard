<template>
	<div>
		<CRow class="row">
			<CCol sm="12" lg="12">
				<CWidgetDropdown color="info" header="Temperatura / Presión">
					<template #default>
						<span>
							<TemperatureIcon class="icon"/>
							<PressureIcon class="icon"/>
						</span>
					</template>
					<template #footer>
						<CChartBarExpert
							pointed
							class="mt-3 mx-3"
							:data-points="temperaturePressureDatasets"
							point-hover-background-color="primary"
							label="ºC"
							style="height: 200px"
							:options="options"
							:labels="labels"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
		</CRow>
	</div>
</template>

<script>
import { TemperatureIcon, PressureIcon } from '~/components/icons';
import { CChartBarExpert } from "../charts/index.js";
import { getColor } from '@coreui/utils/src';

const numberOfDays = 14;

const yAxes = ( fontColor = 'rgba( 255, 255, 255, 0.9 )' ) => {
	return {
		display: true,
		gridLines: {
			display: false,
		},
		ticks: {
			fontColor,
			fontSize: 14,
			stepSize: 2,
			beginAtZero: false,
		}
	};
};

export default {
	name: "TemperaturePressureWidget",
	// icons: { cilCaretTop },
	components: { CChartBarExpert, TemperatureIcon, PressureIcon },
	data() {
		return {
			daysLabels: [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ],
			temperature: [],
			pressure: [],
			labels: [],
			options: {
				scales: {
					yAxes: [
						{
							id: 'pressure',
							... yAxes(),
							position: 'right',
						},
						{
							id: 'temperature',
							... yAxes( 'rgba( 0, 0, 0, 0.9 )' ),
						},
					],
					xAxes: [
						{
							display: true,
							ticks: {
								fontColor: 'rgba( 255, 255, 255, 0.9 )',
								fontSize: 14,
								stepSize: 2,
								beginAtZero: false,
							},
						},
					],
				},
				elements: {
					point: {
						radius: 2,
					},
				},
			},
		}
	},
	computed: {
		temperaturePressureDatasets: function() {
			return [
				{
					yAxisID: 'pressure',
					data: this.pressure,
					borderColor: getColor( 'rgba(255, 255, 255, 0.7)' ),
					borderWidth: 2,
					borderCapStyle: 'square',
					backgroundColor: getColor( 'transparent' ),
					type: 'line',
					label: 'hPa',
					tooltipLabelColor: getColor( 'rgba(255, 255, 255, 0.7)' ),
					tension: 0.1,
				}, {
					yAxisID: 'temperature',
					data: this.temperature,
					type: 'line',
					borderColor: getColor( 'rgba(0, 0, 0, 0.7)' ),
					borderWidth: 2,
					backgroundColor: getColor( 'transparent' ),
					tooltipLabelColor: getColor( 'rgba(0, 0, 0, 0.7)' ),
					tension: 0.1,
				},
			];
		},
	},
	async fetch() {
		const today = new Date();
		// const today = new Date( 2021, 2, 23 );
		const rawData = await this.$axios.$get(
			// `/data/group-by-period?day=${ today.getDate() }&month=${ today.getMonth() + 1 }&year=${ today.getFullYear() }&lastdays=true&average=true&offset=${ numberOfDays }`
			process.env.apiServer + `data/group-by-period?day=${ today.getDate() }&month=${ today.getMonth() + 1 }&year=${ today.getFullYear() }&lastdays=true&average=true&offset=${ numberOfDays }`
		);
		rawData.forEach( item => {
			this.temperature.push( item.temperature.toFixed( 1 ) );
			this.pressure.push( item.pressure.toFixed( 1 ) );
			this.labels.push( `${ this.daysLabels[ item.day_of_week ] } ${ item.day_of_month}` );
		} );
	},
	fetchOnServer: false,
};
</script>
<style lang="scss" scoped>
	.icon {
		opacity: 0.5;
		height: 48px;
	}
</style>
